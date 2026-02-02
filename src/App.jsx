import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Gifticon from './pages/Gifticon';
import Network from './pages/Network';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DeleteAccount from './pages/DeleteAccount';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import { LoadingProvider, useLoading } from './context/LoadingContext';
import GlobalLoader from './components/GlobalLoader';
import { registerLoadingHandler } from './utils/api';

/* =========================
   INTERNAL LOADER CONNECTOR
   (Bridges Axios ↔ React)
========================= */
const LoaderBridge = () => {
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    registerLoadingHandler({
      showLoading,
      hideLoading,
    });
  }, [showLoading, hideLoading]);

  return null;
};

function App() {
  return (
    <LoadingProvider>
      <Router>
        {/* 🔄 Global Loader Overlay */}
        <GlobalLoader />

        {/* 🔗 Connect Axios ↔ Loader */}
        <LoaderBridge />

        {/* 🔔 Global Toasts */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />

        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<Landing />} />

          {/* Public pages */}
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

          {/* Public – no auth required (e.g. for Google Play URLs) */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/delete-account" element={<DeleteAccount />} />

          {/* Protected routes */}
          <Route
            path="/gifticon"
            element={
              <ProtectedRoute>
                <Gifticon />
              </ProtectedRoute>
            }
          />

          <Route
            path="/network"
            element={
              <ProtectedRoute>
                <Network />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </LoadingProvider>
  );
}

export default App;
