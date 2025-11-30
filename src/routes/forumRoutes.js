const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middleware/adminMiddleware");
const pool = require("../db");

/* -------------------------------------------------------
   🟢 1. Récupérer tous les posts (admin view)
-------------------------------------------------------- */
router.get("/posts", adminMiddleware, async (req, res) => {
  try {
    const posts = await pool.query(
      `SELECT p.*, m.name AS author_name, t.title AS topic_title
       FROM forum_posts p
       LEFT JOIN members m ON m.id = p.user_id
       LEFT JOIN topics t ON t.id = p.topic_id
       ORDER BY p.created_at DESC`
    );

    res.json(posts.rows);
  } catch (err) {
    console.error("Erreur admin get posts:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

/* -------------------------------------------------------
   🟢 2. Récupérer toutes les réponses (admin view)
-------------------------------------------------------- */
router.get("/replies", adminMiddleware, async (req, res) => {
  try {
    const replies = await pool.query(
      `SELECT r.*, m.name AS author_name, p.title AS post_title
       FROM forum_replies r
       LEFT JOIN members m ON m.id = r.user_id
       LEFT JOIN forum_posts p ON p.id = r.post_id
       ORDER BY r.created_at DESC`
    );

    res.json(replies.rows);
  } catch (err) {
    console.error("Erreur admin get replies:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

/* -------------------------------------------------------
   🟢 3. Approuver un post
-------------------------------------------------------- */
router.put("/posts/:id/approve", adminMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;

    await pool.query(
      "UPDATE forum_posts SET approved = true WHERE id = $1",
      [postId]
    );

    res.json({ message: "Post approuvé." });
  } catch (err) {
    console.error("Erreur approve post:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

/* -------------------------------------------------------
   🟢 4. Approuver une réponse
-------------------------------------------------------- */
router.put("/replies/:id/approve", adminMiddleware, async (req, res) => {
  try {
    const replyId = req.params.id;

    await pool.query(
      "UPDATE forum_replies SET approved = true WHERE id = $1",
      [replyId]
    );

    res.json({ message: "Réponse approuvée." });
  } catch (err) {
    console.error("Erreur approve reply:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

/* -------------------------------------------------------
   🔴 5. Supprimer un post (admin seulement)
-------------------------------------------------------- */
router.delete("/posts/:id/delete", adminMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;

    await pool.query("DELETE FROM forum_posts WHERE id = $1", [postId]);

    res.json({ message: "Post supprimé." });
  } catch (err) {
    console.error("Erreur delete post:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

/* -------------------------------------------------------
   🔴 6. Supprimer une réponse (admin)
-------------------------------------------------------- */
router.delete("/replies/:id/delete", adminMiddleware, async (req, res) => {
  try {
    const replyId = req.params.id;

    await pool.query("DELETE FROM forum_replies WHERE id = $1", [replyId]);

    res.json({ message: "Réponse supprimée." });
  } catch (err) {
    console.error("Erreur delete reply:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

/* -------------------------------------------------------
   🚫 7. Shadow-ban d’un membre
-------------------------------------------------------- */
router.put("/members/:id/shadowban", adminMiddleware, async (req, res) => {
  try {
    const memberId = req.params.id;

    await pool.query(
      "UPDATE members SET shadow_banned = true WHERE id = $1",
      [memberId]
    );

    res.json({ message: "Le membre est maintenant shadow-ban." });
  } catch (err) {
    console.error("Erreur shadowban:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

/* -------------------------------------------------------
   🟢 8. Lever un shadow-ban
-------------------------------------------------------- */
router.put("/members/:id/unban", adminMiddleware, async (req, res) => {
  try {
    const memberId = req.params.id;

    await pool.query(
      "UPDATE members SET shadow_banned = false WHERE id = $1",
      [memberId]
    );

    res.json({ message: "Shadow-ban levé." });
  } catch (err) {
    console.error("Erreur unban:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

/* -------------------------------------------------------
   🟡 9. Rendre un post invisible (désapprouver)
-------------------------------------------------------- */
router.put("/posts/:id/hide", adminMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;

    await pool.query(
      "UPDATE forum_posts SET approved = false WHERE id = $1",
      [postId]
    );

    res.json({ message: "Post masqué." });
  } catch (err) {
    console.error("Erreur hide post:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

/* -------------------------------------------------------
   🟡 10. Rendre une réponse invisible
-------------------------------------------------------- */
router.put("/replies/:id/hide", adminMiddleware, async (req, res) => {
  try {
    const replyId = req.params.id;

    await pool.query(
      "UPDATE forum_replies SET approved = false WHERE id = $1",
      [replyId]
    );

    res.json({ message: "Réponse masquée." });
  } catch (err) {
    console.error("Erreur hide reply:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
