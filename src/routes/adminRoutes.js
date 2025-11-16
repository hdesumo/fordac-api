const express = require("express");
const router = express.Router();

const {
  createAdmin,
  listAdmins,
  deleteAdmin,
  adminLogin,
} = require("../controllers/adminController.js");

const {
  verifyToken,
  requireSuperAdmin,
} = require("../middleware/authMiddleware.js");

router.post("/", verifyToken, requireSuperAdmin, createAdmin);
router.get("/", verifyToken, requireSuperAdmin, listAdmins);
router.delete("/:id", verifyToken, requireSuperAdmin, deleteAdmin);
router.post("/login", adminLogin);

module.exports = router;
