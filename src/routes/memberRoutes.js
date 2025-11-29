const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const auth = require("../middleware/authMiddleware");

// DASHBOARD MEMBRE
router.get("/profile", auth(["membre"]), memberController.profile);

module.exports = router;
