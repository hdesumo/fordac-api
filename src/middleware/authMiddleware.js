// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * ✅ Middleware générique : vérifier si un token JWT est présent et valide
 */
export const verifyToken = (req, res, next) => {
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
 * 🔐 Middleware : accès réservé aux admins OU superadmins
 */
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Accès interdit" });
  }
  next();
};

/**
 * 🔐 Middleware : réservé exclusivement au SuperAdmin
 */
export const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Accès réservé au SuperAdmin" });
  }
  next();
};
