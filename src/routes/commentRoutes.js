// routes/commentRoutes.js

const express = require("express");
const router = express.Router();

const memberMiddleware = require("../middleware/memberMiddleware");
const commentController = require("../controllers/commentController");

// Commenter une publication
router.post("/", memberMiddleware, commentController.commentPublication);

module.exports = router;
