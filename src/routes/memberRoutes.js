const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const auth = require("../middleware/authMiddleware");

// 🔥 Route d'enregistrement d'un membre (adhésion via la vitrine)
router.post("/register", memberController.createMember);

// 🔐 Dashboard membre (accès protégé)
router.get("/profile", auth(["membre"]), memberController.profile);

module.exports = router;
