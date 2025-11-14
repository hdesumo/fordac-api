import express from "express";
import { superAdminLogin, updateSuperAdminPassword } from "../controllers/superadminController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", superAdminLogin);
router.put("/password", verifyToken, updateSuperAdminPassword);

export default router;
