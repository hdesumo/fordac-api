import pool from "../config/db.js";

// 📩 Enregistrer un message de contact
export const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Champs manquants." });
    }

    await pool.query(
      "INSERT INTO contacts (name, email, subject, message, created_at) VALUES ($1, $2, $3, $4, NOW())",
      [name, email, subject || "Sans objet", message]
    );

    res.status(201).json({ message: "Message envoyé avec succès." });
  } catch (error) {
    console.error("Erreur contact:", error.message);
    res.status(500).json({ message: "Erreur serveur lors de l’envoi du message." });
  }
};
