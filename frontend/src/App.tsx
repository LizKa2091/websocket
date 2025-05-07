import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Room from './components/Room';
import Menu from './components/Menu';
import './App.css';

function App() {
  return (
   <Router>
      <Routes>
         <Route path='/chat/:roomId' element={<Room />} />
         <Route path='/' element={<Menu />} />
      </Routes>
   </Router>
  );
}

export default App;
