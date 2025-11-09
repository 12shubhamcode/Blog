const express = require("express");
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single("coverImg"), async (req, res) => {
  try {
    const { title, body } = req.body;

    // Check if file exists
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).render("error", {
        error: "Please upload an image",
        user: req.user,
      });
    }

    console.log("File received:", req.file.originalname);
    console.log("Environment variables:", {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Not set",
      apiKey: process.env.CLOUDINARY_API_KEY ? "Set" : "Not set",
      apiSecret: process.env.CLOUDINARY_API_SECRET ? "Set" : "Not set",
    });

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    console.log("Attempting to upload to Cloudinary...");
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "blog_covers",
      resource_type: "auto",
    });
    console.log("Cloudinary upload successful:", result.secure_url);

    console.log("Creating blog post...");
    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImg: result.secure_url,
    });
    console.log("Blog post created successfully:", blog._id);

    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Send a more specific error message
    let errorMessage = "Failed to create blog post";
    if (error.message.includes("Cloudinary")) {
      errorMessage = "Failed to upload image. Please try again.";
    } else if (error.name === "ValidationError") {
      errorMessage = "Please fill in all required fields.";
    }

    return res.status(500).render("error", {
      error: errorMessage,
      user: req.user,
    });
  }
});

module.exports = router;
