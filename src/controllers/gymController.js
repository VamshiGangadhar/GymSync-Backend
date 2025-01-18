const User = require("../models/User");
const { Gym } = require("../models/gymModel");

// controllers/gymController.js
exports.createGym = async (req, res) => {
  try {
    const { name, address, contactNumber } = req.body;
    const createdBy = req.user._id;

    const user = await User.findById(createdBy);

    if (!(user.role == "superuser")) {
      return res.status(403).json({
        success: false,
        message: "Only superuser can create gyms",
      });
    }

    const existingGym = await Gym.findOne({ name });
    if (existingGym) {
      return res.status(409).json({
        success: false,
        message: "Gym with this name already exists",
      });
    }

    const gym = new Gym({
      name,
      address,
      contactNumber,
      createdBy,
    });

    await gym.save();

    res.status(201).json({
      success: true,
      message: "Gym created successfully",
      gym,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateGym = async (req, res) => {
  try {
    const { gymId } = req.params;
    const updates = req.body;
    const allowedUpdates = ["name", "address", "contactNumber"];

    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const gym = await Gym.findByIdAndUpdate(gymId, filteredUpdates, {
      new: true,
      runValidators: true,
    });

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    res.json({
      success: true,
      gym,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getGymMembers = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { role, status } = req.query;

    const query = { gym: gymId };
    if (role) query.role = role;
    if (status) query.status = status;

    const members = await User.find(query)
      .select("-password")
      .populate("membershipDetails.assignedTrainer", "username personalInfo")
      .sort("role -joiningDate");

    res.json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.assignTrainer = async (req, res) => {
  try {
    const { userId, trainerId } = req.body;
    const { gymId } = req.params;

    console.log(userId, trainerId, gymId);

    const user = await User.findOne({ _id: userId, gym: gymId });
    if (!user || user.role !== "user") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const trainers = await User.find({
      gym: gymId,
      // role: "trainer"
    }).select("username personalInfo");
    if (!trainers || trainers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No trainers found in this gym."
      });
    }

    console.log(trainers);

    const trainer = await User.findOne({
      _id: trainerId,
      gym: gymId,
      role: "trainer",
    });
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    user.membershipDetails.assignedTrainer = trainerId;
    await user.save();

    res.json({
      success: true,
      message: "Trainer assigned successfully",
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
