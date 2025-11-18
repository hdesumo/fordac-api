const express = require("express");
const router = express.Router();
const controller = require("../controllers/superadminMemberActivityController");
const superadminMiddleware = require("../middleware/superadminMiddleware");

router.get("/", superadminMiddleware, controller.getMemberActivities);

module.exports = router;
