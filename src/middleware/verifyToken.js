// src/middleware/verifyToken.js (CommonJS)

const jwt = require("jsonwebtoken");

// Vérifie que l'utilisateur est authentifié
const requireAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token invalide" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // injecte l'utilisateur dans la requête
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token non valide" });
  }
};

// Vérifie rôle superadmin uniquement
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Accès réservé au superadmin" });
  }
  next();
};

// Vérifie rôle admin OU superadmin
const requireAdmin = (req, res, next) => {
  if (!req.user || !["admin", "superadmin"].includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Accès réservé aux administrateurs" });
  }
  next();
};

// Export CommonJS
module.exports = {
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
};
