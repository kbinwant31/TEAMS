const chatForm = document.getElementById('chat-form');
const chatContainer = document.getElementById('chatContainer');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//get username
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
}); 

const socket = io();

// Join a chatroom
socket.emit('join-chat-room', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//notification from the admin
socket.on('notification', notifText => {
  console.log(notifText);
  outputNotification(notifText);
});

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    $('.list-group').append(`
    <a href="" class="filterDiscussions all single " id="list-chat-list" data-toggle="list" role="tab">
      <img class="avatar-md" src="img/avatars/user.png" data-toggle="tooltip" title="username" alt="avatar">
      <div class="data">
        <h5>${user.username}</h5>
      </div>
    </a>
    `)
  });
}
//send message text when enter is pressed
$('#msg').keydown(function(e) {
  if (e.keyCode == 13) {
    e.preventDefault();
    const mg = e.target.value;
    if(mg){
      sendMessage(mg)
      e.target.value = '';
    }
  }
});
//submitting the message through submit button
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  //to get the message
  const messg = e.target.elements.msg.value;
  if (!messg) {
    return false;
  }
  sendMessage(messg)
  //clear the input in the input text message field
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

function sendMessage(msg){
  //Append
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });
  let textMessage = {
    text:msg,
    time:formattedTime
  }
  outputMyMessage(textMessage);
  //send to server
  socket.emit('chat_message',msg);
}

socket.on('messageHistory',oldMessage => {
  if(oldMessage.username==username){
    outputMyMessage(oldMessage);
  } else {
    outputUserMessage(oldMessage);
  }
})

//message from the server
socket.on('text', messageText => {
  //console.log(messageText);
  outputUserMessage(messageText);
  //scroll down after every message

});

//function to output my message to DOM of my own window
function outputMyMessage(textMessage) {
  const div = document.createElement('div');
  div.classList.add('message','me');
  div.innerHTML = `
  <div class="text-main">
  <div class="text-group me">
    <div class="text me">
      <p>${textMessage.text}</p>
    </div>
  </div>
  <span>${textMessage.time}</span>
  </div>`;
  document.getElementById("chatContainer").appendChild(div);
  scrollBottom("chatContainer");
}

//function to output user message
function outputUserMessage(text) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
  <img class="avatar-md" src="img/avatars/user.png" data-toggle="tooltip" data-placement="top" title="${text.username}" alt="avatar">
  <div class="text-main">
		<div class="text-group">
    <span>${text.username}</span>
			<div class="text">
				<p>${text.text}</p>
			</div>
		</div>
			<span style="color:gray;font-size:12px;">${text.time}</span>
	</div>`;
  document.getElementById("chatContainer").appendChild(div);
  scrollBottom("chatContainer");
}

//function to output notification to DOM
function outputNotification(text) {
  const div = document.createElement('div');
  div.classList.add('date');
  div.innerHTML = `<span>${text.text}</span>`;
  document.getElementById("chatContainer").appendChild(div);
}

//function to scoll to bottom after every message
function scrollBottom(id){
  var element = document.getElementById(id);
  element.scrollTop = element.scrollHeight - element.clientHeight;
}

//to redirect user to the video call room with the same name as the chat-room
//and to show the conversation from the chat room in the video call chat
function goToVideo() {
  window.location = location.protocol + "//" + location.host +"/"+ room;
}

document.getElementById("goToVideoRoom").addEventListener("click", goToVideo);

$('#clear-history').click(function (){
  socket.emit('delete-history',room);
  location.reload();
})