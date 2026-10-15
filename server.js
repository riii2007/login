
require("dotenv").config();

const express = require("express");
const connectDB = require("./src/config/database");
const authRoutes = require("./src/routes/authRoutes");
const blogRoutes = require("./src/routes/blogRoutes");
const errorMiddleware = require("./src/middleware/errorMiddleware");

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Login System with Blog API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

app.use(errorMiddleware);

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET ||
        process.env.JWT_SECRET.length < 32) {
      throw new Error(
        "Set JWT_SECRET to a strong secret of at least 32 characters"
      );
    }

    await connectDB();

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
