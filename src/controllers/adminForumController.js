const pool = require("../config/db");

/* -----------------------------------------------------
   ADMIN : Liste des sujets
----------------------------------------------------- */
exports.getAllTopics = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, 
             u.name AS author,
             c.name AS category_name
      FROM topics t
      LEFT JOIN users u ON u.id = t.user_id
      LEFT JOIN categories c ON c.id = t.category_id
      ORDER BY t.created_at DESC
    `);

    res.json({ topics: result.rows });
  } catch (err) {
    console.error("Erreur getAllTopics:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* -----------------------------------------------------
   ADMIN : Détails d’un sujet + posts
----------------------------------------------------- */
exports.getTopicDetails = async (req, res) => {
  try {
    const topicId = req.params.id;

    const topic = await pool.query(
      `SELECT t.*, 
              u.name AS author,
              c.name AS category_name
       FROM topics t
       LEFT JOIN users u ON u.id = t.user_id
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.id = $1`,
      [topicId]
    );

    const posts = await pool.query(
      `SELECT fp.*, u.name AS author
       FROM forum_posts fp
       LEFT JOIN users u ON u.id = fp.user_id
       WHERE fp.topic_id = $1
       ORDER BY fp.created_at ASC`,
      [topicId]
    );

    res.json({
      topic: topic.rows[0],
      posts: posts.rows,
    });

  } catch (err) {
    console.error("Erreur getTopicDetails:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* -----------------------------------------------------
   ADMIN : Supprimer un sujet
----------------------------------------------------- */
exports.deleteTopic = async (req, res) => {
  try {
    const topicId = req.params.id;

    await pool.query(`DELETE FROM topics WHERE id = $1`, [topicId]);

    res.json({ message: "Sujet supprimé avec succès" });
  } catch (err) {
    console.error("Erreur deleteTopic:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* -----------------------------------------------------
   ADMIN : Supprimer un message
----------------------------------------------------- */
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    await pool.query(`DELETE FROM forum_posts WHERE id = $1`, [postId]);

    res.json({ message: "Message supprimé" });
  } catch (err) {
    console.error("Erreur deletePost:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* -----------------------------------------------------
   ADMIN : Valider un message auto-modéré
----------------------------------------------------- */
exports.approvePost = async (req, res) => {
  try {
    const postId = req.params.id;

    await pool.query(
      `UPDATE forum_posts SET approved = TRUE WHERE id = $1`,
      [postId]
    );

    res.json({ message: "Message approuvé" });
  } catch (err) {
    console.error("Erreur approvePost:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* -----------------------------------------------------
   ADMIN : Shadow Ban d’un utilisateur
----------------------------------------------------- */
exports.shadowBanUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await pool.query(
      `UPDATE users SET shadow_banned = TRUE WHERE id = $1`,
      [userId]
    );

    res.json({ message: "Utilisateur shadow-ban (invisible)" });
  } catch (err) {
    console.error("Erreur shadowBanUser:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* -----------------------------------------------------
   ADMIN : Lifting du shadow-ban
----------------------------------------------------- */
exports.removeShadowBan = async (req, res) => {
  try {
    const userId = req.params.id;

    await pool.query(
      `UPDATE users SET shadow_banned = FALSE WHERE id = $1`,
      [userId]
    );

    res.json({ message: "Shadow-ban retiré" });
  } catch (err) {
    console.error("Erreur removeShadowBan:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* -----------------------------------------------------
   ADMIN : Récupérer les signalements
----------------------------------------------------- */
exports.getReports = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, fp.content AS post_content, u.name AS reporter
      FROM forum_reports r
      LEFT JOIN forum_posts fp ON fp.id = r.post_id
      LEFT JOIN users u ON u.id = r.reporter_id
      ORDER BY r.created_at DESC
    `);

    res.json({ reports: result.rows });
  } catch (err) {
    console.error("Erreur getReports:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
