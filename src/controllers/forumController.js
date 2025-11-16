// src/controllers/forumController.js (CommonJS)

const pool = require("../config/db");

/* ============================================================
   1. LISTE DES TOPICS PUBLIÉS (militants)
============================================================ */
const listPublishedTopics = async (req, res) => {
  try {
    const q = `
      SELECT id, title, description, created_at 
      FROM topics 
      WHERE status='published'
      ORDER BY id DESC
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ listPublishedTopics:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ============================================================
   2. DÉTAILS D’UN TOPIC + POSTS APPROUVÉS
============================================================ */
const getTopicWithPosts = async (req, res) => {
  const { id } = req.params;

  try {
    const topicQuery = `
      SELECT id, title, description, created_at 
      FROM topics WHERE id=$1
    `;
    const topic = await pool.query(topicQuery, [id]);

    if (topic.rows.length === 0)
      return res.status(404).json({ message: "Topic introuvable" });

    const postsQuery = `
      SELECT id, author, content, created_at 
      FROM posts 
      WHERE topic_id=$1 AND status='approved'
      ORDER BY id DESC
    `;
    const posts = await pool.query(postsQuery, [id]);

    res.json({
      topic: topic.rows[0],
      posts: posts.rows,
    });
  } catch (error) {
    console.error("❌ getTopicWithPosts:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ============================================================
   3. AJOUT D’UN POST (MILITANT)
============================================================ */
const createPost = async (req, res) => {
  const { topic_id, author, content } = req.body;

  if (!topic_id || !content)
    return res.status(400).json({ message: "Champs manquants" });

  try {
    const q = `
      INSERT INTO posts (topic_id, author, content, status)
      VALUES ($1, $2, $3, 'pending')
    `;
    await pool.query(q, [topic_id, author, content]);

    res.json({ message: "Message soumis. En attente de modération." });
  } catch (error) {
    console.error("❌ createPost:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ============================================================
   4. ADMIN - CRÉER UN TOPIC
============================================================ */
const createTopic = async (req, res) => {
  const { title, description } = req.body;

  if (!title)
    return res.status(400).json({ message: "Titre obligatoire." });

  try {
    const q = `
      INSERT INTO topics (title, description, status)
      VALUES ($1, $2, 'published')
    `;
    await pool.query(q, [title, description]);

    res.json({ message: "Topic créé." });
  } catch (error) {
    console.error("❌ createTopic:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ============================================================
   5. ADMIN - MASQUER UN TOPIC
============================================================ */
const hideTopic = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("UPDATE topics SET status='hidden' WHERE id=$1", [id]);
    res.json({ message: "Topic masqué." });
  } catch (error) {
    console.error("❌ hideTopic:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ============================================================
   6. ADMIN - APPROUVER UN POST
============================================================ */
const approvePost = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("UPDATE posts SET status='approved' WHERE id=$1", [id]);
    res.json({ message: "Message approuvé." });
  } catch (error) {
    console.error("❌ approvePost:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ============================================================
   7. ADMIN - REJETER UN POST
============================================================ */
const rejectPost = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("UPDATE posts SET status='rejected' WHERE id=$1", [id]);
    res.json({ message: "Message rejeté." });
  } catch (error) {
    console.error("❌ rejectPost:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* ============================================================
   EXPORTS COMMONJS
============================================================ */
module.exports = {
  listPublishedTopics,
  getTopicWithPosts,
  createPost,
  createTopic,
  hideTopic,
  approvePost,
  rejectPost,
};
