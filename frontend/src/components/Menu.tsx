import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Menu.scss';

const Menu: FC = () => {
   const [generatedLink, setGeneratedLink] = useState<string>('');
   const [inputLink, setInputLink] = useState<string>('');
   const navigate = useNavigate();

   const generateLink = () => {
      const newRoomId = Math.random().toString(36).substring(2, 8);
      setGeneratedLink(`http://localhost:3000/chat/${newRoomId}`);
   };

   const handleJoinRoom = () => {
      const idFromLink = inputLink.split('/').pop();
      if (idFromLink) navigate(`/chat/${idFromLink}`);

      else alert('введите корректную ссылку');
   };

   return (
      <div className='menu'>
         <button onClick={generateLink} className='menu__button menu__button-create'>Создать ссылку для комнаты</button>
         {generatedLink.length > 0 &&
            <p>{generatedLink}</p>
         }
         <p>или</p>
         <p>присоединиться к уже существуещей комнате</p>
         <input type='url' className='menu__input' placeholder='вставьте ссылка' value={inputLink} onChange={(e) => setInputLink(e.target.value)} />
         <button onClick={handleJoinRoom} className="menu__button menu__button-join">войти</button>
      </div>
   )
}

export default Menu;