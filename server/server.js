
//loading the modules

const queryString = require('query-string');
const express = require('express');
const path = require('path');
const socketIO = require("socket.io");
const { isRealString } = require('./validation');
const { Users } = require('./utils/User');
const mysql = require('mysql');

const { generateMessage, generateLocationMessage, generateFileMessage } = require('./utils/message');



var database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'iphone123'
});

database.connect((err) => {
    if (err) {
        throw err;
    }
});

let sql1 = 'USE chatApp';
function use() {

    database.query(sql1, (err, result) => {
        if (err)
            throw err;

        console.log(result)
    })
}

var user = new Users();

//we are loading the http module so that we can use socket.io
//in express behind the scene it uses http but is not able to load socket.io

const http = require("http");

// the path module make it easy to make the path 
const publicPath = path.join(__dirname, "../public");

console.log('Current Address', publicPath)

const app = express();
app.use(express.static(publicPath));



const server = http.createServer(app);

// Now what we get this is the websocket
const io = socketIO(server);


io.on("connection", (socket) => {

    console.log("New User connected");

//part2--------------

    socket.on("createLocationMessage", (coords) => {
        console.log(coords);
        //io.emit emits to every user connected to the server    
        io.emit("newLocationMessage", generateLocationMessage("Admin", coords.latitude, coords.longitude))
    });





//part3

    socket.on("createFileMessage", (msg) => {
        //io.emit emits to every user connected to the server    
        io.emit("newFileMessage", generateFileMessage("Admin", msg))
        console.log(msg)
    });






//part1
    socket.on("createMessage", (newMsg, msgfunc) => {
        console.log("create message", newMsg.text);
        var users = user.getUser(socket.id)
        io.to(users.room).emit("newMessage", generateMessage(users.name, newMsg.text));

        msgfunc();

    })

    socket.on("disconnect", () => {
        console.log("User is disconnected");
        var users = user.removeUser(socket.id)
        console.log("user has left the room")
        console.log(users)
        if (users) {
            io.to(users.room).emit('updateUserList', users)
            io.to(users.room).emit('newMessage', generateMessage('Admin', `${users.name} has left the room`))
            console.log("user has left the room")
        }

    })

    /* we have put io.to.emit and socket.emit inside join because we have to show admin message and 
        other messages to exactly specific user that have join that group*/

    // in req we have the string of url and now we have to make it the object

//part4
    socket.on('join', (req, callback) => {

        //queryString.parse will make the url into object

        const parse = queryString.parse(req);
        console.log("----------", parse)
        if (!isRealString(parse.name) || !isRealString(parse.roomName) || parse.name[0] != 'k') {
            callback("Name and Room number are required")
        }
        else {

            callback();
            use();

            let sql = `INSERT INTO login  VALUES('${parse.name}','${parse.roomName}')`;

            database.query(sql, (err, result) => {
                if (err)
                    throw err;
                console.log(result)
            })

            socket.join(parse.roomName)

            user.removeUser(socket.id);
            user.addUser(socket.id, parse.name, parse.roomName)

            io.to(parse.roomName).emit('updateUserList', user.getUserList(parse.roomName))
            /*  socket.emit from the admin to welcome to the chat app
                this emmit specificaly to the one user  */

            socket.emit("newMessage", generateMessage("Admin", "Welcome to the chat application"));

            /*  socket.broadcast.emit from admin text new user joined 
                this emits message every one except current user  */

            socket.broadcast.to(parse.roomName).emit("newMessage", generateMessage("Admin", `${parse.name} has joined`))
        }
    })
});


console.log(publicPath);

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log("port 3000 is ready to be serve");
})



