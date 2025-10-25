// src/middlewares/verifyToken.js
import { verifyTokenSync } from "../utils/jwt.js";

export const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Authorization header missing" });
  const token = auth.split(" ")[1];
  const decoded = verifyTokenSync(token);
  if (!decoded) return res.status(403).json({ message: "Invalid token" });
  req.user = decoded;
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "superadmin") return res.status(403).json({ message: "SuperAdmin only" });
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "superadmin") return res.status(403).json({ message: "Admin only" });
  next();
};

export const requireMember = (req, res, next) => {
  if (req.user?.role !== "member") return res.status(403).json({ message: "Member only" });
  next();
};
