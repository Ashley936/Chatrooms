const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMsg, generateLocationMsg } = require('./utils/message')
const  { addUser,removeUser,getUser,getUsersInRoom } = require('./utils/users')

const app = express()
const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')
app.use(express.static(publicDirPath))

const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
    
    

    socket.on('join', ({ username, room }, callback) => {
        const user = addUser({ id: socket.id, username, room })
        if (user.error) {
            callback(user.error)
        }

        socket.join(room)

        socket.emit('message', generateMsg({message:"Welcome!!", username:"Admin"}))
        socket.broadcast.to(user.room).emit('message', generateMsg({ message: `${user.username} has joined the room!!`, username: "Admin" }))
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        
    })
    
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback("No bad words allowed!!")
        }
        if (message !== '') {
            io.to(user.room).emit('message', generateMsg({ message, username: user.username }))
        }
        callback()   //"add js for confirmation"
    })

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationmsg', generateLocationMsg({latitude,longitude,username: user.username}))
        callback("Location shared !")
    })

    socket.on('disconnect', () => {
        const userLeft = removeUser(socket.id)
        if (userLeft) {
            io.to(userLeft.room).emit('message', generateMsg({ message: `${userLeft.username} has left`, username: "Server" }))

            io.to(userLeft.room).emit('roomData', {
                room: userLeft.room,
                users: getUsersInRoom(userLeft.room)
            })
        }
        
    })
    console.log("user connected!")
})
server.listen(port, () => {
    console.log("Server up at ",port)
}) 