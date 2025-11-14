import express from "express";
import {
    login,
    getProfile,
    superadminLogin
} from "../controllers/authController.js";

import { requireAuth, requireSuperAdmin } from "../middleware/verifyToken.js"; // <-- corrigé

const router = express.Router();

// Connexion utilisateur (admin / militant)
router.post("/login", login);

// Connexion du superadmin
router.post("/superadmin/login", superadminLogin);

// Profil utilisateur connecté
router.get("/profile", requireAuth, getProfile);

export default router;
