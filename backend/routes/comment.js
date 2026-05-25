const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const { createNotification } = require("../utils/notify");

// GET comments for a post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a comment
router.post("/:postId", async (req, res) => {
  try {
    const { content, userId } = req.body;
    const { postId } = req.params;

    const comment = new Comment({
      content,
      author: userId,
      post: postId,
    });

    await comment.save();
    await comment.populate("author", "username profilePicture");

    // Notify post author
    const post = await Post.findById(postId);
    if (post) {
      await createNotification({
        recipient: post.author,
        sender: userId,
        type: "post_comment",
        message: `commented on your post`,
        link: `/post/${postId}`,
      });
    }

    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;