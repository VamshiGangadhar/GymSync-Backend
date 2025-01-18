// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["superuser", "admin", "trainer", "user"],
      default: "user",
    },
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: function () {
        return this.role !== "superuser";
      },
    },
    personalInfo: {
      firstName: { type: String },
      lastName: { type: String },
      phone: { type: String },
      dateOfBirth: { type: Date },
    },
    trainerProfile: {
      certifications: [
        {
          name: { type: String },
          issuedBy: { type: String },
          issueDate: { type: Date },
          expiryDate: { type: Date },
          verificationUrl: { type: String },
        },
      ],
      expertise: [{ type: String }],
      experience: { type: Number },
      biography: { type: String },
      specializations: [{ type: String }],
      availability: [
        {
          day: {
            type: String,
            enum: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
          },
          slots: [
            {
              startTime: { type: String },
              endTime: { type: String },
              isBooked: { type: Boolean, default: false },
            },
          ],
        },
      ],
    },
    membershipDetails: {
      plan: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
      },
      assignedTrainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
