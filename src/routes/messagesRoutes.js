import express from "express";
import { requireAuth } from "../middleware/verifyToken.js"; // <-- corrigé
import {
    listMessages,
    sendMessage
} from "../controllers/messagesController.js";

const router = express.Router();

router.get("/", requireAuth, listMessages);
router.post("/", requireAuth, sendMessage);

export default router;
