const express = require("express");
const router = express.Router();
const controller = require("../controllers/superadminMemberExportController");
const superadminMiddleware = require("../middleware/superadminMiddleware");

router.get("/excel", superadminMiddleware, controller.exportExcel);
router.get("/pdf", superadminMiddleware, controller.exportPdf);

module.exports = router;
