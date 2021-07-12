// Requiring fs module
const fs = require("fs");
const moment = require("moment");

const directory = "C:/Users/kbinw/Binwant/WORK/Teams-Clone/chats/";

function readMessage(room){
    var filePath = directory + room + ".json";
    fs.access(filePath, fs.F_OK, (err) => {
        if (err) {
            console.log("return false");
            return;
        } else {
            //file exists so retrieve messages
            console.log("return True...");
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
            user:jsn.table[i].username,
            message:jsn.table[i].message,
            time:jsn.table[i].time

        }
        //socket.broadcast.to(jsn.table[0].room).emit('text',userMessage);

    }
}

// function readMessage(room) {
//     var filePath = directory + room + ".json";
//     //let messageArray;
//     fs.access(filePath, fs.F_OK, (err) => {
//         if (err) {
//             console.log("return false");
//             return;
//         } else {
//             //file exists so retrieve messages
//             console.log("return True...");
//             console.log("Room Exists! Reading messages..")
//             const filePath = directory + room + ".json";
//             let data = fs.readFile(filePath);
//             var messData = JSON.parse(data);
//             //adding the new data to old and create another object
//             //console.log(typeof(messData.table)); 
//             sendMessageArray( messData.table);
//             return;
//         }
//     });
// }

function sendMessageArray(messageArray){
    //console.log(messageArray[0].message);
    let id = messageArray[0].id;
    let message = messageArray[0].message;
    return { id ,
        message
    };
}

function writeMessage(user,msg){
    const userMessage = {
        "id":user.id,
        "username":user.username,
        "message":msg,
        "time": moment().format('h:mm A')
    }
    var filePath = directory + user.room + ".json";

    fs.access(filePath, fs.F_OK, (err) => {
        if (err) {
            //console.log("return false");
            newRoomMessage(userMessage,filePath);
        } else {
            //file exists so retrieve messages
            //console.log("return True...");
            appendMessage(userMessage,filePath);
        }
    });
}

function appendMessage(userMessage,filePath){
    //console.log("True");
    var data = {};
    console.log("Room Exists! Appending....");
    data = fs.readFileSync(filePath);
    var newObj = JSON.parse(data);
    //adding the new data to old and create another object
    newObj.table.push(userMessage);
    //console.log(newObj);
    var jsonString = JSON.stringify(newObj, null, 2);
    fs.writeFile(filePath, jsonString, err => {
        if (err) {
            console.log('Error writing file..', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
}

function newRoomMessage(userMessage,filePath){
    var data = {}
    console.log("Room doesnt exist! Creating new room....");
    data.table = [];
    data.table.push(userMessage);
    var jsonString = JSON.stringify(data, null, 2);
    fs.writeFile(filePath, jsonString, err => {
        if (err) {
            console.log('Error writing file..', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
}

module.exports = {
    readMessage,
    writeMessage,
};