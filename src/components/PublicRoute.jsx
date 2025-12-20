import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * PublicRoute
 * Prevents logged-in users from accessing login/register pages.
 * Redirects authenticated users to default private page (/gifticon)
 */
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/gifticon" replace />;
  }

  return children;
};

export default PublicRoute;
