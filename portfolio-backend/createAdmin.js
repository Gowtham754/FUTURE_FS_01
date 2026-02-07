const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await Admin.deleteMany({ username: "admin" });

  await Admin.create({
    username: "admin",
    password: hashedPassword,
  });

  console.log("✅ Admin user created successfully");
  process.exit();
})();
