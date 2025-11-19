const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.loginMember = async (req, res) => {
  try {
    const { email, phone, pin } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ error: "Email ou téléphone requis." });
    }

    if (!pin) {
      return res.status(400).json({ error: "Code PIN requis." });
    }

    const emailOrPhone = email || phone;

    const query = `
      SELECT id, name, email, phone, password, status 
      FROM members 
      WHERE email = $1 OR phone = $1 
      LIMIT 1
    `;

    const result = await db.query(query, [emailOrPhone]);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(400).json({ error: "Compte introuvable." });
    }

    const member = result.rows[0];

    // 👉 Vérification du PIN
    const pinIsValid = await bcrypt.compare(pin, member.password);

    if (!pinIsValid) {
      return res.status(400).json({ error: "PIN incorrect." });
    }

    const token = jwt.sign(
      {
        id: member.id,
        role: "member",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        status: member.status,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
