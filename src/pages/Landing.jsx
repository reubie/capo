import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [hoveredSide, setHoveredSide] = useState(null);
  
  // Adjust these values to match the exact diagonal in your background image
  // Format: [topRight%, bottomRight%] - adjust these percentages to align with the image
  const diagonalTop = 60; // Percentage from left at the top
  const diagonalBottom = 40; // Percentage from left at the bottom

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
      <div className="absolute top-0 left-0 z-50 p-4 md:p-6">
        <button
          onClick={() => navigate('/')}
          className="hover:opacity-80 transition-opacity"
          aria-label="Go to home"
        >
          <span className="text-lg md:text-xl lg:text-2xl font-semibold text-white tracking-normal drop-shadow-lg">
            SHOW YOU <span className="text-yellow-400">CARE</span>
          </span>
        </button>
      </div>

      {/* Top Right Navigation */}
      <div className="absolute top-0 right-0 z-50 flex items-center p-4 md:p-6 gap-3">
        <button
          onClick={() => navigate('/register')}
          className="px-4 py-2 bg-brand-purplePrimary text-white rounded-lg font-medium hover:bg-brand-purpleLight transition-colors"
        >
          Register
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-brand-purplePrimary text-white rounded-lg font-medium hover:bg-brand-purpleLight transition-colors"
        >
          Login
        </button>
      </div>

      {/* Diagonal Split Container */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Left Side - GIFTICON (Purple overlay) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(106, 27, 255, 0.35) 0%, rgba(106, 27, 255, 0.35) 50%, transparent 100%)',
            clipPath: `polygon(0 0, ${diagonalTop}% 0, ${diagonalBottom}% 100%, 0 100%)`,
          }}
        >
          <div 
            className="absolute inset-0 cursor-pointer transition-all duration-300"
            onMouseEnter={() => setHoveredSide('gifticon')}
            onMouseLeave={() => setHoveredSide(null)}
            onClick={() => navigate('/gifticon')}
          />
        </div>

        {/* Right Side - NETWORK (Blue overlay) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(59, 184, 255, 0.35) 50%, rgba(59, 184, 255, 0.35) 100%)',
            clipPath: `polygon(${diagonalTop}% 0, 100% 0, 100% 100%, ${diagonalBottom}% 100%)`,
          }}
        >
          <div 
            className="absolute inset-0 cursor-pointer transition-all duration-300"
            onMouseEnter={() => setHoveredSide('network')}
            onMouseLeave={() => setHoveredSide(null)}
            onClick={() => navigate('/network')}
          />
        </div>

        {/* Central Content: Text on Sides */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="flex items-center justify-center gap-12 md:gap-16 lg:gap-20 xl:gap-24">
            {/* GIFTICON Text */}
            <div
              className="relative cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredSide('gifticon')}
              onMouseLeave={() => setHoveredSide(null)}
              onClick={() => navigate('/gifticon')}
            >
              <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-none">
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
                className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-none"
                style={{
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
