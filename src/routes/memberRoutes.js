// routes/memberRoutes.js
const express = require("express");
const router = express.Router();

const authMember = require("../controllers/authMemberController");
const memberProfile = require("../controllers/memberProfileController");
const memberNotif = require("../controllers/memberNotificationController");

const memberMiddleware = require("../middleware/memberMiddleware");

// AUTH
router.post("/login", authMember.loginMember);

// PROFILE
router.get("/profile", memberMiddleware, memberProfile.getProfile);
router.put("/profile", memberMiddleware, memberProfile.updateProfile);

// NOTIFICATIONS
router.get("/notifications", memberMiddleware, memberNotif.getMemberNotifications);

module.exports = router;
