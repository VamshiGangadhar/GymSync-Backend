// routes/gymRoutes.js
const express = require("express");
const router = express.Router();
const gymController = require("../controllers/gymController");
const { authenticate, authorize } = require("../middlewares/auth");

// Apply authentication middleware to all routes
router.use(authenticate);

// Create gym (superuser only)
router.post("/", authorize(["superuser"]), gymController.createGym);

// Update gym
router.put(
  "/:gymId",
  authorize(["superuser", "admin"]),
  gymController.updateGym
);

// Get gym members
router.get(
  "/:gymId/members",
  authorize(["admin", "trainer"]),
  gymController.getGymMembers
);

// Assign trainer to user
router.post(
  "/:gymId/assign-trainer",
  authorize(["admin"]),
  gymController.assignTrainer
);

module.exports = router;
