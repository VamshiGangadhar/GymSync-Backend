const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  date: { type: Date, default: Date.now },
  exercises: [
    {
      name: { type: String, required: true },
      sets: [
        {
          weight: { type: Number, required: true },
          reps: { type: Number, required: true }
        }
      ]
    }
  ]
});

const Workout = mongoose.model('Workout', workoutSchema);
module.exports = Workout;
