const pool = require("../db");

// 📌 Créer une notification
exports.createNotification = async (req, res) => {
  try {
    const { admin_id, type, title, message, link } = req.body;

    await pool.query(
      `INSERT INTO admin_notifications (admin_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [admin_id, type, title, message, link || null]
    );

    res.json({ success: true, message: "Notification créée." });
  } catch (error) {
    console.error("Erreur createNotification:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 📌 Toutes les notifications d’un admin
exports.getNotifications = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const result = await pool.query(
      `SELECT * FROM admin_notifications
       WHERE admin_id = $1
       ORDER BY created_at DESC`,
      [adminId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erreur getNotifications:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 📌 Compteur non lus
exports.getUnreadCount = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const result = await pool.query(
      `SELECT COUNT(*) FROM admin_notifications
       WHERE admin_id = $1 AND is_read = false`,
      [adminId]
    );

    res.json({ unread: Number(result.rows[0].count) });
  } catch (error) {
    console.error("Erreur getUnreadCount:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 📌 Marquer comme lu
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    await pool.query(
      `UPDATE admin_notifications
       SET is_read = true
       WHERE id = $1 AND admin_id = $2`,
      [id, adminId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur markAsRead:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
