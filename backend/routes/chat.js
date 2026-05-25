const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");

// Get all users (for All Members tab)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "username profilePicture _id");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get conversation between two users
router.get("/conversation/:userId/:otherUserId", async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username profilePicture");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message
router.post("/send", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const message = new Message({ sender: senderId, receiver: receiverId, content });
    await message.save();
    const populated = await message.populate("sender", "username profilePicture");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent conversations + unread counts
router.get("/recent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender receiver", "username profilePicture _id");

    const seen = new Set();
    const conversations = [];

    for (const msg of messages) {
      const partner =
        msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
      if (!seen.has(partner._id.toString())) {
        seen.add(partner._id.toString());
        const unreadCount = await Message.countDocuments({
          sender: partner._id,
          receiver: userId,
          read: false,
        });
        conversations.push({
          user: partner,
          lastMessage: msg.content,
          lastTime: msg.createdAt,
          unreadCount,
        });
      }
    }
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark messages as read
router.post("/mark-read", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    await Message.updateMany(
      { sender: senderId, receiver: receiverId, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread count for header badge
router.get("/unread-count/:userId", async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.params.userId,
      read: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;