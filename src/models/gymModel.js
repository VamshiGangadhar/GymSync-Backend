const mongoose = require("mongoose");

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  contactNumber: { type: String, required: true },
  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: async function (v) {
          const gym = this;
          const adminCount = gym.admins.length;
          return adminCount <= 2; // Ensure max 2 admins per gym
        },
        message: "A gym can have maximum 2 admins",
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Gym = mongoose.model("Gym", gymSchema);

module.exports = { Gym };
