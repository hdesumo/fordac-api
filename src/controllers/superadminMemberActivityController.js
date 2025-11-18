const db = require("../db");

exports.getMemberActivities = async (req, res) => {
  try {
    const {
      search = "",
      secteur = "",
      arrondissement = "",
      action = "",
      page = 1
    } = req.query;

    const limit = 30;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        ma.id,
        ma.member_id,
        ma.action,
        ma.description,
        ma.secteur,
        ma.arrondissement,
        ma.created_at,
        m.name,
        m.phone
      FROM member_activities ma
      LEFT JOIN members m ON ma.member_id = m.id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (m.name ILIKE $${params.length} OR m.phone ILIKE $${params.length})`;
    }

    if (secteur) {
      params.push(secteur);
      query += ` AND ma.secteur = $${params.length}`;
    }

    if (arrondissement) {
      params.push(arrondissement);
      query += ` AND ma.arrondissement = $${params.length}`;
    }

    if (action) {
      params.push(action);
      query += ` AND ma.action = $${params.length}`;
    }

    query += ` ORDER BY ma.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const result = await db.query(query, params);

    return res.json({
      page: Number(page),
      count: result.rows.length,
      activities: result.rows
    });

  } catch (err) {
    console.error("Erreur getMemberActivities :", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
