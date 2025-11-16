const express = require("express");

const {
  superAdminLogin,
  updateSuperAdminPassword
} = require("../controllers/superadminController.js");

const { verifyToken } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/login", superAdminLogin);
router.put("/password", verifyToken, updateSuperAdminPassword);

module.exports = router;
