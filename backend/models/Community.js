const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },

  description: String,

  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],

  tags: [String],

  membersCount: {
    type: Number,
    default: 1
  },

  onlineMembers: {
    type: Number,
    default: 0
  },

  // ✅ Media
  icon: {
    type: String,
    default: "" // empty means fallback
  },

  banner: {
    type: String,
    default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
communitySchema.index({ name: "text", description: "text", tags: "text" });
module.exports = mongoose.model("Community", communitySchema);