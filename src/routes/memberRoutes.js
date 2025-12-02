const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");

// =======================================================
//  ROUTES ADHÉSION — FORDAC CONNECT
// =======================================================

// 🟩 FORMULAIRE D’ADHÉSION — CRÉATION D’UN MEMBRE
router.post("/register", memberController.createMember);

// 🟩 PROFIL MEMBRE (protégé, si middleware existe)
try {
  const authMiddleware = require("../middlewares/authMiddleware");
  router.get("/profile", authMiddleware, memberController.profile);
} catch (e) {
  // Si ton projet n'a pas encore de middleware, on ignore
  console.log("ℹ️ Middleware auth non trouvé, route /profile non protégée.");
  router.get("/profile", memberController.profile);
}

// =======================================================
// EXPORT ROUTER
// =======================================================
module.exports = router;
