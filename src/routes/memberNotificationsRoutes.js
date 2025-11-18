const express = require("express");
const router = express.Router();

const memberMiddleware = require("../middleware/memberMiddleware");
const memberNotificationService = require("../services/memberNotificationService");

/**
 * GET /members/notifications-count
 * Nombre non lu de notifications du membre
 */
router.get("/notifications-count", memberMiddleware, async (req, res) => {
  try {
    const count = await memberNotificationService.getUnreadCount(req.member.id);
    res.json({ count });
  } catch (error) {
    console.error("Erreur notifications-count:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * GET /members/notifications
 * Liste complète des notifications
 */
router.get("/notifications", memberMiddleware, async (req, res) => {
  try {
    const list = await memberNotificationService.getAll(req.member.id);
    res.json({ notifications: list });
  } catch (error) {
    console.error("Erreur notifications list:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * POST /members/notifications/mark-read/:id
 * Marquer une notification comme lue
 */
router.post("/notifications/mark-read/:id", memberMiddleware, async (req, res) => {
  try {
    await memberNotificationService.markRead(req.params.id, req.member.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur mark-read:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
