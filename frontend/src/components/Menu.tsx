import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Menu.scss';

const Menu: FC = () => {
   const [inputLink, setInputLink] = useState('');
   const navigate = useNavigate();

   const handleCreateRoom = () => {
      const newRoomId = Math.random().toString(36).substring(2, 8);
      navigate(`/chat/${newRoomId}`);
   };

   const handleJoinRoom = () => {
      const idFromLink = inputLink.split('/').pop();
      if (idFromLink) {
         navigate(`/chat/${idFromLink}`);
      }
   };

   return (
      <div className='menu'>
         <button onClick={handleCreateRoom} className='menu__button'>
            Создать комнату
         </button>
         <div className='menu__join'>
            <input
               type='text'
               value={inputLink}
               onChange={(e) => setInputLink(e.target.value)}
               placeholder='Введите ссылку на комнату'
               className='menu__input'
            />
            <button onClick={handleJoinRoom} className='menu__button'>
               Присоединиться
            </button>
         </div>
      </div>
   );
};

export default Menu;