const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db.js");

/**
 * ➕ Créer un admin (réservé au superadmin)
 */
exports.createAdmin = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Accès réservé au superadmin." });
    }

    const { name, email, password, phone, arrondissement } = req.body;

    const existing = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Cet email existe déjà." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role, arrondissement, departement, region, status)
       VALUES ($1, $2, $3, $4, 'admin', $5, 'Moungo', 'Littoral', 'active')
       RETURNING id, name, email, role, status`,
      [name, email, hashedPassword, phone, arrondissement]
    );

    res.status(201).json({
      message: "Admin créé avec succès.",
      admin: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur createAdmin:", error.message);
    res.status(500).json({ message: "Erreur interne serveur." });
  }
};

/**
 * 🔐 Connexion d’un admin
 */
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email=$1 AND role='admin'", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Admin non trouvé." });
    }

    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Erreur loginAdmin:", error.message);
    res.status(500).json({ message: "Erreur interne serveur." });
  }
};

/**
 * 📋 Liste des admins
 */
exports.getAdmins = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Accès réservé au superadmin." });
    }

    const result = await pool.query(
      "SELECT id, name, email, phone, arrondissement, status, created_at FROM users WHERE role='admin'"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erreur getAdmins:", error.message);
    res.status(500).json({ message: "Erreur interne serveur." });
  }
};

/**
 * 🔄 Modifier le rôle ou le statut d’un admin
 */
exports.updateAdminRole = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Accès réservé au superadmin." });
    }

    const { id } = req.params;
    const { role, status } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET role = COALESCE($1, role),
           status = COALESCE($2, status)
       WHERE id = $3 AND role='admin'
       RETURNING id, name, email, role, status`,
      [role, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Admin introuvable." });
    }

    res.json({
      message: "Rôle ou statut mis à jour avec succès.",
      admin: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur updateAdminRole:", error.message);
    res.status(500).json({ message: "Erreur interne serveur." });
  }
};
