const express = require("express");
const router = express.Router();

const {
  registerMember,
  loginMember,
  getMemberProfile,
} = require("../controllers/authMemberController");

// ROUTE : Inscription membre
router.post("/register", registerMember);

// ROUTE : Connexion membre
router.post("/login", loginMember);

// ROUTE : Récupération du profil après login
router.get("/me", getMemberProfile);

module.exports = router;
