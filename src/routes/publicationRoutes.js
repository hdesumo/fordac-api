// routes/publicationRoutes.js

const express = require("express");
const router = express.Router();

const memberMiddleware = require("../middleware/memberMiddleware");
const publicationController = require("../controllers/publicationController");

// Voir publications approuvées
router.get("/", publicationController.getPublications);

// Soumettre une publication (membre)
router.post("/", memberMiddleware, publicationController.submitPublication);

// Approuver publication (admin)
router.post("/approve", publicationController.approvePublication);

// Refuser publication (admin)
router.post("/reject", publicationController.rejectPublication);

module.exports = router;
