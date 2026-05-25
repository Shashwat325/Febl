const Notification = require("../models/Notification");

// io is passed in from server.js
// onlineUsers is the Map of userId -> socketId
let _io = null;
let _onlineUsers = null;

function initNotify(io, onlineUsers) {
  _io = io;
  _onlineUsers = onlineUsers;
}

async function createNotification({ recipient, sender, type, message, link }) {
  try {
    // Don't notify yourself
    if (recipient.toString() === sender.toString()) return;

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      link,
    });

    // Populate sender info for the real-time payload
    await notification.populate("sender", "username profilePicture");

    // If recipient is online, emit to their socket immediately
    if (_io && _onlineUsers) {
      const recipientSocketId = _onlineUsers.get(recipient.toString());
      if (recipientSocketId) {
        _io.to(recipientSocketId).emit("notification:new", notification);
      }
    }

    return notification;
  } catch (err) {
    console.error("Notification creation error:", err);
  }
}

module.exports = { initNotify, createNotification };