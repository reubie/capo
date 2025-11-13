import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Gifticon from './pages/Gifticon';
import Network from './pages/Network';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gifticon" element={<Gifticon />} />
        <Route path="/network" element={<Network />} />
      </Routes>
    </Router>
  );
}

export default App;

