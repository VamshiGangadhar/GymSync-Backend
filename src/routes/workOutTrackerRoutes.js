const express = require("express");
const router = express.Router();

const {
  addWorkOut,
  getDaySummary,
  getWeekSummary,
} = require("../controllers/workOutTrackerController");

router.post("/:userId/add-workout", addWorkOut);

router.get("/:userId/day-summary", getDaySummary);

router.get("/:userId/week-summary", getWeekSummary);

module.exports = router;
