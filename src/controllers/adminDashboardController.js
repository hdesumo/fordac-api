// src/controllers/adminDashboardController.js
const pool = require("../db");

// Fonction sécurisée qui empêche un crash si la table n'existe pas
async function safeQuery(query, params = []) {
  try {
    const result = await pool.query(query, params);
    return result.rows || [];
  } catch (err) {
    console.error("⚠️ SQL ERROR:", query, err.message);
    return []; // Fallback propre
  }
}

exports.getDashboardStats = async (req, res) => {
  try {
    const adminId = req.admin?.id || null;

    // 1. Membres
    const totalMembres   = await safeQuery("SELECT COUNT(*) FROM members");
    const actifs         = await safeQuery("SELECT COUNT(*) FROM members WHERE status='active'");
    const pending        = await safeQuery("SELECT COUNT(*) FROM members WHERE status='pending'");
    const suspended      = await safeQuery("SELECT COUNT(*) FROM members WHERE status='suspended'");
    const banned         = await safeQuery("SELECT COUNT(*) FROM members WHERE status='banned'");

    // Secteur
    const nord           = await safeQuery("SELECT COUNT(*) FROM members WHERE secteur='Nord'");
    const sud            = await safeQuery("SELECT COUNT(*) FROM members WHERE secteur='Sud'");

    // Top arrondissements
    const arrondissements = await safeQuery(`
      SELECT arrondissement, COUNT(*) AS total
      FROM members
      GROUP BY arrondissement
      ORDER BY total DESC
      LIMIT 10
    `);

    // Derniers membres inscrits
    const derniers = await safeQuery(`
      SELECT name, email, secteur, arrondissement, created_at
      FROM members
      ORDER BY created_at DESC
      LIMIT 8
    `);

    // Forum
    const totalPosts      = await safeQuery("SELECT COUNT(*) FROM forum_posts");
    const totalComments   = await safeQuery("SELECT COUNT(*) FROM forum_comments");
    const recentPosts     = await safeQuery(`
      SELECT id, title, created_at
      FROM forum_posts
      ORDER BY created_at DESC
      LIMIT 5
    `);
    const recentComments  = await safeQuery(`
      SELECT id, post_id, content, created_at
      FROM forum_comments
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Reports
    const totalReports    = await safeQuery("SELECT COUNT(*) FROM reports");
    const recentReports   = await safeQuery(`
      SELECT id, type, description, created_at
      FROM reports
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Activités Admin
    const recentActivities = await safeQuery(`
      SELECT description, created_at
      FROM admin_activities
      ORDER BY created_at DESC
      LIMIT 8
    `);

    return res.json({
      totalMembres: parseInt(totalMembres[0]?.count || 0),
      actifs: parseInt(actifs[0]?.count || 0),
      pending: parseInt(pending[0]?.count || 0),
      suspended: parseInt(suspended[0]?.count || 0),
      banned: parseInt(banned[0]?.count || 0),

      nord: parseInt(nord[0]?.count || 0),
      sud: parseInt(sud[0]?.count || 0),

      arrondissements,
      derniers,

      totalPosts: parseInt(totalPosts[0]?.count || 0),
      totalComments: parseInt(totalComments[0]?.count || 0),
      recentPosts,
      recentComments,

      totalReports: parseInt(totalReports[0]?.count || 0),
      recentReports,

      recentActivities,
    });
  } catch (err) {
    console.error("❌ Dashboard Fatal Error:", err);
    return res.status(500).json({ error: "Erreur interne serveur." });
  }
};
