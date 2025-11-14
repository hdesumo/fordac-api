import express from "express";
import verifyToken from "../middleware/verifyToken.js";

import {
  listPublishedTopics,
  getTopicWithPosts,
  createPost,
  createTopic,
  hideTopic,
  approvePost,
  rejectPost,
} from "../controllers/forumController.js";

const router = express.Router();

/* ==================== MILITANTS ==================== */
// Tous les sujets visibles
router.get("/topics/published", listPublishedTopics);

// Un sujet + commentaires approuvés
router.get("/topics/:id", getTopicWithPosts);

// Création d’un post → statut "pending"
router.post("/posts/create", createPost);


/* ==================== ADMIN ======================== */

// Création d’un topic
router.post(
  "/topics/create",
  verifyToken,
  (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Accès interdit" });
    }
    next();
  },
  createTopic
);

// Masquer un topic
router.post(
  "/topics/hide/:id",
  verifyToken,
  (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Accès interdit" });
    }
    next();
  },
  hideTopic
);

// Approuver un post
router.post(
  "/posts/approve/:id",
  verifyToken,
  (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Accès interdit" });
    }
    next();
  },
  approvePost
);

// Rejeter un post
router.post(
  "/posts/reject/:id",
  verifyToken,
  (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Accès interdit" });
    }
    next();
  },
  rejectPost
);

export default router;
