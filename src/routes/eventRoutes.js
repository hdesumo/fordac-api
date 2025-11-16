const express = require("express");

const {
  createEvent,
  listEvents
} = require("../controllers/eventController.js");

const router = express.Router();

router.post("/", createEvent);
router.get("/", listEvents);

module.exports = router;
