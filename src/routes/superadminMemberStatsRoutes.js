const express = require("express");
const router = express.Router();
const controller = require("../controllers/superadminMemberStatsController");
const superadminMiddleware = require("../middleware/superadminMiddleware");

router.get("/", superadminMiddleware, controller.getMemberStats);

module.exports = router;
