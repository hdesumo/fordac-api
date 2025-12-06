const jwt = require("jsonwebtoken");
const pool = require("../db");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token manquant." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer le membre dans la DB
    const result = await pool.query(
      "SELECT id, name, phone, email, status FROM members WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Membre non trouvé." });
    }

    const member = result.rows[0];

    // 🔥🔥🔥 FIX IMPORTANT 🔥🔥🔥
    req.member = {
      id: member.id,
      name: member.name,
      phone: member.phone,
      email: member.email,
      status: member.status
    };

    // (Tu peux garder req.user si tu veux)
    req.user = req.member;

    next();

  } catch (err) {
    console.error("Erreur auth membre:", err);
    return res.status(401).json({ error: "Token invalide ou expiré." });
  }
};
