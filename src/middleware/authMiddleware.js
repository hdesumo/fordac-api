import jwt from "jsonwebtoken";

/**
 * 🔒 Middleware de vérification du token JWT
 * Utilisé pour protéger les routes nécessitant une authentification
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header manquant." });
    }

    const token = authHeader.split(" ")[1]; // format: "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "Token manquant." });
    }

    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajout des infos utilisateur dans la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Erreur verifyToken:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Session expirée. Veuillez vous reconnecter." });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Token invalide." });
    }

    res.status(500).json({ message: "Erreur lors de la vérification du token." });
  }
};

/**
 * 🛡️ Middleware optionnel pour routes réservées
 * Vérifie si l'utilisateur connecté est superadmin
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Accès réservé au superadmin." });
  }
  next();
};
