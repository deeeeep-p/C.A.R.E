// routes/emergencyRoutes.js
const express = require("express");
const router = express.Router();
const emergencyController = require("../controllers/emergencyController");

// // POST /api/emergency
router.post("/", emergencyController.processEmergencyRequest);

module.exports = router;
