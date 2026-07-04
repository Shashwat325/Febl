const express = require("express");
const router = express.Router();
const Community = require("../models/Community");
const User = require("../models/User"); // ✅ Moved to top

// ✅ Create community
router.post("/", async (req, res) => {
  try {
    const { name, description, tags, creator } = req.body;

    const community = new Community({
      name,
      description,
      tags,
      creator,
      followers: [creator],
      membersCount: 1,
    });

    const c = await User.findById(creator);
    c.followingCommunities.addToSet(community._id);
    await c.save();
    await community.save();

    res.json(community);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/:id/join", async (req, res) => {
  const { userId } = req.body;
  const communityId = req.params.id;
  console.log("Join request:", { userId, communityId });

  try {
    const community = await Community.findById(communityId);
    const user = await User.findById(userId);

    if (!community || !user) {
      return res.status(404).json({ error: "User or community not found" });
    }

    const followers = (community.followers || [])
      .filter((id) => id)
      .map((id) => id.toString());

    const isJoined = followers.includes(userId);

    if (isJoined) {
      community.followers.pull(userId);
      user.followingCommunities.pull(communityId);
    } else {
      community.followers.addToSet(userId);
      user.followingCommunities.addToSet(communityId);
    }

    community.membersCount = community.followers.length;

    await community.save();
    await user.save();

    res.json({ joined: !isJoined, membersCount: community.membersCount });
  } catch (err) {
    console.error("Join error:", err);
    res.status(500).json(err);
  }
});

// ✅ Update community
router.put("/:id", async (req, res) => {
  try {
    const updated = await Community.findByIdAndUpdate(req.params.id, req.body, { new: true }); // ✅ Fixed: was `awaitCommunity`
    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✅ Get all communities
router.get("/", async (req, res) => {
  try {
    const communities = await Community.find().sort({ createdAt: -1 });
    res.json(communities);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✅ Get community by ID — keep LAST among /:id routes
router.get("/:id", async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    res.json(community);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;