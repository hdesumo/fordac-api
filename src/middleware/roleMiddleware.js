const jwt = require("jsonwebtoken");
const pool = require("../config/db");

module.exports = function roleMiddleware(rolesAllowed = []) {
  return async (req, res, next) => {
    try {
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ message: "Token manquant" });

      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userId = decoded.id;

      let userRole = null;

      // Vérifier Superadmin
      if (rolesAllowed.includes("superadmin")) {
        const check = await pool.query(
          `SELECT id FROM superadmin WHERE id = $1`,
          [userId]
        );
        if (check.rows.length > 0) userRole = "superadmin";
      }

      // Vérifier Admin
      if (rolesAllowed.includes("admin") && !userRole) {
        const check = await pool.query(
          `SELECT id FROM admins WHERE id = $1`,
          [userId]
        );
        if (check.rows.length > 0) userRole = "admin";
      }

      // Vérifier Member
      if (rolesAllowed.includes("member") && !userRole) {
        const check = await pool.query(
          `SELECT id FROM members WHERE id = $1`,
          [userId]
        );
        if (check.rows.length > 0) userRole = "member";
      }

      if (!userRole) {
        return res.status(403).json({
          message: "Accès non autorisé pour ce rôle."
        });
      }

      req.role = userRole;
      next();

    } catch (err) {
      console.error("Erreur roleMiddleware:", err);
      return res.status(401).json({ message: "Token invalide ou expiré." });
    }
  };
};
