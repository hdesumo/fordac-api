// src/controllers/adminDashboardController.js
const pool = require("../db");

// Dashboard ADMIN
exports.getAdminStats = async (req, res) => {
  try {
    const adminId = req.user.id;

    // 1️⃣ Récupération du nombre de membres
    const totalMembers = await pool.query(
      "SELECT COUNT(*) FROM members"
    );

    // 2️⃣ Total publications
    const totalPosts = await pool.query(
      "SELECT COUNT(*) FROM posts"
    );

    // 3️⃣ Activités admin (action, pas action_type)
    const recentActivities = await pool.query(
      `SELECT id, action, description, ip_address, created_at
       FROM admin_activities
       WHERE admin_id = $1
       ORDER BY id DESC
       LIMIT 10`,
      [adminId]
    );

    // 4️⃣ Total messages envoyés
    const totalMessages = await pool.query(
      "SELECT COUNT(*) FROM admin_messages WHERE admin_id = $1",
      [adminId]
    );

    return res.json({
      status: "success",
      data: {
        members: parseInt(totalMembers.rows[0].count),
        posts: parseInt(totalPosts.rows[0].count),
        messages: parseInt(totalMessages.rows[0].count),
        activities: recentActivities.rows,
      },
    });
  } catch (error) {
    console.error("🔥 ERREUR DASHBOARD ADMIN:", error);
    return res.status(500).json({
      status: "error",
      message: "Erreur interne du serveur.",
    });
  }
};
