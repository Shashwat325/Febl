require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./models/Post");
const User = require("./models/User");

async function fill() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const posts = await Post.find({}, "_id author");
  console.log("Posts found:", posts.length);

  for (const post of posts) {
    if (!post.author) continue;
    await User.findByIdAndUpdate(post.author, {
      $addToSet: { CreatedPosts: post._id }
    });
  }

  console.log("Migration complete!");
  process.exit(0);
}

fill().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});