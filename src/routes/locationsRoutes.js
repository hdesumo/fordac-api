const express = require("express");

const {
  getRegions,
  getDepartements,
  getZones,
  getArrondissements
} = require("../controllers/locationsController.js");

const router = express.Router();

router.get("/regions", getRegions);
router.get("/departements/:regionId", getDepartements);
router.get("/zones/:departementId", getZones);
router.get("/arrondissements/:zoneId", getArrondissements);

module.exports = router;
