const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// In-memory groups
let groups = {};

io.on("connection", (socket) => {
  console.log("New client:", socket.id);

  socket.on("createGroup", ({ name }) => {
    const id = Math.random().toString(36).substring(2, 8);
    groups[id] = { id, name, members: [], messages: [] };
    socket.emit("groupCreated", groups[id]);
  });

  socket.on("joinGroup", ({ groupId, user }) => {
    if (groups[groupId]) {
      groups[groupId].members.push(user);
      socket.join(groupId);
      io.to(groupId).emit("groupUpdated", groups[groupId]);
    } else {
      socket.emit("errorMsg", "Group not found");
    }
  });

  socket.on("sendMessage", ({ groupId, message }) => {
    if (groups[groupId]) {
      groups[groupId].messages.push(message);
      io.to(groupId).emit("newMessage", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client left:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
