const express = require("express");
const router = express.Router();
const memberAuthController = require("../controllers/memberAuthController");
const memberMiddleware = require("../middleware/memberMiddleware");

// Connexion membre
router.post("/login", memberAuthController.memberLogin);

// Changement de PIN
router.post("/change-pin", memberMiddleware, memberAuthController.changePin);

// Récupération profil membre
router.get("/profile", memberMiddleware, memberAuthController.memberProfile);

module.exports = router;
