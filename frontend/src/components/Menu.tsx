import React, { FC, useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './Menu.scss';

const Menu: FC = () => {
   const [generatedLink, setGeneratedLink] = useState<string>('');
   const [inputLink, setInputLink] = useState<string>('');
   const [inputUsername, setInputUsername] = useState<string>('');
   const [currStep, setCurrStep] = useState<number>(1);
   const [errorMsg, setErrorMsg] = useState<string>('');

   const navigate = useNavigate();

   const handleUsernameSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (inputUsername.trim().length === 0) {
         setErrorMsg('ник не может быть пустым');
         return;
      }
      else if (inputUsername.length < 4) {
         setErrorMsg('длина ника должна быть минимум 4 символа');
         return;
      }

      setErrorMsg('');
      setCurrStep(2);
   };

   const generateLink = () => {
      const newRoomId = Math.random().toString(36).substring(2, 8);
      setGeneratedLink(`http://localhost:3000/chat/${newRoomId}`);

      setTimeout(() => {
         navigate(`/chat/${newRoomId}`);
      }, 5000)
   };

   const handleJoinRoom = () => {
      const idFromLink = inputLink.split('/').pop();
      if (idFromLink) navigate(`/chat/${idFromLink}`);

      else alert('введите корректную ссылку');
   };

   return (
      <div className='menu'>
         {currStep === 1 &&
            <div className="menu__step1">
               <form onSubmit={handleUsernameSubmit} className='menu__step1-form'>
                  <label htmlFor="nickname" className="menu__step1-label">Введите отображаемый никнейм</label>
                  <input type="text" value={inputUsername} onChange={(e: ChangeEvent<HTMLInputElement>) => setInputUsername(e.target.value)} id='nickname' className='menu__step1-input'/>
                  {errorMsg && 
                     <span className='menu__step1-error'>{errorMsg}</span>
                  }
                  <button type="submit" className='menu__step1-button'>Далее</button>
               </form>
            </div>
         }
         {currStep === 2 &&
            <div className='menu__step2'>
               <button onClick={generateLink} disabled={generatedLink.length > 0 ? true : false} className='menu__button menu__step2-button menu__step2-button--create'>Создать ссылку для комнаты</button>
               {generatedLink.length > 0 &&
                  <>
                     <p>Ваша ссылка: {generatedLink}</p>
                     <p>Вы будете перенаправлены в комнату через 5 секунд</p>
                  </>
               }
               {generatedLink.length === 0 &&
                  <>
                     <p>или</p>
                     <p>присоединиться к уже существуещей комнате</p>
                     <form className="menu__step2-form">
                        <input type='url' className='menu__step2-input' placeholder='вставьте ссылку' value={inputLink} onChange={(e) => setInputLink(e.target.value)} />
                        <button onClick={handleJoinRoom} className="menu__step2-button menu__step2-button--join">Войти</button>
                     </form>
                  </>
               }
            </div>
         }
      </div>
   )
}

export default Menu;