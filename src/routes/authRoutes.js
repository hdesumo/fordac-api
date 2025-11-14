import express from "express";
import {
  login,
  superadminLogin,
  getProfile
} from "../controllers/authController.js";

// ✔️ Bon chemin, bon fichier, bon nom de dossier
import { verifyToken, requireSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🔑 Connexion Admin
 */
router.post("/login", login);

/**
 * 👑 Connexion SuperAdmin
 */
router.post("/superadmin/login", superadminLogin);

/**
 * 👤 Profil utilisateur connecté (admin ou superadmin)
 */
router.get("/profile", verifyToken, getProfile);

/**
 * 🛡️ Route SuperAdmin protégée
 */
router.get(
  "/superadmin/secure",
  verifyToken,
  requireSuperAdmin,
  (req, res) => {
    res.json({ message: "Bienvenue SuperAdmin !" });
  }
);

export default router;
