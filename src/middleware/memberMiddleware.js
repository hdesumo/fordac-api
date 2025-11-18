// middleware/memberMiddleware.js

const jwt = require("jsonwebtoken");
const db = require("../db");

module.exports = async function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth)
    return res.status(401).json({ message: "Token manquant." });

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier existence du membre
    const query = "SELECT * FROM members WHERE id = $1";
    const result = await db.query(query, [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Membre introuvable." });
    }

    req.member = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide." });
  }
};
