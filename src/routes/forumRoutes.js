// routes/forumRoutes.js

const express = require("express");
const router = express.Router();

const memberMiddleware = require("../middleware/memberMiddleware");
const forumController = require("../controllers/forumController");

// Liste des sujets
router.get("/topics", forumController.getTopics);

// Créer un sujet
router.post("/topics", memberMiddleware, forumController.createTopic);

// Répondre à un sujet
router.post("/topics/reply", memberMiddleware, forumController.replyToTopic);

// Fermer un sujet (admin)
router.post("/topics/close", forumController.closeTopic);

module.exports = router;
