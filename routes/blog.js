const express = require("express");
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "blog_covers",
    });

    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImg: result.secure_url,
    });

    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).render("error", {
      error: "Failed to create blog post",
      user: req.user,
    });
  }
});

module.exports = router;
