const pool = require("../config/db");

exports.reportPost = async (req, res) => {
  const { post_id, reason } = req.body;
  const user_id = req.user.id;

  if (!reason) return res.status(400).json({ message: "Motif requis" });

  try {
    await pool.query(
      `INSERT INTO reports (post_id, user_id, reason)
       VALUES ($1, $2, $3)`,
      [post_id, user_id, reason]
    );

    res.json({ message: "Signalement envoyé" });
  } catch (err) {
    console.error("Erreur reportPost:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getReports = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, 
              fp.content AS post_content,
              u.name AS reporter,
              au.name AS post_author
       FROM reports r
       LEFT JOIN forum_posts fp ON fp.id = r.post_id
       LEFT JOIN users u ON u.id = r.user_id
       LEFT JOIN users au ON au.id = fp.user_id
       ORDER BY r.created_at DESC`
    );

    res.json({ reports: result.rows });
  } catch (err) {
    console.error("Erreur getReports:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await pool.query("DELETE FROM reports WHERE id = $1", [req.params.id]);
    res.json({ message: "Signalement supprimé" });
  } catch (err) {
    console.error("Erreur deleteReport:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
