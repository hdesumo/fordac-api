const express = require("express");
const router = express.Router();
const db = require("../db");
const superadminMiddleware = require("../middlewares/superadminMiddleware");

// Liste complète
router.get("/", superadminMiddleware, async (req, res) => {
  const result = await db.query(
    `
    SELECT a.id, a.action, a.description, a.ip_address, a.user_agent, a.link, a.created_at,
           ad.name AS admin_name
    FROM admin_activities a
    JOIN admins ad ON ad.id = a.admin_id
    ORDER BY a.id DESC
    `
  );

  res.json(result.rows);
});

module.exports = router;
