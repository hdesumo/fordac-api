// src/routes/messagesRoutes.js
import express from "express";
import { sendMessage, inbox, sent, markRead } from "../controllers/messagesController.js";
import { requireAuth } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/send", requireAuth, sendMessage);
router.get("/inbox", requireAuth, inbox);
router.get("/sent", requireAuth, sent);
router.post("/:id/read", requireAuth, markRead);

export default router;
