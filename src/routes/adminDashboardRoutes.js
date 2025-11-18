const express = require("express");
const router = express.Router();
const db = require("../db");
const adminMiddleware = require("../middleware/adminMiddleware");

// =======================================================
//      DASHBOARD ADMIN — VERSION FUSIONNÉE COMPLÈTE
// =======================================================
router.get("/stats", adminMiddleware, async (req, res) => {
  try {
    // ==================================================
    // (1) STATS MEMBRES — NOUVELLE ARCHITECTURE
    // ==================================================

    const totalMembres = await db.query(`SELECT COUNT(*) FROM users`);
    const actifs = await db.query(`SELECT COUNT(*) FROM users WHERE status='active'`);
    const pending = await db.query(`SELECT COUNT(*) FROM users WHERE status='pending'`);
    const suspended = await db.query(`SELECT COUNT(*) FROM users WHERE status='suspended'`);
    const banned = await db.query(`SELECT COUNT(*) FROM users WHERE status='banned'`);

    // Territoire — Moungo-Nord / Moungo-Sud
    const nord = await db.query(
      `SELECT COUNT(*) FROM users WHERE secteur='Moungo-Nord'`
    );

    const sud = await db.query(
      `SELECT COUNT(*) FROM users WHERE secteur='Moungo-Sud'`
    );

    // Membres par arrondissement
    const arrondissements = await db.query(
      `SELECT arrondissement, COUNT(*) AS total
       FROM users 
       WHERE arrondissement IS NOT NULL
       GROUP BY arrondissement
       ORDER BY total DESC`
    );

    // Derniers inscrits
    const derniers = await db.query(
      `SELECT id, name, email, secteur, arrondissement, status, created_at
       FROM users
       ORDER BY id DESC
       LIMIT 10`
    );

    // ==================================================
    // (2) MODULE FORUM / DISCUSSIONS / COMMENTAIRES
    // ==================================================

    const totalPosts = await db.query(`SELECT COUNT(*) FROM forum_posts`);
    const totalComments = await db.query(`SELECT COUNT(*) FROM forum_comments`);

    const recentPosts = await db.query(`
      SELECT p.id, p.title, p.created_at, u.name AS author
      FROM forum_posts p 
      LEFT JOIN users u ON u.id = p.user_id
      ORDER BY p.id DESC
      LIMIT 5
    `);

    const recentComments = await db.query(`
      SELECT c.id, c.content, c.created_at, u.name AS author, p.title AS post
      FROM forum_comments c
      LEFT JOIN users u ON u.id = c.user_id
      LEFT JOIN forum_posts p ON p.id = c.post_id
      ORDER BY c.id DESC
      LIMIT 5
    `);

    // ==================================================
    // (3) MODULE SIGNALEMENTS
    // ==================================================

    const totalReports = await db.query(`SELECT COUNT(*) FROM reports`);

    const recentReports = await db.query(`
      SELECT r.id, r.type, r.reason, r.created_at,
             u.name AS reporter,
             p.title AS post_title,
             c.content AS comment_content
      FROM reports r
      LEFT JOIN users u ON u.id = r.user_id
      LEFT JOIN forum_posts p ON p.id = r.post_id
      LEFT JOIN forum_comments c ON c.id = r.comment_id
      ORDER BY r.id DESC
      LIMIT 5
    `);

    // ==================================================
    // (4) ACTIVITÉS ADMIN (TRÈS IMPORTANT)
    // ==================================================

    const recentActivities = await db.query(`
      SELECT a.id, a.action_type, a.description, a.ip_address, a.created_at,
             ad.name AS admin_name
      FROM admin_activities a
      LEFT JOIN admins ad ON ad.id = a.admin_id
      ORDER BY a.id DESC
      LIMIT 10
    `);

    // ==================================================
    // (5) RÉPONSE COMPLÈTE FUSIONNÉE
    // ==================================================

    return res.json({
      // ===== Stats membres =====
      totalMembres: parseInt(totalMembres.rows[0].count),
      actifs: parseInt(actifs.rows[0].count),
      pending: parseInt(pending.rows[0].count),
      suspended: parseInt(suspended.rows[0].count),
      banned: parseInt(banned.rows[0].count),

      // ===== Territoire =====
      nord: parseInt(nord.rows[0].count),
      sud: parseInt(sud.rows[0].count),
      arrondissements: arrondissements.rows,
      derniers: derniers.rows,

      // ===== Forum =====
      totalPosts: parseInt(totalPosts.rows[0].count),
      totalComments: parseInt(totalComments.rows[0].count),
      recentPosts: recentPosts.rows,
      recentComments: recentComments.rows,

      // ===== Signalements =====
      totalReports: parseInt(totalReports.rows[0].count),
      recentReports: recentReports.rows,

      // ===== Activités admins =====
      recentActivities: recentActivities.rows,
    });

  } catch (err) {
    console.error("Erreur dashboard admin:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
