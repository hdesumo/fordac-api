const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // ← IMPORTANT

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM superadmin WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email incorrect" });
    }

    const superadmin = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, superadmin.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: superadmin.id, role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      superadmin: {
        id: superadmin.id,
        name: superadmin.name,
        email: superadmin.email
      }
    });
  } catch (error) {
    console.error("Erreur login superadmin :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
