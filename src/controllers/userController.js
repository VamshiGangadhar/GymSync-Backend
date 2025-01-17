const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const {
      username,
      password,
      confirmPassword,
      role,
      gym,
      joiningDate,
      email,
    } = req.body;

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res
        .status(400)
        .send({ success: false, message: "Passwords do not match" });
    }

    // Check for strong password
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    let errorMessage = "Password must be at least 8 characters long";
    if (!passwordRegex.test(password)) {
      if (!/.{8,}/.test(password)) {
        errorMessage += " and include at least 8 characters";
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errorMessage += ", include at least one lowercase letter";
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errorMessage += ", include at least one uppercase letter";
      }
      if (!/(?=.*\d)/.test(password)) {
        errorMessage += ", include at least one number";
      }
      if (!/(?=.*\W)/.test(password)) {
        errorMessage += ", and include at least one special character";
      }
      return res.status(400).send({
        success: false,
        message: errorMessage + ".",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "Username already in use, please choose a different one.",
      });
    }

    const user = new User({
      username,
      password,
      role,
      gym,
      joiningDate,
      email,
    });
    await user.save();
    res.status(201).send({
      success: true,
      message: "User registered",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .send({ success: false, message: "Authentication failed" });
    }
    const { role, _id } = user;
    const token = jwt.sign({ _id: user._id }, "your_jwt_secret");
    res.send({ success: true, token, role, id: user._id });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getGymMembers = async (req, res) => {
  try {
    const { gym } = req.params;
    const users = await User.find({ gym }).select("username role -_id").lean();
    const formattedUsers = users.map((user, index) => ({
      index: index + 1,
      id: user.id || "",
      username: user.username || "",
      email: "",
      role: user.role || "user",
      joinDate: "",
    }));
    res.status(200).json(formattedUsers);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching gym members", details: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, role, email, joiningDate } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { username, role, email, joiningDate },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error updating user", details: err.message });
  }
};
