import pool from "../config/db.js";

// 📝 Créer une nouvelle adhésion
export const createAdhesion = async (req, res) => {
  try {
    const { name, email, phone, zone, arrondissement, profession } = req.body;

    if (!name || !email || !phone || !zone || !arrondissement) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    await pool.query(
      `INSERT INTO adhesions (name, email, phone, zone, arrondissement, profession, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [name, email, phone, zone, arrondissement, profession || null]
    );

    res.status(201).json({ message: "Votre adhésion a bien été enregistrée." });
  } catch (error) {
    console.error("Erreur adhésion:", error.message);
    res.status(500).json({ message: "Erreur serveur lors de l’adhésion." });
  }
};
