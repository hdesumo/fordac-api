const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middleware/adminMiddleware");
const adminForumController = require("../controllers/adminForumController");

// 🔥 PROTÉGÉ : ADMIN UNIQUEMENT
router.use(adminMiddleware);

// Liste des sujets
router.get("/topics", adminForumController.getAllTopics);

// Détails sujet + messages
router.get("/topics/:id", adminForumController.getTopicDetails);

// Supprimer un sujet
router.delete("/topics/:id", adminForumController.deleteTopic);

// Supprimer un message
router.delete("/posts/:id", adminForumController.deletePost);

// Approuver un message modéré
router.post("/posts/:id/approve", adminForumController.approvePost);

// Shadow-ban d'un utilisateur
router.post("/users/:id/shadowban", adminForumController.shadowBanUser);

// Retrait du shadow-ban
router.post("/users/:id/unshadow", adminForumController.removeShadowBan);

// Liste des signalements
router.get("/reports", adminForumController.getReports);

module.exports = router;
