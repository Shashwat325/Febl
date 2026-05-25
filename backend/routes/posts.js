const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
// ✅ Get all posts (latest first)
const { createNotification } = require("../utils/notify");

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "username")
      .populate("community", "name");
    const postsWithCommentCount = await Promise.all(
      posts.map(async (post) => {
        const count = await Comment.countDocuments({ post: post._id });

        return {
          ...post.toObject(),
          commentCount: count,
        };
      })
    );
    res.json(postsWithCommentCount);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ✅ CREATE POST
router.post("/", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    await newPost.save();

    res.json(newPost);
    const creator = await User.findById(newPost.author);
    if (creator) {
      creator.CreatedPosts.addToSet(newPost._id);
      await creator.save();
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
router.post("/:postId/vote", async (req, res) => {
  const { userId, action } = req.body;
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post || !user) {
      return res.status(404).json({ message: "Post or user not found" });
    }
    console.log("upvoters", post.upvotes);
    console.log("downvoters", post.downvotes);
    // ✅ FIX: Convert the Array of ObjectIds to an Array of Strings for comparison
    const upvotesStrings = post.upvotes.map(id => id.toString());
    const downvotesStrings = post.downvotes.map(id => id.toString());

    const hasUpvoted = upvotesStrings.includes(userId);
    const hasDownvoted = downvotesStrings.includes(userId);

    if (action === "up") {
      if (hasDownvoted) post.downvotes.pull(userId);

      if (hasUpvoted) {
        post.upvotes.pull(userId);
        user.likedPosts.pull(postId);
      } else {
        post.upvotes.addToSet(userId); // Use addToSet to prevent duplicates
        user.likedPosts.addToSet(postId);
      }
    }
    if (action === "up" && !hasUpvoted) {
      // Someone upvoted — notify the post author
      await createNotification({
        recipient: post.author,
        sender: userId,
        type: "post_upvote",
        message: "upvoted your post",
        link: `/post/${post._id}`,
      });
    }

    if (action === "down") {
      if (hasUpvoted) {
        post.upvotes.pull(userId);
        user.likedPosts.pull(postId);
      }

      if (hasDownvoted) {
        post.downvotes.pull(userId);
      } else {
        post.downvotes.addToSet(userId);
      }
    }

    // ✅ Sync the likesCount helper field
    post.likesCount = post.upvotes.length - post.downvotes.length;

    await post.save();
    await user.save();

    // ✅ Send back exactly what the frontend needs
    res.json({
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      userVote: post.upvotes.map(id => id.toString()).includes(userId) ? "up" :
        post.downvotes.map(id => id.toString()).includes(userId) ? "down" : null
    });

  } catch (err) {
    console.error("Vote Error:", err);
    res.status(500).json(err);
  }
});
router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author");
  res.json(post);
});

module.exports = router;