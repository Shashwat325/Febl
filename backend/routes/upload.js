const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const User = require("../models/User");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "fictionhub",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    resource_type: "image",
  },
});

// Cloudinary storage for media (images + videos)
const mediaStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: "fictionhub/posts",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: isVideo
        ? ["mp4", "webm", "mov"]
        : ["jpg", "jpeg", "png", "gif", "webp"],
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"), false);
  }
};

const uploadMedia = multer({
  storage: mediaStorage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const uploadImage = multer({
  storage: imageStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Post media upload — images and videos
router.post("/", uploadMedia.array("media", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files received" });
    }
    const filePaths = req.files.map(file => file.path);
    res.json(filePaths);
  } catch (err) {
    console.error("Upload route error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Profile picture or banner upload
router.post("/:userId", uploadImage.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const imagePath = req.file.path;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (req.body.type === "banner") {
      user.bannerImage = imagePath;
    } else {
      user.profilePicture = imagePath;
    }
    await user.save();
    res.json(user);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Remove profile picture or banner
router.post("/remove/:userId", async (req, res) => {
  try {
    const { type } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (type === "banner") user.bannerImage = "";
    else user.profilePicture = "";
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;