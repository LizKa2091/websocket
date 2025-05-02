import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { WebSocketServer } from 'ws';

const CONSTANTS = require('./utils/constants.ts');
const { PORT, CLIENT } = CONSTANTS;

let nextPlayerIndex: number = 0;

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
      } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
      }
  });
});

////////////////// WS LOGIC ///////////////////

const wsServer = new WebSocketServer({ server: server });

wsServer.on('connection', (socket: WebSocket) => {
   console.log('a new client has joined the server');
   socket.on('message', (data) => {
      const message = typeof data === 'string' ? data : data.toString();
         try {
            const { type, payload } = JSON.parse(message);
            console.log(type, payload);

            switch (type) {
               case 'CLIENT.MESSAGE.NEW_USER':
                  handleNewUser(socket);
                  break;
               case 'CLIENT.MESSAGE.NEW_MESSAGE':
                  const serverMessage = JSON.stringify({
                     type: 'SERVER.MESSAGE.NEW_MESSAGE',
                     payload: {
                        message: payload.message,
                        timestamp: payload.timestamp,
                        senderId: nextPlayerIndex,
                     }
                  });

                  wsServer.clients.forEach((client) => {
                     if (client.readyState === WebSocket.OPEN) {
                        client.send(serverMessage);
                     }
                  });
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
});

////////////// HELPER FUNCTIONS ///////////////

function broadcast(data: string, socketToOmit: WebSocket) {
   wsServer.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
         client.send(data);
      }
   })
};

function handleNewUser(socket: WebSocket) {
   // max 6 users
   if (nextPlayerIndex < 6) {
     socket.send(JSON.stringify({ type: 'SERVER.MESSAGE.PLAYER_ASSIGNMENT', payload: {clientPlayerIndex: nextPlayerIndex} }))
     
     nextPlayerIndex++;
   } 
   
   // If 6 users already in room, room is full
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