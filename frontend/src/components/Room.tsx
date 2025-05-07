import React, { FC, useState } from 'react';
import { IMessage } from '../types/types';
import { useParams } from 'react-router-dom';
import './Room.scss';

const Room: FC = () => {
   const [messages, setMessages] = useState<IMessage[]>([]);
   const [input, setInput] = useState('');
   const [socket, setSocket] = useState<WebSocket | null>(null);
   const [users, setUsers] = useState<string[]>([]);
   const [username, setUsername] = useState('');
   const [showUsernameForm, setShowUsernameForm] = useState(true);
   const [error, setError] = useState('');
   const { roomId } = useParams();

   const handleUsernameSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!username.trim()) {
         setError('Никнейм не может быть пустым');
         return;
      }
      
      if (username.length < 4) {
         setError('Никнейм должен содержать минимум 4 символа');
         return;
      }
      
      setError('');
      setShowUsernameForm(false);
      initializeWebSocket();
   };

   const initializeWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8082');
      setSocket(ws);

      ws.onopen = () => {
         ws.send(JSON.stringify({
               type: 'CLIENT.MESSAGE.NEW_USER',
               payload: { username, roomId }
         }));
      };

      ws.onmessage = (messageEvent) => {
         const { type, payload } = JSON.parse(messageEvent.data);
         
         switch (type) {
            case 'SERVER.MESSAGE.NEW_MESSAGE':
               if (payload.senderNickname === username) {
                  break;
               }
               setMessages(prev => [...prev, {
                  text: payload.message,
                  isMine: false,
                  senderNickname: payload.senderNickname
               }]);
               break;

            case 'SERVER.MESSAGE.USER_LIST':
               setUsers(payload.users);
               break;

            case 'SERVER.MESSAGE.USER_JOINED':
               setUsers(prev => [...prev, payload.username]);
               break;

            case 'SERVER.MESSAGE.USER_LEFT':
               setUsers(prev => prev.filter(u => u !== payload.username));
               break;
         }
      };

      ws.onclose = () => console.log('WebSocket connection closed');
      ws.onerror = (err) => console.error('WebSocket error:', err);
   };

   const sendMessage = () => {
      if (!socket || !input.trim()) return;

      const messageData = {
         type: 'CLIENT.MESSAGE.NEW_MESSAGE',
         payload: { message: input, timestamp: Date.now() }
      };

      const newMessage = {
         text: input,
         isMine: true,
         senderNickname: username
      };
      setMessages(prev => [...prev, newMessage]);
      
      socket.send(JSON.stringify(messageData));
      setInput('');
   };

   if (showUsernameForm) {
      return (
         <div className="username-form">
            <h2>Введите ваш никнейм</h2>
            <form onSubmit={handleUsernameSubmit}>
               <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ваш никнейм"
                  className="username-input"
               />
               {error && <p className="error-message">{error}</p>}
               <button type="submit" className="submit-button">
                  Продолжить
               </button>
            </form>
         </div>
      );
   }

   return (
      <div className='room'>
         <h2>Комната: {roomId}</h2>
         <div className="users-list">
            <h3>Участники:</h3>
               <ul>
                  <li key="you">Вы: {username}</li>
                  {users.map((user, index) => (
                     <li key={index}>{user}</li>
                  ))}
               </ul>
         </div>
         <div className="messages">
            {messages.map((msg, idx) => (
               <div key={idx} className={`message ${msg.isMine ? 'mine' : 'other'}`}>
                  <span className="sender">{msg.senderNickname}</span>
                  <p>{msg.text}</p>
               </div>
            ))}
         </div>
         <div className="message-input">
            <input
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Введите сообщение"
               onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Отправить</button>
         </div>
      </div>
   );
};

export default Room;