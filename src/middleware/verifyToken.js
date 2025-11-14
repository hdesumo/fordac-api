import jwt from "jsonwebtoken";

// Middleware simple pour vérifier le token
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contient { id, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token invalide" });
  }
};

// Middleware pour vérifier le rôle superadmin
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Accès réservé au SuperAdmin" });
  }
  next();
};

// Middleware par défaut, identique à requireAuth
export default requireAuth;
