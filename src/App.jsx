import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Gifticon from './pages/Gifticon';
import Network from './pages/Network';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        
        {/* Public routes that redirect if already authenticated */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Gifticon route - accessible without authentication for UI testing */}
        <Route path="/gifticon" element={<Gifticon />} />
        
        {/* Network route - accessible without authentication for UI testing */}
        <Route path="/network" element={<Network />} />
      </Routes>
    </Router>
  );
}

export default App;

