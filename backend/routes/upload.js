const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const getFilePath = (filename) => `/uploads/${filename}`;

// Post media upload — images and videos
router.post("/", upload.array("media", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files received" });
    }
    const filePaths = req.files.map(file => getFilePath(file.filename));
    res.json(filePaths);
  } catch (err) {
    console.error("Upload route error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Profile picture or banner upload
router.post("/:userId", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const imagePath = getFilePath(req.file.filename);
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