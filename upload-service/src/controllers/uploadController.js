import multer from "multer";
import path from "path";
import fs from "fs";

// 📁 Création automatique du dossier uploads
const uploadDir = path.resolve("upload-service/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ⚙️ Configuration du stockage local
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 📤 Upload d’un fichier
export const uploadFile = [
  upload.single("file"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Aucun fichier reçu" });

    const fileUrl = `${process.env.BASE_URL}/files/${req.file.filename}`;
    fs.appendFileSync(
      path.join(uploadDir, "uploads.log"),
      `[${new Date().toISOString()}] Uploaded: ${req.file.filename}\n`
    );

    res.json({
      success: true,
      filename: req.file.filename,
      url: fileUrl,
    });
  },
];

// 📥 Téléchargement public
export const getFile = (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);

  if (!fs.existsSync(filePath))
    return res.status(404).json({ message: "Fichier introuvable" });

  fs.appendFileSync(
    path.join(uploadDir, "uploads.log"),
    `[${new Date().toISOString()}] Downloaded: ${req.params.filename}\n`
  );

  res.download(filePath);
};
