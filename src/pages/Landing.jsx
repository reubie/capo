import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, isTokenExpired, hasValidToken, hasJustLoggedOut, clearJustLoggedOutFlag } from '../utils/auth';

const Landing = () => {
  const navigate = useNavigate();
  const [hoveredSide, setHoveredSide] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication state on mount and when it changes
  useEffect(() => {
    document.title = 'Show you care - Gifticon & Network';
    
    // Initial check
    const checkAuth = () => {
      setIsAuthenticated(hasValidToken());
    };
    
    checkAuth();

    // Listen for storage changes (login/logout in other tabs or same tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === null) {
        // Token was added, removed, or localStorage was cleared
        checkAuth();
      }
    };

    // Listen for storage events (cross-tab updates)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (same-tab updates)
    // This will be triggered when login/logout happens in the same tab
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('auth-state-changed', handleAuthChange);

    // Check periodically for token expiration (every 30 seconds)
    const intervalId = setInterval(checkAuth, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-changed', handleAuthChange);
      clearInterval(intervalId);
    };
  }, []);

  /**
   * Smart navigation handler for Gifticon/Network clicks
   * Handles automatic login based on token status:
   * - Valid token → Navigate directly (auto-login)
   * - Expired token → Navigate to login (user has account)
   * - Just logged out → Navigate to login (user has account, just logged out)
   * - No token & not just logged out → Navigate to signup (new user)
   */
  const handleSmartNavigation = (targetPath) => {
    const token = getToken();
    
    // Case 1: User has a valid token → Auto-login and navigate
    if (hasValidToken()) {
      // Clear any logout flag since they're authenticated
      clearJustLoggedOutFlag();
      navigate(targetPath, { replace: true });
      return;
    }

    // Case 2: Token exists but is expired → User has account, send to login
    if (token && isTokenExpired(token)) {
      clearJustLoggedOutFlag(); // Clear flag since we know they have account
      navigate('/login', { 
        replace: false,
        state: { from: targetPath, reason: 'token_expired' }
      });
      return;
    }

    // Case 3: User just logged out → They have an account, send to login
    if (hasJustLoggedOut()) {
      clearJustLoggedOutFlag(); // Clear flag after using it
      navigate('/login', {
        replace: false,
        state: { from: targetPath, reason: 'after_logout' }
      });
      return;
    }

    // Case 4: No token and didn't just log out → New user, send to signup
    // Also handles malformed tokens (treated as no token for safety)
    navigate('/register', {
      replace: false,
      state: { from: targetPath, reason: 'no_account' }
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/background-img.png')" }}
      />
      
      {/* Top Left Brand - Logo */}
      <div className="absolute top-0 left-0 z-50 p-2 xs:p-3 sm:p-4 md:p-5 tablet:p-6 laptop:p-8">
        <button
          onClick={() => navigate('/')}
          className="hover:opacity-80 transition-opacity inline-flex items-center h-full"
          aria-label="Go to home"
          style={{
            height: 'calc(clamp(0.375rem, 1.5vw, 0.75rem) * 2 + clamp(0.625rem, 2.5vw, 1rem) * 1.5)',
          }}
        >
          <img 
            src="/images/logo.png" 
            alt="Show you care" 
            className="w-auto object-contain drop-shadow-lg"
            style={{
              height: 'clamp(10.5rem, 21vw, 18rem)',
            }}
          />
        </button>
      </div>

      {/* Top Right Navigation - Only show if user is not authenticated */}
      {!isAuthenticated && (
        <div className="absolute top-0 right-0 z-50 flex items-center p-2 xs:p-3 sm:p-4 md:p-5 tablet:p-6 laptop:p-8 gap-1.5 xs:gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => navigate('/register')}
            className="bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight transition-colors whitespace-nowrap flex items-center"
            style={{
              padding: 'clamp(0.375rem, 1.5vw, 0.75rem) clamp(0.5rem, 2vw, 1rem)',
              fontSize: 'clamp(0.625rem, 2.5vw, 1rem)',
              lineHeight: '1.5',
            }}
          >
            Register
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight transition-colors whitespace-nowrap flex items-center"
            style={{
              padding: 'clamp(0.375rem, 1.5vw, 0.75rem) clamp(0.5rem, 2vw, 1rem)',
              fontSize: 'clamp(0.625rem, 2.5vw, 1rem)',
              lineHeight: '1.5',
            }}
          >
            Login
          </button>
        </div>
      )}

      {/* Split Container - Left and Right Clickable Areas */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Left Side - GIFTICON (Clickable) */}
        <div 
          className="absolute inset-0 left-0 w-1/2 cursor-pointer transition-all duration-300"
          onMouseEnter={() => setHoveredSide('gifticon')}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => handleSmartNavigation('/gifticon')}
        />

        {/* Right Side - NETWORK (Clickable) */}
        <div 
          className="absolute inset-0 right-0 w-1/2 cursor-pointer transition-all duration-300"
          onMouseEnter={() => setHoveredSide('network')}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => handleSmartNavigation('/network')}
        />

        {/* Central Content: Text on Sides */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 px-4">
          <div className="flex items-center justify-center gap-8 xs:gap-10 sm:gap-12 md:gap-16 tablet:gap-20 laptop:gap-24 desktop:gap-32 desktop-lg:gap-40">
            {/* GIFTICON Text - Left side (cream/white) - Brown text */}
            <div
              className="relative cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredSide('gifticon')}
              onMouseLeave={() => setHoveredSide(null)}
              onClick={() => handleSmartNavigation('/gifticon')}
            >
              <h2 
                className="font-bold text-brand-brown tracking-tight leading-none drop-shadow-md"
                style={{
                  fontSize: 'clamp(1.5rem, 8vw, 12rem)',
                }}
              >
                GIFTICON
              </h2>
            </div>

            {/* NETWORK Text - Right side (brown) - Orange text */}
            <div
              className="relative cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredSide('network')}
              onMouseLeave={() => setHoveredSide(null)}
              onClick={() => handleSmartNavigation('/network')}
              style={{
                marginLeft: 'clamp(1rem, 3vw, 4rem)',
              }}
            >
              <h2 
                className="font-bold text-brand-orange tracking-tight leading-none drop-shadow-md"
                style={{
                  fontSize: 'clamp(1.5rem, 8vw, 12rem)',
                }}
              >
                NETWORK
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
