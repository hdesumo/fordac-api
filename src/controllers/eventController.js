const pool = require("../db.js");

// 🟩 Créer un nouvel événement
exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, start_date, end_date } = req.body;

    if (!title || !start_date) {
      return res.status(400).json({ error: "Le titre et la date de début sont requis." });
    }

    const query = `
      INSERT INTO events (title, description, location, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [title, description, location, start_date, end_date];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Événement créé avec succès",
      event: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création de l’événement :", error);
    res.status(500).json({ error: "Erreur lors de la création de l’événement." });
  }
};

// 🟦 Lister tous les événements
exports.listEvents = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM events ORDER BY start_date DESC;"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Erreur récupération événements :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des événements." });
  }
};

// 🟨 Récupérer un événement par ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Événement non trouvé." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Erreur récupération événement :", error);
    res.status(500).json({ error: "Erreur lors de la récupération de l’événement." });
  }
};
