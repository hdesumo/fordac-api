const jwt = require("jsonwebtoken");
const pool = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth)
      return res.status(401).json({ message: "Token manquant." });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id;

    // Vérifier superadmin uniquement
    const check = await pool.query(
      `SELECT id, name FROM superadmin WHERE id = $1`,
      [userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({
        message: "Accès réservé au Président du FORDAC."
      });
    }

    req.superadmin = check.rows[0];
    next();

  } catch (err) {
    console.error("Erreur superadminMiddleware:", err);
    res.status(401).json({ message: "Token invalide ou expiré." });
  }
};
