const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {v4: uuidV4} = require('uuid');
const path = require('path');

app.use('/src', express.static(__dirname + '/src'));
app.get('/', (req,res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'room.html'), {roomId: req.params.roomId});
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    });
});

server.listen(3000, () => {console.log('server listening')});