const User = require("../models/User");  // Updated import statement
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const {
      username,
      password,
      confirmPassword,
      email,
      role,
      gym,
      personalInfo,
      trainerProfile,
      membershipDetails,
    } = req.body;

    // Password validation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!passwordRegex.test(password)) {
      let errorMessage = "Password must contain: ";
      const requirements = [];
      if (!/(?=.*[a-z])/.test(password)) requirements.push("lowercase letter");
      if (!/(?=.*[A-Z])/.test(password)) requirements.push("uppercase letter");
      if (!/(?=.*\d)/.test(password)) requirements.push("number");
      if (!/(?=.*\W)/.test(password)) requirements.push("special character");
      if (!/.{8,}/.test(password)) requirements.push("minimum 8 characters");

      return res.status(400).json({
        success: false,
        message: errorMessage + requirements.join(", "),
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.username === username
            ? "Username already exists"
            : "Email already exists",
      });
    }

    // Check superuser
    if (role === "superuser") {
      const superuserExists = await User.findOne({ role: "superuser" });
      if (superuserExists) {
        return res.status(403).json({
          success: false,
          message: "Superuser already exists",
        });
      }
    }

    // Create user
    const user = new User({
      username,
      password,
      email,
      role,
      personalInfo,
      gym: role !== "superuser" ? gym : undefined,
      trainerProfile: role === "trainer" ? trainerProfile : undefined,
      membershipDetails: role === "user" ? membershipDetails : undefined,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const allowedUpdates = ["personalInfo", "email", "username"];

    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
