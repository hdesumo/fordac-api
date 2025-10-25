import express from "express";
import { uploadFile, getFile } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/upload", uploadFile);
router.get("/files/:filename", getFile);

export default router;
