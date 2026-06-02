const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const maskedUri = process.env.MONGO_URI 
      ? process.env.MONGO_URI.replace(/:([^@]+)@/, ":******@") 
      : "undefined";
    console.log("Connecting to MongoDB at:", maskedUri);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected successfully");
  } catch (error) {
    console.error("MongoDB Connection Error ❌:", error);
    // Do not exit the process so the Express server can still start and handle requests
  }
};

module.exports = connectDB;
