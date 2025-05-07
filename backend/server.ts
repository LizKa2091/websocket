import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { WebSocketServer } from 'ws';

const CONSTANTS = require('./utils/constants.ts');
const { PORT } = CONSTANTS;

let nextMemberIndex: number = 0;
const rooms: Record<string, WebSocket[]> = {};

type WebSocket = import('ws').WebSocket;

///////////// HTTP SERVER LOGIC ///////////////

// Create the HTTP server
const server = http.createServer((req, res) => {
   // get the file path from req.url, or '/public/index.html' if req.url is '/'
   const filePath = (req.url === '/') ? '/public/index.html' : req.url!;
   
   const fullPath = path.join(__dirname, '../frontend', filePath);
   // determine the contentType by the file extension
   const extname = path.extname(fullPath);
   let contentType = 'text/html';
   if (extname === '.js') contentType = 'text/javascript';
   else if (extname === '.css') contentType = 'text/css';

   fs.readFile(fullPath, (err, content) => {
      if (err) {
         res.writeHead(404, { 'Content-Type': 'text/plain' });
         res.end('404 Not Found');
      } 
      else {
         res.writeHead(200, { 'Content-Type': contentType });
         res.end(content);
      }
  });
});

////////////////// WS LOGIC ///////////////////

const wsServer = new WebSocketServer({ server: server });
const userNicknames = new Map<WebSocket, string>();

wsServer.on('connection', (socket: WebSocket) => {
   console.log('a new client has joined the server');
   let currentRoom: string | null = null;
   let currentUsername: string | null = null;

   socket.on('message', (data) => {
      const message = typeof data === 'string' ? data : data.toString();
         try {
            const { type, payload } = JSON.parse(message);
            console.log(type, payload);

            switch (type) {
               case 'CLIENT.MESSAGE.NEW_USER':
                  currentUsername = payload.username;
                  currentRoom = payload.roomId;
                  if (currentUsername === null || currentRoom === null) {
                     console.error('error');
                     return;
                  }
                  userNicknames.set(socket, currentUsername);
                  
                  if (!rooms[currentRoom]) {
                     rooms[currentRoom] = [];
                  }
                  rooms[currentRoom].push(socket);
                  
                  const usersList = Array.from(userNicknames.values())
                     .filter(name => name !== currentUsername);
                  socket.send(JSON.stringify({
                     type: 'SERVER.MESSAGE.USER_LIST',
                     payload: { users: usersList }
                  }));
                  
                  broadcastToRoom(currentRoom, socket, {
                     type: 'SERVER.MESSAGE.USER_JOINED',
                     payload: { username: currentUsername }
                  });
                  break;
               case 'CLIENT.MESSAGE.JOIN_ROOM':
                  currentRoom = payload.roomId;
                  if (currentRoom && !rooms[currentRoom]) {
                     rooms[currentRoom] = [];
                  }
                  if (currentRoom) {
                     rooms[currentRoom].push(socket);
                  }
                  break;
               case 'CLIENT.MESSAGE.NEW_MESSAGE':
                  if (currentRoom) {
                     broadcastToRoom(currentRoom, socket, {
                        type: 'SERVER.MESSAGE.NEW_MESSAGE',
                        payload: {
                           message: payload.message,
                           timestamp: payload.timestamp,
                           senderNickname: currentUsername
                        }
                     });
                 }
                 break;
               default:
                  broadcast(data.toString(), socket)
                  break;
            }
         } 
         catch (error) {
            console.error('Error parsing message:', error);
         }
   });
   socket.on('close', () => {
      if (currentRoom && currentUsername) {
         rooms[currentRoom] = rooms[currentRoom].filter(s => s !== socket);
         userNicknames.delete(socket);
         
         broadcastToRoom(currentRoom, null, {
            type: 'SERVER.MESSAGE.USER_LEFT',
            payload: { username: currentUsername }
         });
         
         if (rooms[currentRoom].length === 0) {
            delete rooms[currentRoom];
         }
     }
   });
});

////////////// HELPER FUNCTIONS ///////////////

function broadcast(data: string, socketToOmit: WebSocket) {
   wsServer.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
         client.send(data);
      }
   })
};

function broadcastToRoom(roomId: string, excludeSocket: WebSocket | null, message: any) {
   if (!rooms[roomId]) return;
   
   const messageStr = JSON.stringify(message);
   rooms[roomId].forEach(client => {
      if (client !== excludeSocket && client.readyState === WebSocket.OPEN) {
         client.send(messageStr);
      }
   });
}

function handleNewUser(socket: WebSocket, username: string) {
   userNicknames.set(socket, username);

   // max 6 members
   if (nextMemberIndex < 6) {
     socket.send(JSON.stringify({ type: 'SERVER.MESSAGE.PLAYER_ASSIGNMENT', payload: {clientPlayerIndex: nextMemberIndex} }))
     
     nextMemberIndex++;
   } 
   // If 6 members already in room, room is full
   else {
     socket.send(JSON.stringify({ type: 'SERVER.MESSAGE.ROOM_FULL' }))
   }
 }
 

server.listen(PORT, () => {
   const address = server.address();
   if (address && typeof address !== 'string') {
      console.log(`Listening on: http://localhost:${address.port}`);
   }
   else {
      console.error('Server address is not available');
   }
});