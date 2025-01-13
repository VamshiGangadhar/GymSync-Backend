const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/:gym/gym-members", userController.getGymMembers);
router.post(
  "/api/users/:user/gym-members/:selectedMemberId",
  userController.updateUser
);

module.exports = router;
