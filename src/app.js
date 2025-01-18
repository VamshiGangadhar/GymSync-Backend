const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const testRoutes = require("./routes/testRoutes");
const calorieTrackerRoutes = require("./routes/calorieTrackerRoutes");
const workOutTrackerRoutes = require("./routes/workOutTrackerRoutes");
const gymRoutes = require("./routes/gymRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/users", userRoutes);
app.use("/api/test", testRoutes);
app.use("/api/calorie-tracker", calorieTrackerRoutes);
app.use("/api/workout-tracker", workOutTrackerRoutes);
app.use("/api/gym", gymRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
