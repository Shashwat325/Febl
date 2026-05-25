const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const Community = require("../models/Community");
const User = require("../models/User");
const Comment = require("../models/Comment");

router.get("/", async (req, res) => {
  const { q, type = "all" } = req.query;
  if (!q || q.trim() === "") {
    return res.json({ posts: [], communities: [], users: [] });
  }

  try {
    const results = {};

    if (type === "all" || type === "posts") {
      const foundPosts = await Post.find({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { content: { $regex: q, $options: "i" } },
        ]
      })
      .populate("author", "username")
      .populate("community", "name")
      .limit(10);

      results.posts = await Promise.all(
        foundPosts.map(async (post) => {
          const commentCount = await Comment.countDocuments({ post: post._id });
          return { ...post.toObject(), commentCount };
        })
      );
    }

    if (type === "all" || type === "communities") {
      results.communities = await Community.find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ]
      }).limit(5);
    }

    if (type === "all" || type === "users") {
      results.users = await User.find({
        username: { $regex: q, $options: "i" }
      }).limit(5);
    }

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;