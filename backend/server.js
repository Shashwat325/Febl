const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Track online users: Map<userId, socketId>
const onlineUsers = new Map();
// Track which communities a user belongs to: Map<userId, Set<communityId>>
const userCommunities = new Map();

// ✅ Now io and onlineUsers exist — safe to init notify
const { initNotify } = require("./utils/notify");
initNotify(io, onlineUsers);



function getOnlineCountForCommunity(communityId) {
  let count = 0;
  for (const [userId, comSet] of userCommunities.entries()) {
    if (onlineUsers.has(userId) && comSet.has(communityId.toString())) count++;
  }
  return count;
}

function broadcastCommunityOnline(userId) {
  const comSet = userCommunities.get(userId) || new Set();
  for (const communityId of comSet) {
    const count = getOnlineCountForCommunity(communityId);
    io.emit("community:online", { communityId, onlineMembers: count });
  }
}

io.on("connection", (socket) => {
  socket.on("user:online", async (userId) => {
  try {
    onlineUsers.set(userId, socket.id);
    io.emit("online:update", [...onlineUsers.keys()]);

    // Look up communities directly from DB — no localStorage trust needed
    const User = require("./models/User");
    const user = await User.findById(userId).select("followingCommunities");
    if (user && user.followingCommunities?.length > 0) {
      const communityIds = user.followingCommunities.map((c) => c.toString());
      userCommunities.set(userId, new Set(communityIds));
    }

    broadcastCommunityOnline(userId);
  } catch (err) {
    console.error("user:online error:", err);
  }
});

// Keep this as a fallback but server DB lookup is the source of truth
socket.on("user:communities", ({ userId, communityIds }) => {
  if (!userId || !Array.isArray(communityIds)) return;
  // Only use client data if server doesn't have it yet
  if (!userCommunities.has(userId)) {
    const cleanIds = communityIds
      .map((c) => (typeof c === "string" ? c : String(c)))
      .filter(Boolean);
    userCommunities.set(userId, new Set(cleanIds));
    broadcastCommunityOnline(userId);
  }
});

  socket.on("chat:join", ({ userId, otherId }) => {
    const room = [userId, otherId].sort().join("_");//creates room id alphabetically for 2 users for chatting 
    socket.join(room);
  });

  socket.on("chat:message", (msg) => {
    const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
    const receiverId = msg.receiver;
    if (!senderId || !receiverId) return;
    const room = [senderId, receiverId].sort().join("_");
    io.to(room).emit("chat:message", msg);
  });

  socket.on("chat:typing", ({ senderId, receiverId, isTyping }) => {
    const room = [senderId, receiverId].sort().join("_");
    socket.to(room).emit("chat:typing", { senderId, isTyping });
  });

  socket.on("disconnect", () => {
    let disconnectedUserId = null;
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("online:update", [...onlineUsers.keys()]);
    if (disconnectedUserId) {
      const comSet = userCommunities.get(disconnectedUserId) || new Set();
      userCommunities.delete(disconnectedUserId);
      for (const communityId of comSet) {
        io.emit("community:online", {
          communityId,
          onlineMembers: getOnlineCountForCommunity(communityId),
        });
      }
    }
  });
  });



mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true, methods: ["GET","POST","PUT","DELETE","PATCH"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.get("/api/chat/online-users", (req, res) => {
  res.json([...onlineUsers.keys()]);
});

app.get("/api/communities/:id/online", (req, res) => {
  res.json({ onlineMembers: getOnlineCountForCommunity(req.params.id) });
});
app.use("/api/posts", require("./routes/posts"));
app.use("/api/users", require("./routes/user"));
app.use("/api/communities", require("./routes/communities"));
app.use("/api/upload", require("./routes/upload"));
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/search", require("./routes/search"));
app.use("/api/comments", require("./routes/comment"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/notifications", require("./routes/notifications"));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
