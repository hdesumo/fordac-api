const express = require("express");
const router = express.Router();

const { login } = require("../controllers/authAdminController");

// Connexion admin
router.post("/login", login);

module.exports = router;
