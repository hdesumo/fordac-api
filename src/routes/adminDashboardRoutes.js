const express = require("express");
const router = express.Router();
const pool = require("../db");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/stats", adminMiddleware, async (req, res) => {
  try {
    // 1️⃣ Membres
    const totalMembres = await pool.query("SELECT COUNT(*) FROM users");
    const actifs = await pool.query("SELECT COUNT(*) FROM users WHERE status='active'");
    const pending = await pool.query("SELECT COUNT(*) FROM users WHERE status='pending'");

    // 2️⃣ Forum
    const totalPosts = await pool.query("SELECT COUNT(*) FROM forum_posts");
    const totalComments = await pool.query("SELECT COUNT(*) FROM forum_comments");

    // 3️⃣ Activités admin
    const lastActivities = await pool.query(`
      SELECT id, action_type, description, ip_address, created_at 
      FROM admin_activities 
      ORDER BY id DESC
      LIMIT 10
    `);

    return res.json({
      totalMembres: Number(totalMembres.rows[0].count),
      actifs: Number(actifs.rows[0].count),
      pending: Number(pending.rows[0].count),
      totalPosts: Number(totalPosts.rows[0].count),
      totalComments: Number(totalComments.rows[0].count),
      lastActivities: lastActivities.rows
    });

  } catch (error) {
    console.error("🔥 ERREUR DASHBOARD ADMIN:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
