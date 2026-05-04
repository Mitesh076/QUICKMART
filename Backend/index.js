const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/category");
const userRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB connection
mongoose
  .connect(
    // process.env.MONGODB_URI ||
    // Connect to MongoDB

    "mongodb://localhost:27017/",
    // process.env.MONGODB_URI ||
  )
  .then(() => console.log("MongoDB connection successful"))
  .catch((err) => console.log("MongoDB connection failed:", err));

// Create uploads directory if it doesn't exist
const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Routes
app.get("/api", (req, res) => {
  res.json({ message: "QuickMart API is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);

// Legacy routes for backward compatibility
app.use("/api/add/product", productRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(port, () => {
  console.log(`QuickMart API server running on port ${port}`);
});
