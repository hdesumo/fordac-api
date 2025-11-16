// src/routes/memberRoutes.js (CommonJS)

const express = require("express");
const {
  listMembers,
  getMemberById,
  createMember,
  updateMember,
  approveMember
} = require("../controllers/memberController");
  
// Nous utilisons le middleware commun déjà converti :
const {
  requireAuth,
  requireAdmin,
  requireSuperAdmin
} = require("../middleware/verifyToken");

const router = express.Router();

/* ----------------------------------------------------------
   🔓 Route publique — inscription d’un membre
---------------------------------------------------------- */
router.post("/register", createMember);

/* ----------------------------------------------------------
   🔒 Routes protégées admin / superadmin
---------------------------------------------------------- */

// Liste de tous les membres
router.get("/", requireAdmin, listMembers);

// Détails d’un membre
router.get("/:id", requireAdmin, getMemberById);

// Modifier un membre
router.put("/:id", requireAdmin, updateMember);

// Approuver un membre
router.put("/:id/approve", requireSuperAdmin, approveMember);

// EXPORT COMMONJS
module.exports = router;
