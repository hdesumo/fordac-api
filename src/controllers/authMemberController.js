const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // ← IMPORTANT

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM members WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email incorrect" });
    }

    const member = result.rows[0];

    const match = await bcrypt.compare(password, member.password);
    if (!match) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: member.id, role: "member" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        membership_level: member.membership_level,
        secteur: member.secteur,
        arrondissement: member.arrondissement,
        departement: member.departement
      }
    });
  } catch (error) {
     console.error("Erreur login membre :", error);
     res.status(500).json({ error: "Erreur serveur" });
  }
};
