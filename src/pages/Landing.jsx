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
      
      {/* Top Left Brand */}
      <div className="absolute top-0 left-0 z-50 p-2 xs:p-3 sm:p-4 md:p-5 tablet:p-6 laptop:p-8 max-w-[calc(100%-140px)] xs:max-w-[calc(100%-180px)] sm:max-w-none">
        <button
          onClick={() => navigate('/')}
          className="hover:opacity-80 transition-opacity"
          aria-label="Go to home"
        >
          <span className="text-sm xs:text-base sm:text-lg md:text-xl tablet:text-2xl laptop:text-3xl desktop:text-4xl font-semibold text-white tracking-normal drop-shadow-lg whitespace-nowrap">
            SHOW YOU <span className="text-yellow-400">CARE</span>
          </span>
        </button>
      </div>

      {/* Top Right Navigation */}
      <div className="absolute top-0 right-0 z-50 flex items-center p-2 xs:p-3 sm:p-4 md:p-5 tablet:p-6 laptop:p-8 gap-1.5 xs:gap-2 sm:gap-3 flex-shrink-0">
        <button
          onClick={() => navigate('/register')}
          className="bg-brand-purplePrimary text-white rounded-lg font-medium hover:bg-brand-purpleLight transition-colors whitespace-nowrap"
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
          className="bg-brand-purplePrimary text-white rounded-lg font-medium hover:bg-brand-purpleLight transition-colors whitespace-nowrap"
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
          className="absolute inset-0 left-0 w-1/2 cursor-pointer transition-all duration-300 hover:bg-purple-500/10"
          onMouseEnter={() => setHoveredSide('gifticon')}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => navigate('/gifticon')}
        />

        {/* Right Side - NETWORK (Clickable) */}
        <div 
          className="absolute inset-0 right-0 w-1/2 cursor-pointer transition-all duration-300 hover:bg-blue-500/10"
          onMouseEnter={() => setHoveredSide('network')}
          onMouseLeave={() => setHoveredSide(null)}
          onClick={() => navigate('/network')}
        />

        {/* Central Content: Text on Sides */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 px-4">
          <div className="flex items-center justify-center gap-8 xs:gap-10 sm:gap-12 md:gap-16 tablet:gap-20 laptop:gap-24 desktop:gap-32 desktop-lg:gap-40">
            {/* GIFTICON Text */}
            <div
              className="relative cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredSide('gifticon')}
              onMouseLeave={() => setHoveredSide(null)}
              onClick={() => navigate('/gifticon')}
            >
              <h2 
                className="font-bold text-white tracking-tight leading-none"
                style={{
                  fontSize: 'clamp(1.5rem, 8vw, 12rem)',
                }}
              >
                GIFTICON
              </h2>
            </div>

            {/* NETWORK Text */}
            <div
              className="relative cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredSide('network')}
              onMouseLeave={() => setHoveredSide(null)}
              onClick={() => navigate('/network')}
            >
              <h2 
                className="font-bold tracking-tight leading-none"
                style={{
                  fontSize: 'clamp(1.5rem, 8vw, 12rem)',
                  WebkitTextStroke: '2px #6a1bff',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
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
