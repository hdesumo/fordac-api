// src/controllers/adminDashboardController.js

const db = require("../db");

// -------------------------------
// 🚀 Admin Dashboard Stats
// -------------------------------
exports.getDashboardStats = async (req, res) => {
  try {
    console.log("📊 [Dashboard] Calcul des statistiques...");

    // 1. Nombre total de membres
    const totalMembres = await db.query(
      "SELECT COUNT(*) FROM users WHERE role = 'member'"
    );

    // 2. Nombre total d'admins
    const totalAdmins = await db.query(
      "SELECT COUNT(*) FROM users WHERE role = 'admin'"
    );

    // 3. Dernières inscriptions
    const latestMembers = await db.query(
      `SELECT id, name, email, created_at
       FROM users
       WHERE role = 'member'
       ORDER BY id DESC
       LIMIT 5`
    );

    // 4. Activités admin (LA BONNE STRUCTURE)
    const latestActivities = await db.query(
      `SELECT id, action, description, ip_address, created_at 
       FROM admin_activities 
       ORDER BY id DESC 
       LIMIT 10`
    );

    // 5. Nombre total de publications
    const totalPublications = await db.query(
      "SELECT COUNT(*) FROM forum_posts"
    ).catch(() => ({ rows: [{ count: 0 }] })); // ⚠️ table absente = fallback propre

    // 6. Nombre total de commentaires
    const totalCommentaires = await db.query(
      "SELECT COUNT(*) FROM forum_comments"
    ).catch(() => ({ rows: [{ count: 0 }] }));

    // RÉPONSE
    return res.json({
      status: "success",
      stats: {
        membres: Number(totalMembres.rows[0].count || 0),
        admins: Number(totalAdmins.rows[0].count || 0),
        publications: Number(totalPublications.rows[0].count || 0),
        commentaires: Number(totalCommentaires.rows[0].count || 0),
        recentMembers: latestMembers.rows,
        recentActivities: latestActivities.rows,
      }
    });

  } catch (error) {
    console.error("🔥 ERREUR DASHBOARD ADMIN:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
