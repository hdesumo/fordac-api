const express = require("express");
const router = express.Router();

const {
  registerMember,
  loginMember,
  getMemberProfile,
} = require("../controllers/authMemberController");

// ==========================
//  REGISTER (POST /api/members/register)
// ==========================
router.post("/register", registerMember);

// ==========================
//  LOGIN (POST /api/members/login)
// ==========================
router.post("/login", loginMember);

// ==========================
//  PROFILE (GET /api/members/profile)
// ==========================
// ⚠️ Cette route nécessite un middleware d'auth. 
// Si tu en as un : ajouter middleware avant getMemberProfile
router.get("/profile", getMemberProfile);

module.exports = router;
