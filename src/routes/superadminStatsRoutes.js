const express = require("express");
const router = express.Router();
const db = require("../db");
const superadminMiddleware = require("../middleware/superadminMiddleware");

// 📊 ROUTE : STATISTIQUES POUR LE DASHBOARD
router.get("/", superadminMiddleware, async (req, res) => {
  try {
    // 1. Nombre admins
    const adminsCount = await db.query(`SELECT COUNT(*) FROM admins`);

    // 2. Nombre membres
    const membersCount = await db.query(`SELECT COUNT(*) FROM users`);

    // 3. Statut membres
    const membersActive = await db.query(
      `SELECT COUNT(*) FROM users WHERE status='active'`
    );
    const membersPending = await db.query(
      `SELECT COUNT(*) FROM users WHERE status='pending'`
    );
    const membersSuspended = await db.query(
      `SELECT COUNT(*) FROM users WHERE status='suspended'`
    );

    // 4. Activités admin
    const activitiesCount = await db.query(
      `SELECT COUNT(*) FROM admin_activities`
    );

    // 5. Notifications superadmin non lues
    const notificationsUnread = await db.query(
      `SELECT COUNT(*) FROM superadmin_notifications WHERE is_read = false`
    );

    // 6. Dernières activités
    const lastActivities = await db.query(`
      SELECT a.id, a.action, a.description, a.created_at, ad.name AS admin_name
      FROM admin_activities a
      JOIN admins ad ON ad.id = a.admin_id
      ORDER BY a.id DESC
      LIMIT 10
    `);

    // 7. Derniers admins créés
    const lastAdmins = await db.query(`
      SELECT id, name, email, created_at
      FROM admins
      ORDER BY id DESC
      LIMIT 5
    `);

    // 8. Derniers membres inscrits
    const lastMembers = await db.query(`
      SELECT id, name, email, membership_level, created_at
      FROM users
      ORDER BY id DESC
      LIMIT 5
    `);

    return res.json({
      admins: parseInt(adminsCount.rows[0].count),
      members: parseInt(membersCount.rows[0].count),
      membersActive: parseInt(membersActive.rows[0].count),
      membersPending: parseInt(membersPending.rows[0].count),
      membersSuspended: parseInt(membersSuspended.rows[0].count),
      activities: parseInt(activitiesCount.rows[0].count),
      notificationsUnread: parseInt(notificationsUnread.rows[0].count),
      lastActivities: lastActivities.rows,
      lastAdmins: lastAdmins.rows,
      lastMembers: lastMembers.rows
    });

  } catch (error) {
    console.error("Erreur stats superadmin:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
