
const Blog = require("../models/blogModel");

const createBlog = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    const blog = await Blog.create({
      title,
      description,
      category,
      author: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

const getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    next(error);
  }
};

const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    return res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

const updateBlog = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) {
      updates.description = description;
    }
    if (category !== undefined) updates.category = category;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update"
      });
    }

    for (const key of Object.keys(updates)) {
      if (typeof updates[key] !== "string" || !updates[key].trim()) {
        return res.status(400).json({
          success: false,
          message: `${key} must be a non-empty string`
        });
      }

      updates[key] = updates[key].trim();
    }

    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!blog) {
      const exists = await Blog.exists({ _id: req.params.id });

      return res.status(exists ? 403 : 404).json({
        success: false,
        message: exists
          ? "You can only update your own blogs"
          : "Blog not found"
      });
    }

    return res.json({
      success: true,
      message: "Blog updated successfully",
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndDelete({
      _id: req.params.id,
      author: req.user.id
    });

    if (!blog) {
      const exists = await Blog.exists({ _id: req.params.id });

      return res.status(exists ? 403 : 404).json({
        success: false,
        message: exists
          ? "You can only delete your own blogs"
          : "Blog not found"
      });
    }

    return res.json({
      success: true,
      message: "Blog deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
};
