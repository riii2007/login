
const express = require("express");

const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
} = require("../controllers/blogController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const validateId = (req, res, next) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID"
    });
  }

  next();
};

const validateBlog = (req, res, next) => {
  const { title, description, category } = req.body;

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof category !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Title, description and category are required"
    });
  }

  if (title.trim().length < 3 || title.trim().length > 150) {
    return res.status(400).json({
      success: false,
      message: "Title must be 3-150 characters"
    });
  }

  if (
    description.trim().length < 10 ||
    description.trim().length > 20000
  ) {
    return res.status(400).json({
      success: false,
      message: "Description must be 10-20000 characters"
    });
  }

  if (category.trim().length < 1 || category.trim().length > 50) {
    return res.status(400).json({
      success: false,
      message: "Category must be 1-50 characters"
    });
  }

  next();
};

const validateBlogUpdate = (req, res, next) => {
  const allowedFields = ["title", "description", "category"];
  const fields = Object.keys(req.body);

  if (
    fields.length === 0 ||
    fields.some(field => !allowedFields.includes(field))
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide valid blog fields to update"
    });
  }

  const rules = {
    title: value =>
      typeof value === "string" &&
      value.trim().length >= 3 &&
      value.trim().length <= 150,
    description: value =>
      typeof value === "string" &&
      value.trim().length >= 10 &&
      value.trim().length <= 20000,
    category: value =>
      typeof value === "string" &&
      value.trim().length >= 1 &&
      value.trim().length <= 50
  };

  for (const field of fields) {
    if (!rules[field](req.body[field])) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${field}`
      });
    }
  }

  next();
};

// Public routes
router.get("/", getBlogs);
router.get("/:id", validateId, getBlogById);

// Protected routes
router.post("/", authMiddleware, validateBlog, createBlog);

router.put(
  "/:id",
  authMiddleware,
  validateId,
  validateBlogUpdate,
  updateBlog
);

router.delete(
  "/:id",
  authMiddleware,
  validateId,
  deleteBlog
);

module.exports = router;
