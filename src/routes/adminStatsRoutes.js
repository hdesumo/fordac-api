const express = require("express");
const router = express.Router();
const db = require("../config/db");

const adminMiddleware = require("../middleware/adminMiddleware");

// 📊 STATISTIQUES POUR LE DASHBOARD ADMIN
router.get("/", adminMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.id;

    // 1. Notifications non lues
    const unread = await db.query(
      `SELECT COUNT(*) FROM admin_notifications WHERE admin_id=$1 AND is_read=false`,
      [adminId]
    );

    // 2. Activités totales
    const activitiesCount = await db.query(
      `SELECT COUNT(*) FROM admin_activities WHERE admin_id=$1`,
      [adminId]
    );

    // 3. Dernières activités
    const lastActivities = await db.query(
      `
      SELECT id, action, description, created_at
      FROM admin_activities
      WHERE admin_id=$1
      ORDER BY id DESC
      LIMIT 10
      `,
      [adminId]
    );

    // 4. Dernières notifications
    const lastNotifications = await db.query(
      `
      SELECT id, type, title, message, is_read, created_at
      FROM admin_notifications
      WHERE admin_id=$1
      ORDER BY id DESC
      LIMIT 5
      `,
      [adminId]
    );

    return res.json({
      notificationsUnread: parseInt(unread.rows[0].count),
      activities: parseInt(activitiesCount.rows[0].count),
      lastActivities: lastActivities.rows,
      lastNotifications: lastNotifications.rows
    });

  } catch (error) {
    console.error("Erreur admin stats:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
