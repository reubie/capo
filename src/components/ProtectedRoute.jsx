import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * ProtectedRoute
 * Guards private routes that require authentication.
 * If the user is not logged in, redirects to /login
 * and preserves the intended destination in location.state.from
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Check if user has a valid token
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
