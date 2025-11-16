const express = require("express");
const { requireAuth } = require("../middleware/verifyToken.js");

const {
  listMessages,
  sendMessage
} = require("../controllers/messagesController.js");

const router = express.Router();

router.get("/", requireAuth, listMessages);
router.post("/", requireAuth, sendMessage);

module.exports = router;
