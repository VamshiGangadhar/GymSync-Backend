const Calories = require("../models/caloriesModel");
const User = require("../models/User");
const foodCalorieDB = require("../static/foodCalorieDB.json");

// Get user's calorie data
const getUserCalorieData = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure the userId is treated as a string if necessary
    const meals = await Calories.find({ userId });
    if (!meals.length) {
      return res.status(404).json({ message: "No meals found for this user." });
    }

    // Calculate total calories for each meal and add it to the meal object
    const mealsWithCalories = meals.map((meal) => {
      const totalCalories = meal.foodItems.reduce(
        (sum, item) => sum + item.calories,
        0
      );
      return { ...meal.toObject(), totalCalories };
    });

    res.status(200).json(mealsWithCalories);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching calorie data", details: err.message });
  }
};

const addMeal = async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from the URL
    const { mealName, foodItems } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Calculate total calories
    let totalCalories = 0;
    const processedFoodItems = foodItems.map((item) => {
      const caloriePerGram = foodCalorieDB[item.name.toLowerCase()];
      if (caloriePerGram === undefined) {
        throw new Error(`Unknown food item: ${item.name}`);
      }
      const itemCalories = item.weight * caloriePerGram;
      totalCalories += itemCalories;
      return { ...item, calories: itemCalories };
    });

    // Create a new meal entry
    const newMeal = new Calories({
      userId, // Pass the userId here
      mealName,
      foodItems: processedFoodItems,
      totalCalories,
      date: new Date(),
    });

    // Save to the database
    const savedMeal = await newMeal.save();
    res.status(201).json(savedMeal);
  } catch (err) {
    res.status(400).json({ error: "Error adding meal", details: err.message });
  }
};

// Update a meal
const updateMeal = async (req, res) => {
  const { userId, mealId } = req.params;
  const { mealName, calories } = req.body;

  try {
    const updatedMeal = await Calories.findOneAndUpdate(
      { _id: mealId, userId },
      { mealName, calories },
      { new: true }
    );

    if (!updatedMeal)
      return res.status(404).json({ message: "Meal not found for this user." });

    res.status(200).json(updatedMeal);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error updating meal", details: err.message });
  }
};

// Delete a meal
const deleteMeal = async (req, res) => {
  const { userId, mealId } = req.params;

  try {
    const deletedMeal = await Calories.findOneAndDelete({
      _id: mealId,
      userId,
    });

    if (!deletedMeal)
      return res.status(404).json({ message: "Meal not found for this user." });

    res.status(200).json({ message: "Meal deleted successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error deleting meal", details: err.message });
  }
};

// Get daily calorie summary
const getDailySummary = async (req, res) => {
  const { userId } = req.params;
  const date = new Date().toISOString().split("T")[0]; // Current date in 'YYYY-MM-DD' format

  try {
    const meals = await Calories.find({
      userId,
      date: { $gte: new Date(date), $lt: new Date(date + "T23:59:59") },
    });

    const totalCalories = meals.reduce(
      (sum, meal) => sum + meal.totalCalories,
      0
    );

    res.status(200).json({ totalCalories, meals });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching daily summary", details: err.message });
  }
};

const getWeeklySummary = async (req, res) => {
  const { userId } = req.params;
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - 7));
  const endOfWeek = new Date();

  console.log(startOfWeek, endOfWeek);

  try {
    const meals = await Calories.find({
      userId,
      date: { $gte: startOfWeek, $lt: endOfWeek },
    });

    const totalCalories = meals.reduce(
      (sum, meal) => sum + meal.calories,
      0
    );

    res.status(200).json({ totalCalories, meals });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching weekly summary", details: err.message });
  }
};

module.exports = {
  getUserCalorieData,
  addMeal,
  updateMeal,
  deleteMeal,
  getDailySummary,
  getWeeklySummary,
};
