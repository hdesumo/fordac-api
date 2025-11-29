const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdminController");
const auth = require("../middleware/authMiddleware");

// LOGIN SUPERADMIN
router.post("/auth/login", superAdminController.login);

// DASHBOARD STATS (remplace getOverview)
router.get(
  "/dashboard/stats",
  auth(["superadmin"]),
  superAdminController.getDashboardStats
);

// LISTE DES ADMINS
router.get(
  "/admins",
  auth(["superadmin"]),
  superAdminController.getAdmins
);

// MEMBRES RÉCENTS
router.get(
  "/members/recent",
  auth(["superadmin"]),
  superAdminController.getRecentMembers
);

// ACTIVITÉS RÉCENTES
router.get(
  "/activity/recent",
  auth(["superadmin"]),
  superAdminController.getRecentActivity
);

module.exports = router;
