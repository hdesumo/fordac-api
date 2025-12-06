const express = require("express");
const router = express.Router();

const memberMiddleware = require("../middleware/memberMiddleware");
const memberForumController = require("../controllers/memberForumController");

// 📌 Récupérer liste des sujets
router.get(
  "/sujets",
  memberMiddleware,
  memberForumController.getSujets
);

// 📌 Récupérer un sujet + ses commentaires
router.get(
  "/sujets/:id",
  memberMiddleware,
  memberForumController.getSujetById
);

// 📌 Créer un sujet
router.post(
  "/sujets",
  memberMiddleware,
  memberForumController.createSujet
);

// 📌 Créer un commentaire dans un sujet
router.post(
  "/sujets/:id/commentaires",
  memberMiddleware,
  memberForumController.createCommentaire
);

module.exports = router;
