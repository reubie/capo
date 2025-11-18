import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * PublicRoute - Guards public routes (login/register)
 * Redirects to /gifticon if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  const authenticated = isAuthenticated();

  if (authenticated) {
    // Redirect to gifticon page if already logged in
    return <Navigate to="/gifticon" replace />;
  }

  return children;
};

export default PublicRoute;

