const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
//import cors from 'cors';
const {addUser, removeUser, getUser, getUsersInRoom} =  require('./users.js');
const router = require('./router');
const PORT = process.env.PORT || 5000;

//const router = require('./router');
const { isBooleanObject } = require('util/types');
const app = express();
app.use(cors());
app.use(router);
const server = http.createServer(app);
const io = socketio(server,{cors:{origin:'*',}});

io.on('connection', (socket)=>{
    socket.on('join',({name,room},callback)=>{
        //console.log(addUser({id:socket.id, name,room}));
        const {error, user} = addUser({id:socket.id, name,room});
        if(error) return callback(error)

        socket.emit('message',{user:'admin', text:`${user.name}, welcome to the room ${user.room}`});
        //broadcast() sends a message to everyone besides that user
        socket.broadcast.to(user.room).emit('message',{user:'admin', text:`${user.name}, has joined!`})
        socket.join(user.room);

        callback();
    });

    socket.on('sendMessage',(message,callback) =>{
        const user = getUser(socket.id);

        io.to(user.room).emit('message', {user:user.name, text:message});

        callback();
    });

    socket.on('disconnect',()=>{
        console.log('User had left!!!');
    })
});
app.use(router);

server.listen(PORT, ()=>console.log(`Server has started on port ${PORT}`));

