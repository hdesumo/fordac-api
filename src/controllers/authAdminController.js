const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // ← IMPORTANT : bcryptjs seulement

// ADMIN LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifier l'existence de l'admin
    const result = await db.query("SELECT * FROM admins WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email incorrect" });
    }

    const admin = result.rows[0];

    // Vérification du password
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    // Génération du token
    const token = jwt.sign(
      { id: admin.id, role: "admin" },
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
        service: admin.service,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Erreur login admin :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
