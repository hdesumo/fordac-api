// controllers/authMemberController.js
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.loginMember = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    // Connexion par email OU téléphone
    const result = await db.query(
      `
      SELECT * FROM members 
      WHERE email=$1 OR phone=$2
      `,
      [email, phone]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Compte introuvable" });

    const member = result.rows[0];

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch)
      return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      {
        id: member.id,
        role: "member",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Connexion réussie",
      token,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
      },
    });
  } catch (err) {
    console.error("Erreur loginMember:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
