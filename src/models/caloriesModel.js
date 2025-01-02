const mongoose = require('mongoose');

const calorieSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  mealName: { type: String, required: true },
  foodItems: [
    {
      name: { type: String, required: true },
      weight: { type: Number, required: true },
      calories: { type: Number, required: true },
    },
  ],
  totalCalories: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Calories = mongoose.model('Calories', calorieSchema);
module.exports = Calories;
