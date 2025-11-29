const pool = require("../db.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔐 Connexion SuperAdmin
exports.superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ❗ Correction ici : ON UTILISE LA TABLE superadmin
    const result = await pool.query(
      "SELECT * FROM superadmin WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "SuperAdmin introuvable" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Connexion réussie",
      token,
      superadmin: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });

  } catch (err) {
    console.error("Erreur superAdminLogin :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


// 🔐 Mise à jour du mot de passe SuperAdmin
exports.updateSuperAdminPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // ❗ Ici aussi la table correcte est superadmin (et pas users)
    const email = "lepresident@fordac-connect.org";

    const result = await pool.query(
      "SELECT * FROM superadmin WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "SuperAdmin introuvable" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Ancien mot de passe incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE superadmin SET password = $1 WHERE email = $2",
      [hashedPassword, email]
    );

    res.json({
      success: true,
      message: "Mot de passe mis à jour avec succès"
    });

  } catch (error) {
    console.error("Erreur updateSuperAdminPassword :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
