const express = require('express');
const app = express();
const server = require('http').Server(app);
const fs = require("fs");

//to convert message to an object with user id and time
const formatMessage = require('./public/utils/messages');

//use socket to make a real time connection
const io = require('socket.io')(server);


//to generate random room Id
const { v4:uuidv4 } = require('uuid');

//For chatroom
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./public/utils/user');

//for reading and writing messages in a .json file
const {
    //readMessage,
    writeMessage
} = require('./public/utils/storeMessages');

//import peer
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug:true
})

app.set('view engine','ejs');
app.use(express.static('public'));

//setup peer server
app.use('/peerjs', peerServer);

// Route to Chat login page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
}); 

//create video-chat room
app.get("/create-room/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

//video-chat room with a unique ID
app.get('/:room',(req,res) => {
    res.render('room',{ roomId : req.params.room })
})

//when the user makes a connection on the socket
io.on('connection', socket => {
    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });

    //on joining chat room
    socket.on('join-chat-room',({username,room}) => {
        const user = userJoin(socket.id, username, room);
        //console.log(user);
        socket.join(user.room);

        //read old messages and emit them
        readMessage(user.room);

        //welcome user
        socket.emit('notification',formatMessage('Admin',`Welcome to ${room}!`));
        
        //functions to read old messages and show them in the chat
        function readMessage(room){
            var filePath = directory + room + ".json";
            fs.access(filePath, fs.F_OK, (err) => {
                if (err) {
                    //console.log("return false");
                    return;
                } else {
                    //file exists so retrieve messages
                    //console.log("return True...");
                    sendReadMessages(filePath,room);
                }
            });    
        }
        function sendReadMessages(filePath,room){
            let jsn = require(filePath);
            const n = jsn.table.length;
            //console.log(jsn.table);
            for(let i=0;i<n;i++){
                let userMessage = {
                    username: jsn.table[i].username,
                    text: jsn.table[i].message,
                    time: jsn.table[i].time
        
                };
                socket.emit('messageHistory',userMessage);
        
            }
        }
        socket.on('delete-history',roomName => {
            deleteChatFile(roomName);
        })

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('notification',formatMessage('Admin', `${user.username} has joined the chat!`));
        
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Listen for chat messages
    socket.on('chat_message',msg => {
        const user = getCurrentUser(socket.id);
        //console.log(user);
        writeMessage(user,msg);
        socket.broadcast.to(user.room).emit('text',formatMessage(user.username,msg));
    })


    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
        io.to(user.room).emit(
            'notification',
            formatMessage('Admin', `${user.username} has left the chat...`)
        );

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        } 
    });
        
    //---------Video Chat room-------------------

    //on joining a video chat room
    socket.on('join-room' , (roomId, userId) => {
        socket.join(roomId);
        console.log(userId);
        //to broadcast in the room that a user has joined
        socket.broadcast.to(roomId).emit('user-connected', userId);
        //video_user=userJoin(userId,"username",roomId);
        socket.on('message', userM => {
            const time = new Date();
            const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });
            writeMessage({room:roomId,username:userM.username,id:userId,time:formattedTime},userM.message);
            console.log(userM);
            io.to(roomId).emit('createMessage', userM);
        }); 
        
    });

   

})
function deleteChatFile(room){
    let filePath = "./chats/" + room +".json";
    fs.unlink(filePath, (err) => {
    if (err) throw err;
    console.log('Successfully deleted ' +room +".json file..");
  });
};

const port =  process.env.PORT || 3030; // Port we will listen on

const directory = "./chats/";


// Function to listen on the port
server.listen(port);