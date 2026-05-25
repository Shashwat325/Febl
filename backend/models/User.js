const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  nationality: String,
  categories: [String], // interests
  profilePicture: {
    type: String,
    default: ""
  },

  bannerImage: {
    type: String,
    default: ""
  },
  followingCommunities: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Community" }
  ],

  likedPosts: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Post" }
  ],
  CreatedPosts: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Post" }
  ],
  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
  following: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
});

userSchema.virtual("followersCount").get(function () {
  return this.followers?.length ?? 0;
});
userSchema.virtual("followingCount").get(function () {
  return this.following?.length ?? 0;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);