import express from "express";
import { createAdhesion } from "../controllers/adhesionController.js";

const router = express.Router();

// 📝 Route pour recevoir une adhésion depuis le site vitrine
router.post("/", createAdhesion);

export default router;
