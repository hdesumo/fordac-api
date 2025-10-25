import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import verifySuperAdmin from "../middlewares/verifySuperAdmin.js";
import { getSummary, exportCSV, exportPDF } from "../controllers/adminController.js";

const router = express.Router();

router.get("/summary", verifyToken, verifySuperAdmin, getSummary);
router.get("/export/csv", verifyToken, verifySuperAdmin, exportCSV);
router.get("/export/pdf", verifyToken, verifySuperAdmin, exportPDF);

export default router;
