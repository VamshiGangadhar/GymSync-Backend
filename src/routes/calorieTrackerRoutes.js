const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getUserCalorieData,
  addMeal,
  updateMeal,
  deleteMeal,
  getDailySummary,
} = require('../controllers/calorieTrackerController');

// Route to get user's calorie data
router.get('/:userId', getUserCalorieData);

// Route to add a meal
router.post('/:userId/meal', addMeal);

// Route to update a meal
router.put('/:userId/meal/:mealId', updateMeal);

// Route to delete a meal
router.delete('/:userId/meal/:mealId', deleteMeal);

// Route to get daily calorie summary
router.get('/:userId/summary', getDailySummary);

module.exports = router;
