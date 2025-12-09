import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [hoveredSide, setHoveredSide] = useState(null);

  useEffect(() => {
    document.title = 'Show you care - Gifticon & Network';
  }, []);

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

      {/* Top Right Navigation */}
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

      {/* Split Container - Left and Right Clickable Areas */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Left Side - GIFTICON (Clickable) */}
        <div 
          className="absolute inset-0 left-0 w-1/2 cursor-pointer transition-all duration-300"
          onMouseEnter={() => setHoveredSide('gifticon')}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => navigate('/gifticon')}
        />

        {/* Right Side - NETWORK (Clickable) */}
        <div 
          className="absolute inset-0 right-0 w-1/2 cursor-pointer transition-all duration-300"
          onMouseEnter={() => setHoveredSide('network')}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => navigate('/network')}
        />

        {/* Central Content: Text on Sides */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 px-4">
          <div className="flex items-center justify-center gap-8 xs:gap-10 sm:gap-12 md:gap-16 tablet:gap-20 laptop:gap-24 desktop:gap-32 desktop-lg:gap-40">
            {/* GIFTICON Text - Left side (cream/white) - Brown text */}
            <div
              className="relative cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredSide('gifticon')}
              onMouseLeave={() => setHoveredSide(null)}
              onClick={() => navigate('/gifticon')}
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
              onClick={() => navigate('/network')}
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
