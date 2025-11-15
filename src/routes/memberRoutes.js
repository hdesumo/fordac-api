import express from "express";
import {
  listMembers,
  getMemberById,
  createMember,
  updateMember,
  approveMember
} from "../controllers/memberController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔓 Route publique — inscription d’un membre
router.post("/register", createMember);

// 🔒 Routes protégées — admin / superadmin
router.get("/", verifyToken, listMembers);
router.get("/:id", verifyToken, getMemberById);
router.put("/:id", verifyToken, updateMember);
router.put("/:id/approve", verifyToken, approveMember);

export default router;
