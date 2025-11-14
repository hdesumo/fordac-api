// src/middleware/verifyToken.js

import jwt from "jsonwebtoken";

// --------------------------------------------------
// Vérifie que le token est présent ET valide
// --------------------------------------------------
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1]; // Format: Bearer xxxxx

  if (!token) {
    return res.status(401).json({ message: "Token invalide" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Injecte l'utilisateur dans req
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token non valide" });
  }
};

// --------------------------------------------------
// Autorise uniquement le superadmin
// --------------------------------------------------
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Accès réservé au superadmin" });
  }
  next();
};

// --------------------------------------------------
// Autorise admins + superadmins
// --------------------------------------------------
export const requireAdmin = (req, res, next) => {
  if (!req.user || !["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }
  next();
};

// --------------------------------------------------
// Compatibilité avec ton ancien code (export default)
// --------------------------------------------------
const verifyToken = requireAuth;
export default verifyToken;
