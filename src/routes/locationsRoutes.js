// src/routes/locationsRoutes.js
import express from "express";
import { getRegions, getDepartements, getZones, getArrondissements } from "../controllers/locationsController.js";

const router = express.Router();

router.get("/regions", getRegions);
router.get("/departements/:regionId", getDepartements);
router.get("/zones/:departementId", getZones);
router.get("/arrondissements/:zoneId", getArrondissements);

export default router;
