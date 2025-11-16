const pool = require("../config/db.js");
const mail = require("../services/mail.js");

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    // Enregistrer dans la base
    const insertQuery = `
      INSERT INTO contacts (name, email, subject, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [name, email, subject, message];
    const result = await pool.query(insertQuery, values);

    // Envoi email
    await mail.sendContactMail({
      name,
      email,
      subject,
      message,
    });

    res.status(200).json({
      message: "Message envoyé avec succès.",
      contact: result.rows[0],
    });

  } catch (error) {
    console.error("Erreur contact:", error.message);
    res.status(500).json({ message: "Erreur lors de l’envoi du message." });
  }
};
