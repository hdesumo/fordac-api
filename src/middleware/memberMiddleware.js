// middleware/memberMiddleware.js
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth) {
      return res.status(401).json({
        message: "Connexion requise. Veuillez vous identifier."
      });
    }

    const token = auth.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Token invalide ou expiré."
      });
    }

    const userId = decoded.id;

    // Vérification membre
    const result = await pool.query(
      `
      SELECT id, name, status, shadow_banned 
      FROM members 
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        message: "Accès réservé aux membres connectés."
      });
    }

    const member = result.rows[0];

    // Vérifier statut (ex : active, suspendu)
    if (member.status && member.status !== "active") {
      return res.status(403).json({
        message: "Votre adhésion n'est pas active."
      });
    }

    // Shadow-ban : accès total mais contributions bloquées
    if (member.shadow_banned === true) {
      req.member = {
        ...member,
        restricted: true
      };
      return next();
    }

    req.member = member;
    next();

  } catch (err) {
    console.error("Erreur memberMiddleware:", err);
    res.status(401).json({ message: "Erreur d'authentification." });
  }
};
