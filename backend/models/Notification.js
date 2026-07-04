const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  // Who receives this notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Who triggered it
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "post_upvote",    // someone upvoted your post
      "post_comment",   // someone commented on your post
      "comment_reply",  // someone replied to your comment
      "follow",         // someone followed you
      "mention",        // someone mentioned you
    ],
    required: true,
  },
  
  link: { type: String, default: "" },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);