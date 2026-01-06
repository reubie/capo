import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasValidToken } from '../utils/auth';

/**
 * PublicRoute
 * Prevents logged-in users with valid tokens from accessing login/register pages.
 * Redirects authenticated users to default private page (/gifticon)
 * Users with expired tokens can still access login/register to re-authenticate
 */
const PublicRoute = ({ children }) => {
  if (hasValidToken()) {
    return <Navigate to="/gifticon" replace />;
  }

  return children;
};

export default PublicRoute;
