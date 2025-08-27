import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://school-chat-4tlg.onrender.com"); // CHANGE to VPS domain later

function App() {
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("groupCreated", (group) => {
      setGroups((prev) => [...prev, group]);
    });

    socket.on("groupUpdated", (group) => {
      if (group.id === groupId) {
        setCurrentGroup(group);
        setMessages(group.messages);
      }
    });

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("groupCreated");
      socket.off("groupUpdated");
      socket.off("newMessage");
    };
  }, [groupId]);

  const createGroup = () => {
    const name = prompt("Enter group name:");
    if (name) socket.emit("createGroup", { name });
  };

  const joinGroup = () => {
    const user = { id: socket.id, name };
    socket.emit("joinGroup", { groupId, user });
  };

  const sendMessage = () => {
    if (message && groupId) {
      const msg = { sender: name, text: message, time: new Date().toLocaleTimeString() };
      socket.emit("sendMessage", { groupId, message: msg });
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>School Chat</h1>
      {!currentGroup ? (
        <>
          <button onClick={createGroup}>Create Group</button>
          <input
            type="text"
            placeholder="Group ID"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={joinGroup}>Join Group</button>
        </>
      ) : (
        <>
          <h2>Group: {currentGroup.name}</h2>
          <div style={{ border: "1px solid #ccc", height: "300px", overflowY: "auto", margin: "10px 0" }}>
            {messages.map((msg, i) => (
              <p key={i}><b>{msg.sender}</b>: {msg.text} <i>({msg.time})</i></p>
            ))}
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message..."
          />
          <button onClick={sendMessage}>Send</button>
        </>
      )}
    </div>
  );
}

export default App;
