const express = require("express");
const router = express.Router();
const db = require("../config/db");
const superadminMiddleware = require("../middlewares/superadminMiddleware");

// LISTE
router.get("/", superadminMiddleware, async (req, res) => {
  const result = await db.query(
    "SELECT * FROM superadmin_notifications ORDER BY id DESC"
  );
  res.json(result.rows);
});

// COUNT UNREAD
router.get("/unread-count", superadminMiddleware, async (req, res) => {
  const result = await db.query(
    "SELECT COUNT(*) FROM superadmin_notifications WHERE is_read = false"
  );
  res.json({ unread: parseInt(result.rows[0].count) });
});

// MARK READ
router.patch("/mark-read/:id", superadminMiddleware, async (req, res) => {
  await db.query(
    "UPDATE superadmin_notifications SET is_read = true WHERE id = $1",
    [req.params.id]
  );
  res.json({ message: "OK" });
});

module.exports = router;
