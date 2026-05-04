const mongoose = require("mongoose");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://miteshbharvad733_db_user:54uuRYeZ8M2lkO8K@cluster0.ub8twc3.mongodb.net/?appName=Cluster0"
      // process.env.MONGODB_URI ||
      // "mongodb+srv://miteshbharvad733_db_user:54uuRYeZ8M2lkO8K@cluster0.ub8twc3.mongodb.net/"
    );
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@quickmart.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const admin = new User({
      name: "Admin",
      email: "admin@quickmart.com",
      password: "admin123", // This will be hashed automatically
      role: "admin",
    });

    await admin.save();
    console.log("Admin user created successfully");
    console.log("Email: admin@quickmart.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.connection.close();
  }
};

createAdmin();
