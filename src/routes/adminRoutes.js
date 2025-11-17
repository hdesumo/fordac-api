const express = require("express");
const router = express.Router();

const {
  createAdmin,
  listAdmins,
  deleteAdmin,
} = require("../controllers/adminController.js");

const {
  verifyToken,
  requireSuperAdmin,
} = require("../middleware/authMiddleware.js");

// Routes Admin (CRUD géré uniquement par le superadmin)
router.post("/", verifyToken, requireSuperAdmin, createAdmin);
router.get("/", verifyToken, requireSuperAdmin, listAdmins);
router.delete("/:id", verifyToken, requireSuperAdmin, deleteAdmin);

// ❌ IMPORTANT : on supprime totalement l’ancienne route de login
// router.post("/login", adminLogin);

module.exports = router;
