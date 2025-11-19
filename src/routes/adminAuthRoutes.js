// src/routes/adminAuthRoutes.js
const express = require("express");
const router = express.Router();

const { login } = require("../controllers/authAdminController");

// Route de connexion admin
router.post("/login", login);

module.exports = router;
