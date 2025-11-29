const jwt = require("jsonwebtoken");

module.exports = function (roles = []) {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader)
      return res.status(401).json({ message: "Token manquant" });

    const token = authHeader.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Token invalide" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Vérifie le rôle si défini
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Accès non autorisé" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Token expiré ou invalide" });
    }
  };
};
