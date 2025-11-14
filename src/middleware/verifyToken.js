// src/middleware/verifyToken.js

import jwt from "jsonwebtoken";

// Vérifie que l'utilisateur est authentifié
export const requireAuth = (req, res, next) => {
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
    req.user = decoded; // injecte l'utilisateur dans request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token non valide" });
  }
};

// Vérifie rôle superadmin uniquement
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Accès réservé au superadmin" });
  }
  next();
};

// Vérifie rôle admin OU superadmin
export const requireAdmin = (req, res, next) => {
  if (!req.user || !["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }
  next();
};

// Compatibilité ancienne version
const verifyToken = requireAuth;
export default verifyToken;
