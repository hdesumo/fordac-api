// src/routes/authRoutes.js
import express from "express";
import { login, registerAdmin, registerMember, forgotPassword, changePassword } from "../controllers/authController.js";
import { requireAuth, requireSuperAdmin } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/register-member", registerMember); // public from vitrine
router.post("/change-password", requireAuth, changePassword);
router.post("/register-admin", requireAuth, requireSuperAdmin, registerAdmin); // only superadmin

export default router;
