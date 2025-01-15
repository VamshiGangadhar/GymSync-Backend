const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const testRoutes = require("./routes/testRoutes");
const calorieTrackerRoutes = require("./routes/calorieTrackerRoutes")
const workOutTrackerRoutes = require("./routes/workOutTrackerRoutes");

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

app.listen(3002, () => {
  console.log("Server running on port 3002");
});

module.exports = app;
