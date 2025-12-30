import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, User, Mail, LogOut, Shield, Calendar } from 'lucide-react';
import { isAuthenticated, logout, getTokenPayload, getUserEmail } from '../utils/auth';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: '/profile' } });
      return;
    }

    document.title = 'Show you care - Profile';
    
    // Get user email from storage (set during login) or token payload
    const storedEmail = getUserEmail();
    const payload = getTokenPayload();
    
    setUserInfo({
      email: storedEmail || payload?.email || 'N/A',
      name: payload?.name || payload?.sub || 'User',
      role: payload?.role || 'N/A',
      // Add other fields from token if available
    });
  }, [navigate]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    toast.success('Logged out successfully');
    // Small delay to show toast before redirect
    setTimeout(() => {
      logout();
    }, 500);
  };

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
              Profile
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 tablet:px-8 laptop:px-12 desktop:px-16 py-6 xs:py-8">
        {/* Profile Card */}
        <div className="bg-brand-cardLight rounded-xl shadow-lg border border-brand-brown/20 p-6 xs:p-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-6 pb-6 border-b border-brand-brown/20">
            <div className="w-24 h-24 xs:w-28 xs:h-28 rounded-full bg-brand-orange/10 flex items-center justify-center mb-4">
              <User className="w-12 h-12 xs:w-14 xs:h-14 text-brand-orange" />
            </div>
            
            <p className="text-2xl xs:text-3xl font-bold text-brand-brown">
              {userInfo?.email || 'N/A'}
            </p>
          </div>

          {/* User Information */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-brand-brown/10">
              <div className="p-2 bg-brand-orange/10 rounded-lg">
                <Mail className="w-5 h-5 text-brand-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <p className="text-base text-brand-brown break-words">
                  {userInfo?.email || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-brand-brown/10">
              <div className="p-2 bg-brand-orange/10 rounded-lg">
                <Shield className="w-5 h-5 text-brand-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">
                  Account Type
                </label>
                <p className="text-base text-brand-brown">
                  {userInfo?.role || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-6 border-t border-brand-brown/20">
            <button
              onClick={() => navigate('/gifticon')}
              className="w-full py-3 px-4 bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight transition-colors flex items-center justify-center gap-2"
            >
              Go to Gifticon
            </button>
            <button
              onClick={() => navigate('/network')}
              className="w-full py-3 px-4 bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight transition-colors flex items-center justify-center gap-2"
            >
              Go to Network
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        icon={LogOut}
      />
    </div>
  );
};

export default Profile;

