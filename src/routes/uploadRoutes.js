import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../config/db.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📁 Dossier des fichiers uploadés
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ⚙️ Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 📤 Upload de photo d’identité
router.post("/photo", verifyToken, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Aucune photo reçue." });

    const photoPath = `/uploads/${req.file.filename}`;
    const userId = req.user.id;

    await pool.query("UPDATE users SET photo_url=$1 WHERE id=$2", [photoPath, userId]);

    res.json({
      message: "Photo téléchargée et enregistrée avec succès.",
      photo_url: photoPath,
    });
  } catch (error) {
    console.error("Erreur upload photo:", error.message);
    res.status(500).json({ message: "Erreur lors de l’upload." });
  }
});

// 📥 Liste de tous les fichiers uploadés (pour test)
router.get("/", (req, res) => {
  const files = fs.readdirSync(uploadDir).map((name) => ({
    name,
    url: `/uploads/${name}`,
  }));
  res.json(files);
});

export default router;
