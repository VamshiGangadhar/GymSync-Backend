const Workout = require("../models/workOutTrackerModel");
const User = require("../models/User");

const addWorkOut = async (req, res) => {
  try {
    const { userId } = req.params;
    const { exercises, date, totalVolume } = req.body;
    const workout = new Workout({
      userId,
      date: date,
      exercises: exercises,
    });

    await workout.save();
    res.status(201).json({
      message: "Workout added successfully",
      workoutId: workout._id,
      totalVolume,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while adding the workout",
      error: error.message,
    });
  }
};

const getDaySummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const workouts = await Workout.find({ userId, date: { $gte: date, $lt: new Date(date.getTime() + 86400000) } });
    if (!workouts.length) {
      return res
        .status(404)
        .json({ message: "No workouts found for the given date" });
    }
    let totalVolume = 0;
    workouts.forEach((workout) => {
      totalVolume += workout.totalVolume;
    });
    res.status(200).json({
      message: "Workout summary for the given date",
      workouts: workouts,
      totalVolume,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving the workout summary",
      error: error.message,
    });
  }
};

const getWeekSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentDate = new Date();
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - 7
    );
    const workouts = await Workout.find({
      userId,
      date: { $gte: startDate, $lte: currentDate },
    });
    if (!workouts.length) {
      return res
        .status(404)
        .json({ message: "No workouts found for the last week" });
    }
    let totalVolume = 0;
    workouts.forEach((workout) => {
      totalVolume += workout.totalVolume;
    });
    res.status(200).json({
      message: "Workout summary for the last week",
      workouts: workouts,
      totalVolume,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving the workout summary",
      error: error.message,
    });
  }
};
module.exports = {
  addWorkOut,
  getDaySummary,
  getWeekSummary,
};
