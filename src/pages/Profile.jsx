import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, User, Mail, LogOut, Shield, Calendar, CreditCard, Plus, Building2, Phone, MapPin, Briefcase, Edit2 } from 'lucide-react';
import { isAuthenticated, logout, getTokenPayload, getUserEmail } from '../utils/auth';
import { normalizePhoneNumber } from '../utils/helpers';
import ConfirmModal from '../components/ConfirmModal';
import AddCardModal from '../components/AddCardModal';
import { cardAPI } from '../utils/api';

const Profile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMyCardModal, setShowMyCardModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [myCard, setMyCard] = useState(null);
  const [loadingCard, setLoadingCard] = useState(true);

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

    // Fetch user's business card
    loadMyCard();
  }, [navigate]);

  const loadMyCard = async () => {
    try {
      setLoadingCard(true);
      // Get user's email to match against cards
      const userEmail = getUserEmail() || getTokenPayload()?.email;
      
      if (!userEmail) {
        console.warn('No user email found, cannot identify user card');
        setMyCard(null);
        return;
      }

      // Fetch all cards and filter to find user's own card
      const response = await cardAPI.getCards();
      const allCards = response?.data?.data || [];
      
      // Find card where email matches user's email
          const userCard = allCards.find(card => 
            card.email && card.email.toLowerCase() === userEmail.toLowerCase()
          );
          
          // Normalize phone numbers when setting user card
          if (userCard) {
            setMyCard({
              ...userCard,
              phone: userCard.phone ? normalizePhoneNumber(userCard.phone) : userCard.phone,
              mobile: userCard.mobile ? normalizePhoneNumber(userCard.mobile) : userCard.mobile,
            });
          } else {
            setMyCard(null);
          }
      
      if (userCard) {
        console.log('✅ Found user card:', userCard);
      } else {
        console.log('ℹ️ No card found for user email:', userEmail);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        navigate('/login', { replace: true });
      } else {
        console.error('Error loading cards:', err);
        // Don't show error toast - it's okay if user hasn't registered their card yet
        setMyCard(null);
      }
    } finally {
      setLoadingCard(false);
    }
  };

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

  const handleSaveMyCard = async ({ file, cardData }) => {
    setUploading(true);
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Add the image file (required by API)
      if (file) {
        formData.append('file', file);
      } else {
        toast.error('Please upload an image file for your business card.');
        setUploading(false);
        return;
      }
      
      // Add card data as JSON string
      const cardJsonString = JSON.stringify(cardData);
      formData.append('card', cardJsonString);
      
      // Send to my-card-register endpoint
      await cardAPI.registerMyBusinessCard(formData);
      setShowMyCardModal(false);
      toast.success('Your business card has been registered successfully! 🎉');
      // Refresh the card data to display it
      await loadMyCard();
    } catch (err) {
      const response = err?.response;
      const backendCode = response?.data?.code;
      
      if (backendCode === '400001') {
        toast.error('Required fields are missing. Please ensure all fields are filled in correctly.');
      } else if (backendCode === '500001') {
        toast.error('A system error occurred. Please try again or contact support.');
      } else if (response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        navigate('/login', { replace: true });
      } else if (!response) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        const errorMessage = response?.data?.message || 'Failed to register your business card. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setUploading(false);
    }
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

          {/* My Business Card Section */}
          <div className="mb-6 pb-6 border-b border-brand-brown/20">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">
                My Business Card
              </label>
              {myCard && (
                <button
                  onClick={() => setShowMyCardModal(true)}
                  className="px-3 py-1.5 text-xs bg-brand-orange/10 text-brand-orange rounded-lg font-medium hover:bg-brand-orange/20 transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>

            {loadingCard ? (
              <div className="text-center py-8 text-brand-textSecondary">Loading your business card...</div>
            ) : myCard ? (
              // Display registered card
              <div className="bg-white rounded-lg border border-brand-brown/10 overflow-hidden">
                {/* Card Image */}
                {myCard.cardImageUrl && (
                  <div className="w-full h-48 bg-gray-100 border-b border-brand-brown/10">
                    <img
                      src={myCard.cardImageUrl}
                      alt={myCard.cardOwnerName || 'My Business Card'}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Card Details */}
                <div className="p-4 space-y-3">
                  {myCard.cardOwnerName && (
                    <div>
                      <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">
                        Name
                      </label>
                      <p className="text-base font-bold text-brand-brown">{myCard.cardOwnerName}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myCard.companyName && (
                      <div>
                        <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">
                          Company
                        </label>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-brand-textSecondary" />
                          <p className="text-sm text-brand-brown">{myCard.companyName}</p>
                        </div>
                      </div>
                    )}

                    {myCard.position && (
                      <div>
                        <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">
                          Position
                        </label>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-brand-textSecondary" />
                          <p className="text-sm text-brand-brown">{myCard.position}</p>
                        </div>
                      </div>
                    )}

                    {(myCard.phone || myCard.mobile) && (
                      <div>
                        <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">
                          Phone
                        </label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-brand-textSecondary" />
                          <p className="text-sm text-brand-brown">{normalizePhoneNumber(myCard.phone || myCard.mobile)}</p>
                        </div>
                      </div>
                    )}

                    {myCard.email && (
                      <div>
                        <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">
                          Email
                        </label>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-brand-textSecondary" />
                          <a href={`mailto:${myCard.email}`} className="text-sm text-brand-orange hover:underline">
                            {myCard.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Show register button if no card
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-brand-brown/10">
                <div className="p-2 bg-brand-orange/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-brand-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brand-textSecondary mb-3">
                    Register your own business card to share with your network.
                  </p>
                  <button
                    onClick={() => setShowMyCardModal(true)}
                    className="px-4 py-2 bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Register My Business Card
                  </button>
                </div>
              </div>
            )}
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

      {/* My Business Card Registration Modal */}
      <AddCardModal
        visible={showMyCardModal}
        onClose={() => setShowMyCardModal(false)}
        onSave={handleSaveMyCard}
        uploading={uploading}
      />
    </div>
  );
};

export default Profile;

