const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// GET all notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.params.userId,
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("sender", "username profilePicture");

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET unread count
router.get("/:userId/unread", async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.params.userId,
      read: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark one as read
router.patch("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark all as read
router.patch("/:userId/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.params.userId, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE one notification
router.delete("/:id", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;