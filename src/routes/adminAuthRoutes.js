const express = require("express");
const router = express.Router();

const authAdminController = require("../controllers/authAdminController");

router.post("/login", authAdminController.login);

module.exports = router;
