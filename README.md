# TEAMS
Microsoft ENGAGE challenge - TEAMS clone

This app offers video conference and chatting feature. The chatrooms offer real time chatting and the chat history is stored and can also be deleted. 
The video calling feature offer real time video conference and chatting feature where upto 4 users (5 can connect too but the connection needs to be strong.) can enter the video-chat room.

The app uses PeerJS API , a WebRTC library for easy peer-to-peer connection in the video calling feature.
NodeJS - Express and Socket.IO frameworks are used for the backend. Simple HTML,CSS and JavaScript is used for the front end.

The chat room stores chat history and can also store messages from the video chat when the video call is made from inside the chatroom using the icon.
So the user can chat in the chatroom then click on the icon to connect with the users in the chatroom . In the video chat room the users can talk and chat. When the user ends the video call and enters the chat room again all the chats from the video call will be added in the chat room history.
For implementing this the chats are stored in JSON file named accoring to the chat-room name and whenever a user connects the messages stored in JSON file are retrieved and displayed in the chat.
There is also a feature for deleting chat history in the chat room on right left corner - a drop down menu.
