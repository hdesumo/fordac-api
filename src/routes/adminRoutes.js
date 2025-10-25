import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createAdmin,
  loginAdmin,
  getAdmins,
  updateAdminRole
} from "../controllers/adminController.js";

const router = express.Router();

/**
 * 🔐 Connexion admin
 * POST /api/admins/login
 */
router.post("/login", loginAdmin);

/**
 * ➕ Création d’un nouvel admin (réservé au superadmin)
 * POST /api/admins/create
 */
router.post("/create", verifyToken, createAdmin);

/**
 * 📋 Liste de tous les admins (superadmin uniquement)
 * GET /api/admins
 */
router.get("/", verifyToken, getAdmins);

/**
 * 🔄 Modifier le rôle ou le statut d’un admin
 * PUT /api/admins/role/:id
 */
router.put("/role/:id", verifyToken, updateAdminRole);

export default router;
