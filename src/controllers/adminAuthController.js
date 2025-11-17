const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = `SELECT * FROM users WHERE email=$1 AND role='admin' LIMIT 1`;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Admin introuvable." });
    }

    const admin = result.rows[0];

    // Vérif mot de passe
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    // Générer token
    const token = jwt.sign(
      { id: admin.id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
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
    console.error("Erreur admin login:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};
