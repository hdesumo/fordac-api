const express = require("express");
const router = express.Router();

const { loginAdmin } = require("../controllers/authAdminController");

// Route de connexion admin
router.post("/login", loginAdmin);

module.exports = router;
