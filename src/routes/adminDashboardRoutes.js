// src/routes/adminDashboardRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const adminMiddleware = require("../middleware/adminMiddleware");

// 🔍 Utilitaire pour vérifier si une table existe
async function tableExists(table) {
  const check = await pool.query(
    `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
    )`,
    [table]
  );
  return check.rows[0].exists;
}

router.get("/stats", adminMiddleware, async (req, res) => {
  try {
    // 1️⃣ Membres
    const totalMembres = await pool.query("SELECT COUNT(*) FROM users");
    const actifs = await pool.query("SELECT COUNT(*) FROM users WHERE status='active'");
    const pending = await pool.query("SELECT COUNT(*) FROM users WHERE status='pending'");

    // 2️⃣ Forum — sécurisé
    let totalPosts = { rows: [{ count: 0 }] };
    let totalComments = { rows: [{ count: 0 }] };

    if (await tableExists("forum_posts")) {
      totalPosts = await pool.query("SELECT COUNT(*) FROM forum_posts");
    }

    if (await tableExists("forum_comments")) {
      totalComments = await pool.query("SELECT COUNT(*) FROM forum_comments");
    }

    // 3️⃣ Activités admin
    let lastActivities = { rows: [] };
    if (await tableExists("admin_activities")) {
      lastActivities = await pool.query(`
        SELECT id, action_type, description, ip_address, created_at 
        FROM admin_activities 
        ORDER BY id DESC
        LIMIT 10
      `);
    }

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
