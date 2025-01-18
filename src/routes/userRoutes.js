// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const gymController = require("../controllers/gymController");
const { authenticate, authorize } = require("../middlewares/auth");

// Public routes
router.post("/register", userController.register);
router.post("/login", authController.login);
router.post("/gym", authenticate, gymController.createGym);

// Protected routes
router.use(authenticate);


// get gym members

router.get(
  "/gym/:gymId/members",
  authorize(['admin', 'trainer']),
  gymController.getGymMembers
);


router.put("/user/:userId", authorize(["admin"]), userController.updateProfile);

module.exports = router;
