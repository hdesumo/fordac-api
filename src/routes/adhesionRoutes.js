const express = require("express");
const router = express.Router();

const {
  createAdhesion,
  listAdhesions,
  getAdhesionById,
} = require("../controllers/adhesionController.js");

router.post("/", createAdhesion);
router.get("/", listAdhesions);
router.get("/:id", getAdhesionById);

module.exports = router;
