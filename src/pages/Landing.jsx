import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [hoveredSide, setHoveredSide] = useState(null);
  
  // Adjust these values to match the exact diagonal in your background image
  // Format: [topRight%, bottomRight%] - adjust these percentages to align with the image
  const diagonalTop = 60; // Percentage from left at the top
  const diagonalBottom = 40; // Percentage from left at the bottom

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/background-img.png')" }}
      />
      
      {/* Top Left Logo/Brand */}
      <div className="absolute top-0 left-0 z-50 p-4 md:p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          aria-label="Go to home"
        >
          <img
            src="/images/logo.png"
            alt="CAPO Logo"
            className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain drop-shadow-lg group-hover:scale-105 transition-transform"
          />
          <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight drop-shadow-lg">
            Capo <span className="text-yellow-400">靠谱</span>
          </span>
        </button>
      </div>

      {/* Top Right Navigation */}
      <div className="absolute top-0 right-0 z-50 flex items-center p-4 md:p-6 gap-3">
        <button
          onClick={() => navigate('/register')}
          className="px-4 py-2 bg-[#8B4513] text-white rounded-lg font-medium hover:bg-[#A0522D] transition-colors"
        >
          Register
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-[#8B4513] text-white rounded-lg font-medium hover:bg-[#A0522D] transition-colors"
        >
          Login
        </button>
      </div>

      {/* Diagonal Split Container */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Left Side - GIFTICON (Dark Brown) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(92, 64, 51, 0.3) 0%, rgba(92, 64, 51, 0.3) 50%, transparent 100%)',
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

        {/* Right Side - NETWORK (Light Cream) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(245, 230, 211, 0.3) 50%, rgba(245, 230, 211, 0.3) 100%)',
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

        {/* Central Content: Logo with Text on Sides */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="flex items-center justify-center gap-4 md:gap-6 lg:gap-8">
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
              {hoveredSide === 'gifticon' && (
                <div className="absolute top-full mt-4 left-0 animate-fade-in space-y-2 whitespace-nowrap">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/gifticon');
                      }}
                      className="px-3 py-1.5 border-2 border-white text-white rounded-md font-medium hover:bg-white/10 transition-colors text-xs"
                    >
                      OUR CAPABILITIES
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/gifticon');
                      }}
                      className="px-3 py-1.5 border-2 border-white text-white rounded-md font-medium hover:bg-white/10 transition-colors text-xs"
                    >
                      FEATURED PROJECTS
                    </button>
                  </div>
                  <p className="text-white/90 text-xs">OR VIEW ALL WORK</p>
                </div>
              )}
            </div>

            {/* Central Logo */}
            <div className="flex-shrink-0">
              <img
                src="/images/logo.png"
                alt="CAPO Logo"
                className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 object-contain drop-shadow-2xl"
              />
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
                  WebkitTextStroke: '2px #8B4513',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                NETWORK
              </h2>
              {hoveredSide === 'network' && (
                <div className="absolute top-full mt-4 right-0 animate-fade-in space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/network');
                    }}
                    className="px-3 py-1.5 border-2 border-[#8B4513] text-[#8B4513] rounded-md font-medium hover:bg-[#8B4513]/10 transition-colors text-xs"
                  >
                    EXPLORE NETWORK
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
