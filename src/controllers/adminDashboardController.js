// src/controllers/adminDashboardController.js
const pool = require("../db");

exports.getDashboardStats = async (req, res) => {
  try {
    const tokenAdmin = req.admin; // vient du middleware admin
    const adminId = tokenAdmin?.id || null;

    // ---------------------------
    // 1. STATS MEMBRES
    // ---------------------------
    const totalMembres = await pool.query(
      "SELECT COUNT(*) FROM members"
    );

    const actifs = await pool.query(
      "SELECT COUNT(*) FROM members WHERE status = 'active'"
    );

    const pending = await pool.query(
      "SELECT COUNT(*) FROM members WHERE status = 'pending'"
    );

    const suspended = await pool.query(
      "SELECT COUNT(*) FROM members WHERE status = 'suspended'"
    );

    const banned = await pool.query(
      "SELECT COUNT(*) FROM members WHERE status = 'banned'"
    );

    // ---------------------------
    // 2. MOUONGO (Nord / Sud)
    // ---------------------------
    const nord = await pool.query(
      "SELECT COUNT(*) FROM members WHERE secteur = 'Nord'"
    );

    const sud = await pool.query(
      "SELECT COUNT(*) FROM members WHERE secteur = 'Sud'"
    );

    const arr = await pool.query(`
      SELECT arrondissement, COUNT(*) AS total
      FROM members
      GROUP BY arrondissement
      ORDER BY total DESC
      LIMIT 10
    `);

    // ---------------------------
    // 3. DERNIERS MEMBRES
    // ---------------------------
    const derniers = await pool.query(`
      SELECT name, email, secteur, arrondissement, created_at
      FROM members
      ORDER BY created_at DESC
      LIMIT 8
    `);

    // ---------------------------
    // 4. FORUM : POSTS + COMMENTS
    // ---------------------------
    const totalPosts = await pool.query(
      "SELECT COUNT(*) FROM forum_posts"
    );

    const totalComments = await pool.query(
      "SELECT COUNT(*) FROM forum_comments"
    );

    const recentPosts = await pool.query(`
      SELECT id, title, created_at
      FROM forum_posts
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const recentComments = await pool.query(`
      SELECT id, post_id, content, created_at
      FROM forum_comments
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // ---------------------------
    // 5. SIGNALEMENTS
    // ---------------------------
    const totalReports = await pool.query(
      "SELECT COUNT(*) FROM reports"
    );

    const recentReports = await pool.query(`
      SELECT id, type, description, created_at
      FROM reports
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // ---------------------------
    // 6. ACTIVITÉS ADMIN
    // ---------------------------
    const recentActivities = await pool.query(`
      SELECT description, created_at
      FROM admin_activities
      ORDER BY created_at DESC
      LIMIT 8
    `);

    // ---------------------------
    // RÉPONSE FINALE
    // ---------------------------
    return res.json({
      totalMembres: parseInt(totalMembres.rows[0].count || 0),
      actifs: parseInt(actifs.rows[0].count || 0),
      pending: parseInt(pending.rows[0].count || 0),
      suspended: parseInt(suspended.rows[0].count || 0),
      banned: parseInt(banned.rows[0].count || 0),

      nord: parseInt(nord.rows[0].count || 0),
      sud: parseInt(sud.rows[0].count || 0),

      arrondissements: arr.rows,

      derniers: derniers.rows,

      totalPosts: parseInt(totalPosts.rows[0].count || 0),
      totalComments: parseInt(totalComments.rows[0].count || 0),
      recentPosts: recentPosts.rows,
      recentComments: recentComments.rows,

      totalReports: parseInt(totalReports.rows[0].count || 0),
      recentReports: recentReports.rows,

      recentActivities: recentActivities.rows,
    });
  } catch (error) {
    console.error("❌ Dashboard Error:", error);
    return res.status(500).json({ error: "Erreur interne serveur." });
  }
};
