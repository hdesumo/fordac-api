const path = require("path");

// 📌 Retourner le fichier uploadé
exports.handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier uploadé." });
    }

    const fileUrl = `${process.env.BASE_URL || "https://api.fordac-connect.org"}/uploads/${req.file.filename}`;

    return res.status(200).json({
      message: "Fichier uploadé avec succès",
      file: {
        filename: req.file.filename,
        url: fileUrl,
        mime: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Erreur upload:", error.message);
    res.status(500).json({ error: "Erreur lors de l’upload du fichier." });
  }
};
