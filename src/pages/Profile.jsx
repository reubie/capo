import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Home, User, Mail, LogOut, CreditCard, Plus, Building2, Phone, Briefcase, Edit2, Camera, MapPin, Gift, Network, Share2, MessageCircle, X } from 'lucide-react';
import { hasValidToken, logout, getTokenPayload } from '../utils/auth';
import { normalizePhoneNumber } from '../utils/helpers';
import { compressImage } from '../utils/imageCompression';
import { generateBusinessCard } from '../utils/businessCardGenerator';
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
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!hasValidToken()) {
      navigate('/login', { replace: true, state: { from: '/profile' } });
      return;
    }

    document.title = 'Show you care - Profile';
    
    // Get user info from token payload (only use actual data, no hardcoded fallbacks)
    // Note: We only use data that will be updated by user via business card registration
    const payload = getTokenPayload();
    
    setUserInfo({
      phone: payload?.phone || null,
      name: payload?.name || null, // Only use name from token, not sub (user ID)
      // Removed role - will be managed through business card data
    });

    // Fetch user's business card
    loadMyCard();
    
    // Load profile picture from localStorage
    const savedPicture = localStorage.getItem('profilePicture');
    if (savedPicture) {
      setProfilePicture(savedPicture);
    }
  }, [navigate]);

  const loadMyCard = async () => {
    try {
      setLoadingCard(true);
      
      // Fetch user's profile card using the dedicated endpoint
      const response = await cardAPI.getMyProfile();
      
      console.log('📥 API Response from /api/user/my-profile:', response?.data);
      
      // The API returns: { code: "200", message: "Success", data: [{ cardOwnerName, companyName, department, position, phone, mobile, companyAddress, cardImageUrl }] }
      const profileData = response?.data?.data;
      
      console.log('📋 Profile data structure:', Array.isArray(profileData) ? 'Array' : typeof profileData, profileData);
      
      // Handle response structure - API returns an array with business card data
      let userCard = null;
      if (profileData && typeof profileData === 'object') {
        if (Array.isArray(profileData) && profileData.length > 0) {
          // API returns array - get first card object
          userCard = profileData[0];
          console.log('✅ Extracted card from array:', userCard);
        } else if (!Array.isArray(profileData)) {
          // Fallback: if API returns object directly instead of array
          userCard = profileData;
          console.log('✅ Using card object directly:', userCard);
        }
      }
      
      // Normalize phone numbers when setting user card (if they exist)
      if (userCard) {
        const normalizedCard = {
          ...userCard,
          // Normalize phone numbers if they exist (for future API updates)
          phone: userCard.phone ? normalizePhoneNumber(userCard.phone) : userCard.phone,
          mobile: userCard.mobile ? normalizePhoneNumber(userCard.mobile) : userCard.mobile,
        };
        
        // If no cardImageUrl exists but we have card data, generate a basic card
        if (!normalizedCard.cardImageUrl && normalizedCard.cardOwnerName) {
          try {
            const generatedCardUrl = await generateBusinessCard(normalizedCard);
            normalizedCard.cardImageUrl = generatedCardUrl;
            console.log('✅ Generated business card image for profile');
          } catch (error) {
            console.error('Error generating business card:', error);
          }
        }
        
        setMyCard(normalizedCard);
        console.log('✅ Loaded user profile card:', normalizedCard);
      } else {
        // No card registered yet
        setMyCard(null);
        console.log('ℹ️ No business card registered in profile');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        navigate('/login', { replace: true });
      } else if (err.response?.status === 404) {
        // 404 might mean no card registered yet - this is okay
        setMyCard(null);
        console.log('ℹ️ No business card found (404)');
      } else {
        console.error('Error loading profile card:', err);
        // Don't show error toast for other errors - it's okay if user hasn't registered their card yet
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

  /* =========================
     BUSINESS CARD SHARING
  ========================= */
  const formatBusinessCardText = () => {
    if (!myCard) return '';
    
    let text = `📇 ${myCard.cardOwnerName || 'Business Card'}\n\n`;
    
    if (myCard.companyName) {
      text += `🏢 ${myCard.companyName}\n`;
    }
    
    if (myCard.position) {
      text += `💼 ${myCard.position}\n`;
    }
    
    if (myCard.mobile || myCard.phone) {
      text += `📱 ${normalizePhoneNumber(myCard.mobile || myCard.phone)}\n`;
    }
    
    if (myCard.email) {
      text += `✉️ ${myCard.email}\n`;
    }
    
    if (myCard.companyAddress) {
      text += `📍 ${myCard.companyAddress}\n`;
    }
    
    return text.trim();
  };

  const shareToWhatsApp = () => {
    if (!myCard) return;
    const text = formatBusinessCardText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setShowShareModal(false);
    toast.success('Opening WhatsApp...');
  };

  const shareToWeChat = () => {
    if (!myCard) return;
    // WeChat sharing - WeChat doesn't support direct web sharing, so we'll copy to clipboard
    const text = formatBusinessCardText();
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Business card copied! You can now paste it in WeChat.');
      setShowShareModal(false);
    }).catch(() => {
      toast.error('Failed to copy. Please try again.');
    });
  };

  const shareToKakao = () => {
    if (!myCard) return;
    // KakaoTalk sharing - using Kakao Link API would require SDK, for now we'll use SMS fallback
    const text = formatBusinessCardText();
    // Try to open KakaoTalk if available
    const kakaoUrl = `kakaotalk://send?text=${encodeURIComponent(text)}`;
    window.location.href = kakaoUrl;
    
    // Fallback: If Kakao doesn't open, show message
    setTimeout(() => {
      toast.info('If KakaoTalk didn\'t open, please use SMS sharing instead.');
    }, 1000);
    setShowShareModal(false);
  };

  const shareViaSMS = () => {
    if (!myCard) return;
    const text = formatBusinessCardText();
    // SMS sharing - opens default SMS app
    window.location.href = `sms:?body=${encodeURIComponent(text)}`;
    setShowShareModal(false);
    toast.success('Opening SMS...');
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      // Compress the image for profile picture (smaller size for avatar)
      const compressedDataUrl = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        maxSizeMB: 0.5, // 500KB max for profile picture
      });

      // Store in localStorage (in production, you'd upload to backend)
      localStorage.setItem('profilePicture', compressedDataUrl);
      setProfilePicture(compressedDataUrl);
      
      toast.success('Profile picture updated successfully! 🎉');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingPicture(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleSaveMyCard = async ({ file, cardData }) => {
    setUploading(true);
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Add the image file
      // For manual entry, file might be null - send empty Blob as per user request
      if (file) {
        formData.append('file', file);
      } else {
        // Manual entry without image - send empty Blob (FormData requires File/Blob, not string)
        const emptyBlob = new Blob([], { type: 'application/octet-stream' });
        formData.append('file', emptyBlob, '');
      }
      
      // Add card data as JSON string
      const cardJsonString = JSON.stringify(cardData);
      formData.append('card', cardJsonString);
      
      // Send to my-card-register endpoint
      await cardAPI.registerMyBusinessCard(formData);
      
      // Close modal first
      setShowMyCardModal(false);
      
      // Show success message
      toast.success('Your business card has been registered successfully! 🎉');
      
      // Refresh the card data from the profile endpoint to display it
      // This ensures we show the latest data from the backend
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
              onClick={() => navigate('/')}
              className="flex items-center gap-2 xs:gap-3 text-brand-textSecondary hover:text-brand-brown transition-colors font-medium flex-shrink-0"
            >
              <Home className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7" />
              <span className="hidden sm:inline text-sm xs:text-base">Home</span>
            </button>
            <img 
              src="/images/logo.png" 
              alt="Show you care" 
              onClick={() => navigate('/')}
              className="h-12 xs:h-14 sm:h-16 md:h-18 lg:h-20 object-contain flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ maxWidth: 'clamp(140px, 22vw, 220px)' }}
            />
            <div className="h-6 w-px bg-brand-brown/30 hidden xs:block"></div>
            <h1 className="text-sm xs:text-base sm:text-lg md:text-xl tablet:text-2xl laptop:text-3xl font-bold text-brand-orange truncate min-w-0">
              Profile
            </h1>
          </div>
          
          {/* Gifticon and Network Icons - Top Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/gifticon')}
              className="p-2 xs:p-2.5 bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight transition-colors flex items-center justify-center"
              title="Gifticon"
            >
              <Gift className="w-4 h-4 xs:w-5 xs:h-5" />
            </button>
            <button
              onClick={() => navigate('/network')}
              className="p-2 xs:p-2.5 bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight transition-colors flex items-center justify-center"
              title="Network"
            >
              <Network className="w-4 h-4 xs:w-5 xs:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 tablet:px-8 laptop:px-12 desktop:px-16 py-6 xs:py-8">
        {/* Profile Card */}
        <div className="bg-brand-cardLight rounded-xl shadow-lg border border-brand-brown/20 p-6 xs:p-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-6 pb-6 border-b border-brand-brown/20">
            {/* Profile Picture with Upload */}
            <div className="relative mb-4">
              <div className="relative w-24 h-24 xs:w-28 xs:h-28 rounded-full overflow-hidden border-4 border-brand-orange/20 bg-brand-orange/10 flex items-center justify-center">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 xs:w-14 xs:h-14 text-brand-orange" />
                )}
              </div>
              
              {/* Upload Button Overlay */}
              <label
                htmlFor="profile-picture-upload"
                className="absolute bottom-0 right-0 w-8 h-8 xs:w-10 xs:h-10 bg-brand-orange rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-orangeLight transition-colors shadow-lg border-2 border-white"
                title="Upload profile picture"
              >
                {uploadingPicture ? (
                  <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                )}
              </label>
              
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
                disabled={uploadingPicture}
              />
            </div>
            
            <p className="text-xl xs:text-2xl font-bold text-brand-textSecondary">
              Welcome!
            </p>
            
            {/* Name - Show below Welcome: prioritize business card name, fallback to token name */}
            {(myCard?.cardOwnerName || userInfo?.name) && (
              <p className="text-2xl xs:text-3xl font-bold text-brand-brown text-center mt-2">
                {myCard?.cardOwnerName || userInfo?.name}
              </p>
            )}
          </div>


          {/* My Business Card Section */}
          <div className="mb-6 pb-6 border-b border-brand-brown/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-brown flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-brand-orange" />
                My Business Card
              </h2>
              {myCard && (
                <button
                  onClick={() => setShowMyCardModal(true)}
                  className="px-3 py-1.5 text-xs bg-brand-orange/10 text-brand-orange rounded-lg font-medium hover:bg-brand-orange/20 transition-colors flex items-center gap-1.5"
                  title="Update your business card"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Update
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
                  <div className="w-full bg-white border-b border-brand-brown/10 p-4 flex items-center justify-center">
                    <img
                      src={myCard.cardImageUrl}
                      alt={myCard.cardOwnerName || 'My Business Card'}
                      className="max-w-full max-h-48 object-contain"
                      style={{ mixBlendMode: 'multiply' }}
                    />
                  </div>
                )}

                {/* Card Details - Contact Information */}
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-brand-textSecondary uppercase tracking-wider mb-4">
                    Contact Information
                  </h4>
                  
                  <div className="space-y-4">
                    {myCard.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">
                            Email
                          </label>
                          <a 
                            href={`mailto:${myCard.email}`} 
                            className="text-sm text-brand-orange hover:underline break-all"
                          >
                            {myCard.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {myCard.companyName && (
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">
                            Company
                          </label>
                          <p className="text-sm text-brand-brown">
                            {myCard.companyName}
                          </p>
                        </div>
                      </div>
                    )}

                    {myCard.position && (
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">
                            Position
                          </label>
                          <p className="text-sm text-brand-brown">
                            {myCard.position}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Display Mobile (prioritize mobile over phone) */}
                    {myCard.mobile && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">
                            Mobile
                          </label>
                          <a 
                            href={`tel:${myCard.mobile.replace(/\s/g, '')}`}
                            className="text-sm text-brand-brown hover:text-brand-orange transition-colors"
                          >
                            {normalizePhoneNumber(myCard.mobile)}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Display Phone - show if it exists and is different from mobile */}
                    {myCard.phone && (!myCard.mobile || (myCard.mobile && normalizePhoneNumber(myCard.phone) !== normalizePhoneNumber(myCard.mobile))) && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">
                            Phone
                          </label>
                          <a 
                            href={`tel:${myCard.phone.replace(/\s/g, '')}`}
                            className="text-sm text-brand-brown hover:text-brand-orange transition-colors"
                          >
                            {normalizePhoneNumber(myCard.phone)}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Display Company Address */}
                    {myCard.companyAddress && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-1">
                            Company Address
                          </label>
                          <p className="text-sm text-brand-brown">
                            {myCard.companyAddress}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Show prominent call-to-action if no card (new user scenario)
              <div className="bg-gradient-to-br from-brand-orange/10 to-brand-orange/5 rounded-xl border-2 border-brand-orange/30 p-4 xs:p-5">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-full bg-brand-orange/20 flex items-center justify-center mb-3">
                    <CreditCard className="w-6 h-6 xs:w-7 xs:h-7 text-brand-orange" />
                  </div>
                  
                  <h3 className="text-lg xs:text-xl font-bold text-brand-brown mb-2">
                    Complete Your Profile
                  </h3>
                  
                  <p className="text-xs xs:text-sm text-brand-textSecondary mb-4 max-w-md">
                    Register your business card to share your contact information with your network.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-4">
                    <button
                      onClick={() => setShowMyCardModal(true)}
                      className="px-5 py-2.5 bg-brand-orange text-brand-textOnDark rounded-lg font-semibold hover:bg-brand-orangeLight transition-colors flex items-center justify-center gap-2 text-sm xs:text-base shadow-lg"
                    >
                      <Plus className="w-4 h-4 xs:w-5 xs:h-5" />
                      Register My Business Card
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-brand-orange/20 w-full">
                    <p className="text-xs text-brand-textSecondary mb-2.5">
                      What you can do:
                    </p>
                    <div className="space-y-2.5 text-left">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-brand-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-brand-orange">1</span>
                        </div>
                        <div>
                          <p className="text-xs xs:text-sm font-medium text-brand-brown">Take a Picture</p>
                          <p className="text-xs text-brand-textSecondary">Take a photo of your business card and we'll extract the details automatically</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-brand-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-brand-orange">2</span>
                        </div>
                        <div>
                          <p className="text-xs xs:text-sm font-medium text-brand-brown">Upload or Drag & Drop</p>
                          <p className="text-xs text-brand-textSecondary">Upload an existing photo or drag and drop an image file</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-brand-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-brand-orange">3</span>
                        </div>
                        <div>
                          <p className="text-xs xs:text-sm font-medium text-brand-brown">Manual Entry</p>
                          <p className="text-xs text-brand-textSecondary">Enter your business card details manually</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions - Share Business Card (only show if card exists) */}
          {myCard && (
            <div className="space-y-3 pt-6 border-t border-brand-brown/20">
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full py-3 px-4 bg-brand-orange text-brand-textOnDark rounded-lg font-medium hover:bg-brand-orangeLight transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share Business Card
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}

          {/* Actions - No Card Yet (only show logout) */}
          {!myCard && !loadingCard && (
            <div className="space-y-3 pt-6 border-t border-brand-brown/20">
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
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
        initialData={myCard} // Pass existing card data for editing
      />

      {/* Share Business Card Modal */}
      {showShareModal && myCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-brand-cardLight rounded-2xl w-full max-w-md p-6 relative shadow-2xl border border-brand-brown/20">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-brand-textSecondary hover:text-brand-brown transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-orange/20 flex items-center justify-center mb-4">
                <Share2 className="w-8 h-8 text-brand-orange" />
              </div>
              <h3 className="text-2xl font-bold text-brand-brown mb-2">
                Share Business Card
              </h3>
              <p className="text-sm text-brand-textSecondary">
                Choose how you'd like to share your business card
              </p>
            </div>

            <div className="space-y-3">
              {/* 1. WhatsApp */}
              <button
                onClick={shareToWhatsApp}
                className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Share via WhatsApp
              </button>

              {/* 2. SMS */}
              <button
                onClick={shareViaSMS}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Share via SMS
              </button>

              {/* 3. KakaoTalk */}
              <button
                onClick={shareToKakao}
                className="w-full py-3 px-4 bg-yellow-400 text-brand-brown rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Share via KakaoTalk
              </button>

              {/* 4. WeChat */}
              <button
                onClick={shareToWeChat}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Share via WeChat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

