import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Network, User } from 'lucide-react';
import { isAuthenticated } from '../utils/auth';
import AvailableGiftsTab from '../components/AvailableGiftsTab';
import PurchasedGiftsTab from '../components/PurchasedGiftsTab';

const Gifticon = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('available');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: '/gifticon' } });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-brand-background text-brand-textPrimary">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10 pointer-events-none"
        style={{ backgroundImage: "url('/images/background-img.png')" }}
      />

      {/* Header */}
      <div className="relative bg-brand-background/95 backdrop-blur-sm shadow-md sticky top-0 z-40 border-b border-brand-brown/20">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 tablet:px-8 laptop:px-12 desktop:px-16 py-2 xs:py-3 sm:py-4 flex items-center justify-between gap-2 xs:gap-3">
          <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1">
              <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-brand-textSecondary hover:text-brand-brown transition-colors font-medium flex-shrink-0"
              >
              <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5" />
              <span className="hidden sm:inline text-xs xs:text-sm">Back</span>
              </button>
            <div className="h-6 w-px bg-brand-brown/30 hidden xs:block"></div>
            <img 
              src="/images/logo.png" 
              alt="Show you care" 
              className="h-8 xs:h-10 sm:h-12 md:h-14 object-contain flex-shrink-0"
              style={{ maxWidth: 'clamp(80px, 15vw, 150px)' }}
            />
            <div className="h-6 w-px bg-brand-brown/30 hidden xs:block"></div>
            <h1 className="text-sm xs:text-base sm:text-lg md:text-xl tablet:text-2xl laptop:text-3xl font-bold text-brand-orange truncate min-w-0">
              Gifticon
              </h1>
            </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/network')}
              className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-xs xs:text-sm sm:text-base bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight transition-colors flex items-center gap-1 xs:gap-2 whitespace-nowrap"
            >
              <Network className="w-3 h-3 xs:w-4 xs:h-4" />
              <span className="hidden xs:inline">Network</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-2 xs:p-2.5 bg-brand-cardLight border border-brand-brown/20 text-brand-brown rounded-lg font-medium hover:bg-brand-background hover:border-brand-orange/50 transition-colors flex items-center justify-center"
              title="Profile"
            >
              <User className="w-4 h-4 xs:w-5 xs:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 tablet:px-8 laptop:px-12 desktop:px-16 mt-4 flex gap-2 border-b border-brand-brown/20">
        <button
          onClick={() => setActiveTab('available')}
          className={`py-2 px-4 rounded-t-lg ${
            activeTab === 'available'
              ? 'bg-brand-orange text-white'
              : 'bg-brand-cardLight text-brand-textPrimary'
          }`}
        >
          Available Gifts
        </button>
        <button
          onClick={() => setActiveTab('purchased')}
          className={`py-2 px-4 rounded-t-lg ${
            activeTab === 'purchased'
              ? 'bg-brand-orange text-white'
              : 'bg-brand-cardLight text-brand-textPrimary'
          }`}
        >
          My Gifts
        </button>
      </div>

      {/* Tab Panels */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 tablet:px-8 laptop:px-12 desktop:px-16 py-4">
        {/* Only mount the active tab */}
        {activeTab === 'available' && <AvailableGiftsTab />}
        {activeTab === 'purchased' && <PurchasedGiftsTab />}
        </div>
    </div>
  );
};

export default Gifticon;
