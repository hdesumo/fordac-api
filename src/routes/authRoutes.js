import express from "express";
import { loginMember, verifyTokenController } from "../controllers/authController.js";

const router = express.Router();

// Connexion membre
router.post("/login", loginMember);

// Vérification token
router.get("/verify", verifyTokenController);

export default router;
