import React, { FC, useEffect, useRef, useState } from 'react';
import { IMessage } from '../types/types';
import { useParams } from 'react-router-dom';
import './Room.scss';

const Room: FC = () => {
   const [messages, setMessages] = useState<IMessage[]>([]);
   const [input, setInput] = useState<string>('');
   const [socket, setSocket] = useState<WebSocket | null>(null);
   const [currentUserId, setCurrentUserId] = useState<number | null>(null);
   const { roomId } = useParams();
   const lastSentMessage = useRef<string | null>(null);

   useEffect(() => {
      const ws = new WebSocket('ws://localhost:8082');
      setSocket(ws);

      ws.onopen = () => {
         console.log('WebSocket connection established');
         ws.send(JSON.stringify({ type: 'CLIENT.MESSAGE.NEW_USER', payload: { username: 'new unnamed user' } }));
         ws.send(JSON.stringify({ type: 'CLIENT.MESSAGE.JOIN_ROOM', payload: { roomId } }));
      };

      ws.onmessage = (messageEvent) => {
         console.log('Received message:', messageEvent.data);

         const { type, payload } = JSON.parse(messageEvent.data);
         switch (type) {
            case 'SERVER.MESSAGE.PLAYER_ASSIGNMENT':
               setCurrentUserId(payload.clientPlayerIndex);
               break;
            case 'SERVER.MESSAGE.ROOM_FULL':
               console.log('Извините, в текущей комнате нет свободных мест');
               break;
            case 'SERVER.MESSAGE.NEW_MESSAGE':
               if (payload.message === lastSentMessage.current) {
                  lastSentMessage.current = null;
                  return;
               }
               showMessageReceived(payload.message, false);
               break;
            default:
               console.log('Неизвестный тип сообщения');
               break;
         }
      };

      ws.onclose = () => console.log('WebSocket connection closed');

      ws.onerror = (event) => console.error('WebSocket error observed:', event);

      return () => ws.close();
   }, [roomId]);

   const sendMessage = () => {
      if (socket && socket.readyState === WebSocket.OPEN && input.trim()) {
         const messageData = {
            type: 'CLIENT.MESSAGE.NEW_MESSAGE',
            payload: { message: input, timestamp: Date.now() }
         };

         lastSentMessage.current = input;

         showMessageReceived(input, true);
         socket.send(JSON.stringify(messageData));
         setInput('');
      }
      else {
         console.error('WebSocket is not open or input is empty');
      }
   };

   const showMessageReceived = (text: string, isMine: boolean) => {
      setMessages((prevMessages) => [...prevMessages, { text, isMine }]);
   };

   return (
      <div className='messages'>
         <h1>WebSocket Chat, room: {roomId}</h1>
         <div className="messages-container">
            {messages.map((msg, index) => (
               <div key={index} className={`message-item ${msg.isMine ? 'message-item__mine' : 'message-item__other'}`}>
                  <p className={`message-item__text ${msg.isMine ? 'message-item__text--mine' : 'message-item__text--other'}`}>{msg.text}</p>
               </div>
            ))}
         </div>
         <div className="messages-input-container">
            <input 
               value={input} 
               onChange={(e) => setInput(e.target.value)}
               className='messages-input'
               placeholder="Введите сообщение"
            />
            <button className='messages-button' onClick={sendMessage}>Отправить</button>
         </div>
      </div>
   );
};
export default Room;