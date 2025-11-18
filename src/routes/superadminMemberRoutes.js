const express = require("express");
const router = express.Router();
const controller = require("../controllers/superadminMemberController");
const superadminMiddleware = require("../middleware/superadminMiddleware");

// LISTE + RECHERCHE + FILTRES + PAGINATION
router.get("/", superadminMiddleware, controller.getMembers);

// DÉTAIL
router.get("/:id", superadminMiddleware, controller.getMemberById);

// MISE À JOUR
router.put("/:id", superadminMiddleware, controller.updateMember);

// SUPPRESSION
router.delete("/:id", superadminMiddleware, controller.deleteMember);

module.exports = router;
