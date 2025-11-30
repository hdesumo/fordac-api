const pool = require("../db");

// Helper : vérifier si l’utilisateur est shadow-ban
async function isShadowBanned(userId) {
  const result = await pool.query(
    "SELECT shadow_banned FROM members WHERE id = $1",
    [userId]
  );
  return result.rows.length && result.rows[0].shadow_banned === true;
}

module.exports = {
  /* ----------------------------------------------------------
     🟢 1. Liste des catégories (topics)
  ----------------------------------------------------------- */
  getTopics: async (req, res) => {
    try {
      const topics = await pool.query(
        "SELECT * FROM topics ORDER BY id DESC"
      );
      res.json(topics.rows);
    } catch (err) {
      console.error("Erreur getTopics:", err);
      res.status(500).json({ message: "Erreur serveur." });
    }
  },

  /* ----------------------------------------------------------
     🟢 2. Détails d'un topic + liste des posts associés
  ----------------------------------------------------------- */
  getTopicById: async (req, res) => {
    const topicId = req.params.id;

    try {
      const topic = await pool.query(
        "SELECT * FROM topics WHERE id = $1",
        [topicId]
      );

      if (topic.rows.length === 0) {
        return res.status(404).json({ message: "Topic introuvable." });
      }

      const posts = await pool.query(
        `SELECT p.*, m.name AS author_name
         FROM forum_posts p
         LEFT JOIN members m ON m.id = p.user_id
         WHERE topic_id = $1 AND approved = true
         ORDER BY p.created_at DESC`,
        [topicId]
      );

      res.json({
        topic: topic.rows[0],
        posts: posts.rows
      });
    } catch (err) {
      console.error("Erreur getTopicById:", err);
      res.status(500).json({ message: "Erreur serveur." });
    }
  },

  /* ----------------------------------------------------------
     🟢 3. Détails d’un post + replies
  ----------------------------------------------------------- */
  getPostWithReplies: async (req, res) => {
    const postId = req.params.id;

    try {
      const post = await pool.query(
        `SELECT p.*, m.name AS author_name
         FROM forum_posts p
         LEFT JOIN members m ON m.id = p.user_id
         WHERE p.id = $1`,
        [postId]
      );

      if (!post.rows.length) {
        return res.status(404).json({ message: "Post introuvable." });
      }

      const replies = await pool.query(
        `SELECT r.*, m.name AS author_name
         FROM forum_replies r
         LEFT JOIN members m ON m.id = r.user_id
         WHERE r.post_id = $1 AND r.approved = true
         ORDER BY r.created_at ASC`,
        [postId]
      );

      res.json({
        post: post.rows[0],
        replies: replies.rows
      });
    } catch (err) {
      console.error("Erreur getPostWithReplies:", err);
      res.status(500).json({ message: "Erreur serveur." });
    }
  },

  /* ----------------------------------------------------------
     🟢 4. Création d’un nouveau topic
  ----------------------------------------------------------- */
  createTopic: async (req, res) => {
    const { title } = req.body;

    try {
      const result = await pool.query(
        "INSERT INTO topics (title) VALUES ($1) RETURNING *",
        [title]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Erreur createTopic:", err);
      res.status(500).json({ message: "Erreur serveur." });
    }
  },

  /* ----------------------------------------------------------
     🟢 5. Création d’un post (premier message du fil)
  ----------------------------------------------------------- */
  createPost: async (req, res) => {
    const { topic_id, title, content } = req.body;
    const userId = req.user.id;

    try {
      if (await isShadowBanned(userId)) {
        return res.status(403).json({ message: "Vous ne pouvez pas publier." });
      }

      const post = await pool.query(
        `INSERT INTO forum_posts (user_id, topic_id, title, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, topic_id, title, content]
      );

      res.json(post.rows[0]);
    } catch (err) {
      console.error("Erreur createPost:", err);
      res.status(500).json({ message: "Erreur serveur." });
    }
  },

  /* ----------------------------------------------------------
     🟢 6. Répondre à un post
  ----------------------------------------------------------- */
  createReply: async (req, res) => {
    const { post_id, content } = req.body;
    const userId = req.user.id;

    try {
      if (await isShadowBanned(userId)) {
        return res.status(403).json({ message: "Vous ne pouvez pas répondre." });
      }

      const reply = await pool.query(
        `INSERT INTO forum_replies (post_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [post_id, userId, content]
      );

      res.json(reply.rows[0]);
    } catch (err) {
      console.error("Erreur createReply:", err);
      res.status(500).json({ message: "Erreur serveur." });
    }
  },

  /* ----------------------------------------------------------
     🟡 7. Modification d’un post (limite 30 minutes)
  ----------------------------------------------------------- */
  editPost: async (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;

    try {
      const post = await pool.query(
        "SELECT * FROM forum_posts WHERE id = $1",
        [postId]
      );

      if (!post.rows.length) {
        return res.status(404).json({ message: "Post introuvable." });
      }

      if (post.rows[0].user_id !== userId) {
        return res.status(403).json({ message: "Action interdite." });
      }

      const postDate = new Date(post.rows[0].created_at);
      const now = new Date();

      const diffMinutes = (now - postDate) / 60000;
      if (diffMinutes > 30) {
        return res.status(403).json({ message: "Délai de modification dépassé." });
      }

      const updated = await pool.query(
        `UPDATE forum_posts
         SET content = $1, edited_by_user = true, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [content, postId]
      );

      res.json(updated.rows[0]);
    } catch (err) {
      console.error("Erreur editPost:", err);
      res.status(500).json({ message: "Erreur serveur." });
    }
  },

  /* ----------------------------------------------------------
     🔴 8. Membre ne peut PAS supprimer un post
  ----------------------------------------------------------- */
  deletePost: async (req, res) => {
    return res.status(403).json({
      message: "La suppression est réservée aux administrateurs."
    });
  },
};
