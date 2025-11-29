const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");

// LOGIN ADMIN
router.post("/auth/login", adminController.login);

// DASHBOARD STATS
router.get(
  "/dashboard/stats",
  auth(["admin"]),
  adminController.getDashboardStats
);

// LISTE DES MEMBRES
router.get(
  "/membres",
  auth(["admin"]),
  adminController.getMembers
);

// NOTIFICATIONS NON LUES
router.get(
  "/notifications/unread",
  auth(["admin"]),
  adminController.getUnreadNotifications
);

module.exports = router;
