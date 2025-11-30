// src/controllers/adminDashboardController.js

const pool = require("../config/db");

// Fonction : tableau de bord admin
exports.getAdminDashboardStats = async (req, res) => {
  console.log("📊 [ADMIN DASHBOARD] Requête reçue");

  try {
    const adminId = req.admin?.id || null;
    console.log("🔐 Admin ID depuis token:", adminId);

    // Vérification du token
    if (!adminId) {
      console.error("⛔ Token invalide ou admin inexistant");
      return res.status(401).json({ message: "Token invalide." });
    }

    console.log("📥 Extraction des statistiques...");

    // 1️⃣ Nombre total de membres
    const totalMembersQuery = `
      SELECT COUNT(*) AS total
      FROM members
    `;
    const totalMembersResult = await pool.query(totalMembersQuery);
    const totalMembers = parseInt(totalMembersResult.rows[0].total);
    console.log("👥 Total membres:", totalMembers);

    // 2️⃣ 10 dernières activités d'admin
    const lastActivitiesQuery = `
      SELECT id, admin_id, action, description, ip_address, user_agent, link, created_at
      FROM admin_activities
      ORDER BY id DESC
      LIMIT 10
    `;
    const lastActivitiesResult = await pool.query(lastActivitiesQuery);

    console.log(
      `🕒 Dernières activités récupérées: ${lastActivitiesResult.rowCount}`
    );

    // 3️⃣ Total publications (posts)
    const totalPostsQuery = `SELECT COUNT(*) AS total FROM posts`;
    const totalPostsResult = await pool.query(totalPostsQuery);
    const totalPosts = parseInt(totalPostsResult.rows[0].total);
    console.log("📝 Total publications:", totalPosts);

    // 4️⃣ Total événements
    const totalEventsQuery = `SELECT COUNT(*) AS total FROM events`;
    const totalEventsResult = await pool.query(totalEventsQuery);
    const totalEvents = parseInt(totalEventsResult.rows[0].total);
    console.log("📅 Total événements:", totalEvents);

    // 5️⃣ Total messages reçus (dans contact_messages)
    const totalMessagesQuery = `SELECT COUNT(*) AS total FROM contact_messages`;
    const totalMessagesResult = await pool.query(totalMessagesQuery);
    const totalMessages = parseInt(totalMessagesResult.rows[0].total);
    console.log("✉️ Total messages:", totalMessages);

    // Réponse envoyée au frontend
    const responsePayload = {
      status: "success",
      dashboard: {
        totalMembers,
        totalPosts,
        totalEvents,
        totalMessages,
        lastActivities: lastActivitiesResult.rows ?? [],
      },
    };

    console.log("📤 Données envoyées au frontend:", responsePayload);

    return res.json(responsePayload);
  } catch (error) {
    console.error("🔥 ERREUR DASHBOARD ADMIN:", error);

    return res.status(500).json({
      status: "error",
      message: "Erreur serveur lors de la récupération du tableau de bord.",
      details: error.message,
    });
  }
};
