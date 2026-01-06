import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasValidToken } from '../utils/auth';

/**
 * ProtectedRoute
 * Guards private routes that require authentication.
 * If the user does not have a valid (non-expired) token, redirects to /login
 * and preserves the intended destination in location.state.from
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Check if user has a valid (non-expired) token
  if (!hasValidToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
