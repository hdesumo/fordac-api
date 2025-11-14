import express from "express";
import { createContactMessage } from "../controllers/contactController.js";

const router = express.Router();

// 📩 Envoi d’un message via le site vitrine
router.post("/", createContactMessage);

export default router;
