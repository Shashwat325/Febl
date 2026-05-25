const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,

  media: [String],

  tags: [String],

  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },

  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likesCount: {
    type: Number,
    default: 0
  },

  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Comment" }
  ],

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
});
postSchema.index({ title: "text", content: "text", tags: "text" });

module.exports = mongoose.model("Post", postSchema);