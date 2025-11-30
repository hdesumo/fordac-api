const express = require("express");
const router = express.Router();

const memberMiddleware = require("../middleware/memberMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const reportController = require("../controllers/reportController");

router.post("/report", memberMiddleware, reportController.reportPost);

router.get("/admin/reports", adminMiddleware, reportController.getReports);

router.delete("/admin/reports/:id", adminMiddleware, reportController.deleteReport);

module.exports = router;
