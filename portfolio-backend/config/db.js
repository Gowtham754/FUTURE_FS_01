const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error ❌:", error);
    // Do not exit the process so the Express server can still start and handle requests
  }
};

module.exports = connectDB;
