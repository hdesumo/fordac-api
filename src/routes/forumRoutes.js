// src/routes/forumRoutes.js

const express = require("express");
const {
  listPublishedTopics,
  getTopicWithPosts,
  createPost,
  createTopic,
  approvePost,
  rejectPost,
  hideTopic,
} = require("../controllers/forumController.js");

const {
  requireAuth,
  requireAdmin,
} = require("../middleware/verifyToken.js");

const router = express.Router();

/* ------------------- PUBLIC / MILITANTS ------------------- */

// Tous les topics publiés
router.get("/topics/published", listPublishedTopics);

// Détails d’un topic + posts approuvés
router.get("/topics/:id", getTopicWithPosts);

// Création d’un post (statut = pending)
router.post("/posts/create", createPost);


/* ------------------- ADMINISTRATION ------------------- */

// Créer un topic (admin + superadmin)
router.post("/topics/create", requireAdmin, createTopic);

// Cacher un topic
router.post("/topics/hide/:id", requireAdmin, hideTopic);

// Approuver un post
router.post("/posts/approve/:id", requireAdmin, approvePost);

// Rejeter un post
router.post("/posts/reject/:id", requireAdmin, rejectPost);


// EXPORT COMMONJS
module.exports = router;
