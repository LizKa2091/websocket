import React, { FC, useEffect, useState } from 'react';

const Room: FC = () => {
   const [messages, setMessages] = useState<string[]>([]);
   const [input, setInput] = useState<string>('');
   const [socket, setSocket] = useState<WebSocket | null>(null);

   useEffect(() => {
      const ws = new WebSocket('ws://localhost:8082');

      ws.onopen = () => {
         console.log('WebSocket connection established');
      };

      ws.onmessage = (event) => {
         try {
            const messageData = JSON.parse(event.data);
            setMessages((prev) => [...prev, messageData.text]);
         } 
         catch (err) {
            console.error('Error parsing message:', err);
         }
      };

      ws.onclose = () => {
         console.log('WebSocket connection closed');
      };

      ws.onerror = (event) => {
         console.error('WebSocket error observed:', event);
      };

      setSocket(ws);
         return () => {
            ws.close();
         };
   }, []);

   const sendMessage = () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
         socket.send(JSON.stringify({ text: input, timestamp: Date.now() }));
         setInput('');
      }
   };

   return (
      <div>
         <h1>WebSocket Chat</h1>
         <div>
            {messages.map((msg, index) => (
               <div key={index}>{msg}</div>
            ))}
         </div>
         <input value={input} onChange={(e) => setInput(e.target.value)}/>
         <button onClick={sendMessage}>Send</button>
      </div>
   );
};
export default Room;