const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOneAndUpdate(
      { username },
      { lastLogin: new Date() },
      { new: true }
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.status}. Please contact support.`,
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        gym: user.gym,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        gym: user.gym,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;