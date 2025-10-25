import express from "express";
import { listMembers, getMemberById, createMember } from "../controllers/memberController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔓 Route publique — inscription d’un membre (via vitrine)
router.post("/register", createMember);

// 🔒 Routes protégées — visibles par admin/superadmin
router.get("/", verifyToken, listMembers);
router.get("/:id", verifyToken, getMemberById);

export default router;
