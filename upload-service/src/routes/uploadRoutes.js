const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("upload-service/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Route d'upload
router.post("/", upload.single("file"), (req, res) => {
  try {
    res.json({
      success: true,
      file: req.file.filename,
      url: `/files/${req.file.filename}`,
    });
  } catch (err) {
    console.error("Erreur upload:", err);
    res.status(500).json({ error: "Erreur lors de l'upload" });
  }
});

module.exports = router;
