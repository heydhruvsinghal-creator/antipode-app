const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '.')));

const SHARED_ROOM = 'antipode-friends';
const users = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    const tempUsername = `User_${Math.floor(Math.random() * 1000)}`;
    users.set(socket.id, { id: socket.id, name: tempUsername });

    socket.on('set_username', (username) => {
        const user = users.get(socket.id);
        if (user) {
            user.name = username;
            io.to(SHARED_ROOM).emit('user_list', Array.from(users.values()).map(u => u.name));
        }
    });

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
        
        io.to(room).emit('user_list', Array.from(users.values()).map(u => u.name));
        
        const user = users.get(socket.id);
        if (user) {
            socket.to(room).emit('user_joined', user.name);
        }
    });

    socket.on('chat_message', (msg) => {
        io.to(SHARED_ROOM).emit('chat_message', msg);
    });

    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            users.delete(socket.id);
            io.to(SHARED_ROOM).emit('user_list', Array.from(users.values()).map(u => u.name));
            io.to(SHARED_ROOM).emit('user_left', user.name);
        }
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
