const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '.')));

// Shared room for friends
const SHARED_ROOM = 'antipode-friends';

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
        
        // Send a system message to the room
        io.to(room).emit('chat_message', 'Someone from the other side of the world has joined!');
    });

    socket.on('chat_message', (msg) => {
        // Broadcast message to everyone in the room
        io.to(SHARED_ROOM).emit('chat_message', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
