const express = require("express");
const User = require("../models/User");
const mongoose = require("mongoose");
const router = express.Router();
const { createNotification } = require("../utils/notify");

// ✅ MUST be before GET /:identifier
router.post("/:id/follow", async (req, res) => {
  try {
    const { followerId } = req.body;
    const targetId = req.params.id;

    if (!followerId) return res.status(400).json({ message: "followerId required" });
    if (followerId === targetId) return res.status(400).json({ message: "Cannot follow yourself" });

    const target = await User.findById(targetId);
    const follower = await User.findById(followerId);

    if (!target || !follower) return res.status(404).json({ message: "User not found" });

    const isFollowing = target.followers.some((id) => id.toString() === followerId);

    if (isFollowing) {
      target.followers = target.followers.filter((id) => id.toString() !== followerId);
      follower.following = follower.following.filter((id) => id.toString() !== targetId);
    } else {
      target.followers.push(followerId);
      follower.following.push(targetId);
    }

    await target.save();
    await follower.save();

    // ✅ Notification inside the route, before res.json
    if (!isFollowing) {
      await createNotification({
        recipient: targetId,
        sender: followerId,
        type: "follow",
        message: "started following you",
        link: `/profile/${follower.username}`,
      });
    }

    res.json({
      followed: !isFollowing,
      followersCount: target.followers.length,
      followingCount: follower.following.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/update-category", async (req, res) => {
  const { userId, category } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userId, { $addToSet: { categories: category } }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    let user;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      user = await User.findById(identifier).populate("followingCommunities");
      if (!user) user = await User.findOne({ username: identifier }).populate("followingCommunities");
    } else {
      user = await User.findOne({ username: identifier }).populate("followingCommunities");
    }
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;