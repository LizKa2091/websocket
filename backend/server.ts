import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { WebSocketServer } from 'ws';

const CONSTANTS = require('./utils/constants.ts');
const { PORT, CLIENT } = CONSTANTS;

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
   socket.on('message', (data: string) => {
      const message = data.toString();
      console.log(message);
      
      const messageToSend = { text: data, timestamp: Date.now() };
      broadcast(JSON.stringify(messageToSend), socket);
   });
});

////////////// HELPER FUNCTIONS ///////////////

function broadcast(data: string, socketToOmit: WebSocket) {
   wsServer.clients.forEach((client: WebSocket) => {
   // client !== socketToOmit чтобы сообщение не видел сам подключившийся пользователь, только все остальные
      if (client.readyState === WebSocket.OPEN && client !== socketToOmit) {
         client.send(data);
      }
   })
};

server.listen(PORT, () => {
   const address = server.address();
   if (address && typeof address !== 'string') {
      console.log(`Listening on: http://localhost:${address.port}`);
   }
   else {
      console.error('Server address is not available');
   }
});