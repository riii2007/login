const express = require("express");

const {
  register,
  login,
  getMe,
  logout
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/register", (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required"
    });
  }

  if (typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid input types"
    });
  }

  if (name.trim().length < 2 || name.trim().length > 50) {
    return res.status(400).json({
      success: false,
      message: "Name must be between 2 and 50 characters"
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address"
    });
  }

  if (
    password.length < 8 ||
    password.length > 72 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be 8-72 characters and contain uppercase, lowercase and a number"
    });
  }

  next();
}, register);

// User login
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid email and password are required"
    });
  }

  next();
}, login);


router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

module.exports = router;
