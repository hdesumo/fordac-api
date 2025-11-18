const express = require("express");
const router = express.Router();
const db = require("../db");
const adminMiddleware = require("../middleware/adminMiddleware");

// Liste complète
router.get("/", adminMiddleware, async (req, res) => {
  const adminId = req.admin.id;

  const rows = await db.query(
    `SELECT * FROM admin_notifications 
     WHERE admin_id=$1 
     ORDER BY id DESC`,
    [adminId]
  );

  res.json({ notifications: rows.rows });
});

// Nombre non lus
router.get("/unread-count", adminMiddleware, async (req, res) => {
  const adminId = req.admin.id;

  const count = await db.query(
    `SELECT COUNT(*) FROM admin_notifications 
     WHERE admin_id=$1 AND is_read=false`,
    [adminId]
  );

  res.json({ unread: parseInt(count.rows[0].count) });
});

// Marquer comme lu
router.put("/mark-read/:id", adminMiddleware, async (req, res) => {
  await db.query(
    `UPDATE admin_notifications SET is_read=true WHERE id=$1`,
    [req.params.id]
  );

  res.json({ success: true });
});

// Supprimer
router.delete("/delete/:id", adminMiddleware, async (req, res) => {
  await db.query(
    `DELETE FROM admin_notifications WHERE id=$1`,
    [req.params.id]
  );

  res.json({ success: true });
});

module.exports = router;
