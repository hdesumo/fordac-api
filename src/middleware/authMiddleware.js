// src/middleware/authMiddleware.js (CommonJS)

const jwt = require("jsonwebtoken");

/**
 * 🔐 Vérifie si un token JWT est valide
 */
const verifyToken = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ message: "Token manquant" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // contient id, email, role
    next();
  } catch (error) {
    console.error("Erreur verifyToken:", error.message);
    return res.status(401).json({ message: "Token invalide" });
  }
};

/**
 * 🔐 Accès réservé aux Admins OU SuperAdmins
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Accès interdit" });
  }
  next();
};

/**
 * 🔐 Accès réservé exclusivement au SuperAdmin
 */
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Accès réservé au SuperAdmin" });
  }
  next();
};

// EXPORT COMMONJS
module.exports = {
  verifyToken,
  requireAdmin,
  requireSuperAdmin,
};
