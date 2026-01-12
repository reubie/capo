import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Lock, ArrowLeft, RotateCcw, Loader2, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { authAPI } from '../utils/api';
import { setToken, clearJustLoggedOutFlag } from '../utils/auth';
import {
  validatePassword,
  getPasswordStrength,
  validateName,
  handleBackendResponse,
} from '../utils/helpers';
import PhoneInput, { validatePhoneWithCountry, formatPhoneForBackend } from '../components/PhoneInput';
import OTPInput from '../components/OTPInput';
import ErrorModal from '../components/ErrorModal';
import { sendOTP, verifyOTP, resendOTP, clearRecaptcha, getFirebaseAuthDebugInfo } from '../utils/firebaseAuth';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Preserve the intended destination from landing page
  const intendedDestination = location.state?.from || '/gifticon';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPasswordChecklist, setShowPasswordChecklist] = useState(false);

  // OTP-related states
  const [step, setStep] = useState('register'); // 'register' or 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown in seconds (30 seconds)
  const [otpSent, setOtpSent] = useState(false); // Track if OTP was successfully sent
  const resendTimerRef = useRef(null);

  // Error modal states
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: 'Error',
    message: '',
  });

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
      // Clear reCAPTCHA on unmount
      clearRecaptcha();
    };
  }, []);

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      resendTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(resendTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
    }

    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
    };
  }, [resendCooldown]);

  useEffect(() => {
    document.title = 'Show you care - Register';
  }, []);

  /* =========================
     INPUT HANDLING
  ========================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'name') {
      setFieldErrors((prev) => ({
        ...prev,
        name: validateName(value)
          ? ''
          : 'Name should contain only letters and spaces',
      }));
    }

    if (name === 'phone') {
      const validation = validatePhoneWithCountry(value);
      setFieldErrors((prev) => ({
        ...prev,
        phone: validation.isValid ? '' : validation.error,
      }));
    }

    if (name === 'password') {
      if (!showPasswordChecklist && value.length > 0) {
        setShowPasswordChecklist(true);
      }

      const { isValid } = validatePassword(value);

      setFieldErrors((prev) => ({
        ...prev,
        password: isValid ? '' : 'Password does not meet all requirements',
      }));

      setPasswordStrength(getPasswordStrength(value));

      if (value.length === 0) {
        setShowPasswordChecklist(false);
      }
    }
  };

  /* =========================
     OTP INPUT HANDLING
  ========================= */
  const handleOTPChange = (value) => {
    setOtpCode(value);
    setOtpError(''); // Clear error when user types
  };

  const handleOTPComplete = async (value) => {
    if (value.length === 6) {
      await handleVerifyOTP(value);
    }
  };

  /* =========================
     SEND OTP
  ========================= */
  const handleSendOTP = async () => {
    // Validate all fields before sending OTP
    const nameError = validateName(formData.name) ? '' : 'Name should contain only letters and spaces';
    const phoneValidation = validatePhoneWithCountry(formData.phone);
    const passwordValidation = validatePassword(formData.password);

    setFieldErrors({
      name: nameError,
      phone: phoneValidation.isValid ? '' : phoneValidation.error,
      password: passwordValidation.isValid ? '' : 'Password does not meet all requirements',
    });

    if (nameError || !phoneValidation.isValid || !passwordValidation.isValid) {
      setErrorModal({
        visible: true,
        title: 'Validation Error',
        message: 'Please fill in all fields correctly before sending OTP.',
      });
        return;
      }

    setSendingOTP(true);
    setOtpError('');
    setOtpSent(false);

    try {
      // Format phone number for Firebase (E.164 format)
      const formattedPhone = formatPhoneForBackend(formData.phone);

      console.log('📤 Sending OTP to:', formattedPhone);
      
      // Log Firebase auth debug info before sending
      const debugInfo = getFirebaseAuthDebugInfo();
      console.log('🔍 Firebase Auth Debug Info:', debugInfo);

      // Send OTP via Firebase
      await sendOTP(formattedPhone, 'recaptcha-container');

      console.log('✅ OTP sent successfully');

      // Move to OTP step
      setOtpSent(true);
      setStep('otp');
      setResendCooldown(30); // Start 30-second cooldown
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setOtpSent(false);
      }, 3000);
    } catch (error) {
      console.error('❌ Error sending OTP in Register component:', error);
      
      // Log debug info at error time
      const debugInfo = getFirebaseAuthDebugInfo();
      console.error('🔍 Firebase Auth Debug Info at error time:', debugInfo);
      
      // Handle billing error specifically - show user-friendly message
      if (error.message && error.message.includes('BILLING_REQUIRED')) {
        setErrorModal({
          visible: true,
          title: 'Service Temporarily Unavailable',
          message: 'Phone verification is currently unavailable. Please contact support or try again later.\n\nWe apologize for the inconvenience.',
        });
      } else if (error.message && error.message.includes('INVALID_APP_CREDENTIAL')) {
        // Special handling for INVALID_APP_CREDENTIAL with detailed message
        setErrorModal({
          visible: true,
          title: 'Authentication Configuration Error',
          message: error.message + '\n\nPlease check the browser console for detailed error logs and troubleshooting steps.',
        });
      } else {
        // Show error in modal for other critical errors
        setErrorModal({
          visible: true,
          title: 'Failed to Send OTP',
          message: error.message || 'Unable to send verification code. Please check your phone number and try again.',
        });
      }
      setOtpError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOTP(false);
    }
  };

  /* =========================
     VERIFY OTP
  ========================= */
  const handleVerifyOTP = async (otp = otpCode) => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP code');
        return;
      }

    setVerifyingOTP(true);
    setOtpError('');

    try {
      console.log('🔐 Verifying OTP code...');

      // Verify OTP via Firebase
      const { idToken, phoneNumber } = await verifyOTP(otp);

      console.log('✅ OTP verified successfully');
      console.log('📱 Verified phone number:', phoneNumber);
      console.log('🎫 Firebase ID token obtained');

      // OTP verified - proceed with backend registration
      await handleRegisterWithFirebaseToken(idToken, phoneNumber);
    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      
      // Show error in modal for critical errors
      if (error.message && (error.message.includes('expired') || error.message.includes('session'))) {
        setErrorModal({
          visible: true,
          title: 'OTP Session Expired',
          message: error.message + '\n\nPlease request a new OTP code using the "Resend OTP" button.',
        });
    } else {
        // Show inline error for validation errors
        setOtpError(error.message || 'Invalid OTP code. Please check and try again.');
      }
    } finally {
      setVerifyingOTP(false);
    }
  };

  /* =========================
     REGISTER WITH FIREBASE TOKEN
  ========================= */
  const handleRegisterWithFirebaseToken = async (firebaseIdToken, verifiedPhoneNumber) => {
    try {
      // Format phone number for backend (E.164 format)
      const formattedPhone = formatPhoneForBackend(formData.phone);

      // Submit registration with Firebase token
      // Backend will verify the token and handle account creation
      const payload = {
        phone: formattedPhone,
        password: formData.password,
        name: formData.name.trim(),
        role: 'USER', // Default role
        firebaseToken: firebaseIdToken, // Firebase ID token for backend verification
      };

      console.group('📝 REGISTER REQUEST (with Firebase token)');
      console.log('Payload →', { ...payload, firebaseToken: '***' }); // Don't log full token
      console.groupEnd();

      toast.info('Creating your account...', { autoClose: 2000 });

      // Send registration request to backend with Firebase token
      // Backend will verify the token and handle account creation/login
      const response = await authAPI.signup(payload, {
        meta: { loadingText: 'Creating your account...' },
      });

      console.group('✅ REGISTER SUCCESS');
      console.log('HTTP status →', response.status);
      console.log('Backend response →', response.data);
      console.groupEnd();

      // Parse the backend response
      const result = handleBackendResponse(response.data);

      if (result.success) {
        toast.success('Account created successfully 🎉');
        
        // Clear OTP state
        clearRecaptcha();
        
        // Backend handles verification and login - redirect to login page
        // User will need to login with their phone number and password
        setTimeout(() => {
          navigate('/login', { 
            state: { from: intendedDestination, reason: 'after_signup' }
          });
        }, 1500);
      } else {
        toast.error(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      const res = err?.response;

      console.group('❌ REGISTER FAILURE');
      console.log('HTTP status →', res?.status || 'NO_RESPONSE');
      console.log('Backend payload →', res?.data || null);
      console.log('Axios error →', err.message);
      console.groupEnd();

      if (!res) {
        toast.error('Network error. Please check your connection.');
      } else {
        const backendCode = res.data?.code;

        switch (backendCode) {
          case '400001':
            toast.error('Please fill in all required fields correctly.');
            break;
          case '400003':
            // Phone number already registered - show error and go back to register form
            toast.error('This phone number is already registered. Please login instead.');
            setStep('register'); // Go back to registration form
            clearRecaptcha(); // Clear reCAPTCHA state
            break;
          default:
            toast.error(res.data?.message || 'Registration failed.');
        }
      }
    }
  };

  /* =========================
     RESEND OTP
  ========================= */
  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      return; // Already disabled by cooldown, just return
    }

    setSendingOTP(true);
    setOtpError('');
    setOtpCode(''); // Clear current OTP
    setOtpSent(false);

    try {
      // Format phone number for Firebase (E.164 format)
      const formattedPhone = formatPhoneForBackend(formData.phone);

      console.log('📤 Resending OTP to:', formattedPhone);

      // Resend OTP via Firebase
      await resendOTP(formattedPhone, 'recaptcha-container');

      console.log('✅ OTP resent successfully');

      setOtpSent(true);
      // Start 30-second cooldown
      setResendCooldown(30);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setOtpSent(false);
      }, 3000);
    } catch (error) {
      console.error('❌ Error resending OTP:', error);
      
      // Handle billing error specifically - show user-friendly message
      if (error.message && error.message.includes('BILLING_REQUIRED')) {
        setErrorModal({
          visible: true,
          title: 'Service Temporarily Unavailable',
          message: 'Phone verification is currently unavailable. Please contact support or try again later.\n\nWe apologize for the inconvenience.',
        });
      } else {
        setErrorModal({
          visible: true,
          title: 'Failed to Resend OTP',
          message: error.message || 'Unable to resend verification code. Please try again later.',
        });
      }
      setOtpError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setSendingOTP(false);
    }
  };

  /* =========================
     GO BACK TO REGISTER
  ========================= */
  const handleBackToRegister = () => {
    setStep('register');
    setOtpCode('');
    setOtpError('');
    clearRecaptcha(); // Clear reCAPTCHA state
  };

  /* =========================
     PASSWORD CHECKLIST
  ========================= */
  const renderPasswordChecklist = () => {
    if (!showPasswordChecklist) return null;

    const { rules } = validatePassword(formData.password);
    const unmetRules = Object.entries(rules)
      .filter(([_, passed]) => !passed)
      .map(([rule]) => rule);

    if (unmetRules.length === 0) return null;

    return (
      <ul className="text-sm mt-1">
        {unmetRules.includes('length') && (
          <li className="text-red-500">At least 8 characters</li>
        )}
        {unmetRules.includes('uppercase') && (
          <li className="text-red-500">At least 1 uppercase letter</li>
        )}
        {unmetRules.includes('lowercase') && (
          <li className="text-red-500">At least 1 lowercase letter</li>
        )}
        {unmetRules.includes('number') && (
          <li className="text-red-500">At least 1 number</li>
        )}
        {unmetRules.includes('specialChar') && (
          <li className="text-red-500">At least 1 special character</li>
        )}
      </ul>
    );
  };

  /* =========================
     UI
  ========================= */
  
  // Handle click outside the card to return to landing page
  const handleBackgroundClick = (e) => {
    // Check if click is inside the card - if so, don't navigate
    const cardElement = e.currentTarget.querySelector('.relative.z-10');
    if (cardElement && cardElement.contains(e.target)) {
      return; // Click is inside the card, don't navigate
    }
    
    // Click is outside the card (on background), navigate to landing page
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      onClick={handleBackgroundClick}
    >
      {/* Background - Same as Login page */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/background-img.png')" }} />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* reCAPTCHA Container - Hidden but required for Firebase */}
      <div id="recaptcha-container" className="absolute opacity-0 pointer-events-none" />

      {/* Register Card */}
      <div 
        className="relative z-10 w-full max-w-md laptop:max-w-lg bg-brand-cardLight rounded-xl shadow-2xl p-6 border border-brand-brown/20"
        onClick={(e) => e.stopPropagation()} // Prevent background click when clicking inside card
      >
          <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-brand-brown mb-2">
            {step === 'register' ? 'Create Account' : 'Verify OTP'}
            </h1>
          <p className="text-sm text-brand-textSecondary">
            {step === 'register' 
              ? 'Join Show you care today' 
              : `Enter the 6-digit code sent to ${formData.phone}`}
            </p>
          </div>

        {/* REGISTRATION FORM */}
        {step === 'register' ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-4">
                  <div>
              <label className="flex items-center gap-2 mb-2 text-sm text-brand-brown font-medium">
                <User className="w-4 h-4" /> Full Name
                    </label>
                    <input
                      name="name"
                placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg border-brand-brown/20 bg-white text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                disabled={sendingOTP}
                    />
              {fieldErrors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.name}
                </p>
              )}
                  </div>

            <PhoneInput
              value={formData.phone}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, phone: value || '' }));
                const validation = validatePhoneWithCountry(value);
                setFieldErrors((prev) => ({
                  ...prev,
                  phone: validation.isValid ? '' : validation.error,
                }));
              }}
              error={fieldErrors.phone}
              label="Phone Number"
              placeholder="Enter your phone number"
                      required
              disabled={sendingOTP}
                    />

                  <div>
              <label className="flex items-center gap-2 mb-2 text-sm text-brand-brown font-medium">
                <Lock className="w-4 h-4" /> Password
                    </label>
                    <input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                      onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg border-brand-brown/20 bg-white text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                disabled={sendingOTP}
              />

              {renderPasswordChecklist()}

              {formData.password && (
                <p
                  className={`text-sm mt-1 ${
                    passwordStrength === 'Weak'
                      ? 'text-red-500'
                      : passwordStrength === 'Medium'
                      ? 'text-yellow-500'
                      : 'text-green-600'
                  }`}
                >
                  Password strength: {passwordStrength}
                </p>
              )}
            </div>

            {/* Loading Message - OTP Being Sent */}
            {sendingOTP && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Sending OTP...
                    </p>
                    <p className="text-xs text-blue-700">
                      Please wait while we send the verification code to <span className="font-semibold">{formData.phone}</span>. This may take a few seconds.
                    </p>
                  </div>
                </div>
              </div>
            )}

                  <button
                    type="submit"
              disabled={sendingOTP}
              className="w-full py-3 bg-brand-orange text-brand-textOnDark font-bold rounded-lg hover:bg-brand-orangeLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sendingOTP ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
                        </button>
          </form>
        ) : (
          /* OTP VERIFICATION FORM */
          <div className="space-y-4">
            {/* Success Message - OTP Sent */}
            {otpSent && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      OTP Sent Successfully!
                    </p>
                    <p className="text-xs text-green-700">
                      We've sent a 6-digit verification code to <span className="font-semibold">{formData.phone}</span>. Please check your SMS messages and enter the code below.
                            </p>
                          </div>
                </div>
                      </div>
                    )}

            {/* Loading Message - OTP Being Sent */}
            {sendingOTP && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Sending OTP...
                    </p>
                    <p className="text-xs text-blue-700">
                      Please wait while we send the verification code to your phone. This may take a few seconds.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <OTPInput
              value={otpCode}
              onChange={handleOTPChange}
              onComplete={handleOTPComplete}
              error={otpError}
              disabled={verifyingOTP || sendingOTP}
            />

            {/* Verification Status */}
            {verifyingOTP && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-blue-900">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-medium">Verifying OTP code...</span>
                </div>
              </div>
            )}

            <button
              onClick={() => handleVerifyOTP()}
              disabled={verifyingOTP || sendingOTP || otpCode.length !== 6}
              className="w-full py-3 bg-brand-orange text-brand-textOnDark font-bold rounded-lg hover:bg-brand-orangeLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifyingOTP ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleBackToRegister}
                disabled={verifyingOTP || sendingOTP}
                className="flex items-center gap-2 text-sm text-brand-textSecondary hover:text-brand-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Phone Number
              </button>

              <button
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || sendingOTP || verifyingOTP}
              className="flex items-center gap-2 text-sm text-brand-orange hover:text-brand-orangeLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {sendingOTP ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </>
              )}
              </button>
            </div>
          </div>
          )}

        <div className="mt-6 pt-6 border-t border-brand-brown/20 text-center">
          <p className="text-sm text-brand-textSecondary mb-2">
              Already have an account?{' '}
              <button
              onClick={() => navigate('/login', { 
                state: { from: intendedDestination } 
              })}
              className="text-brand-orange font-semibold hover:underline"
              >
                Login
              </button>
            </p>
            <button
              onClick={() => navigate('/')}
            className="text-sm text-brand-brown font-medium hover:underline"
            >
              Back to Home
            </button>
          </div>
        </div>

      {/* Error Modal */}
      <ErrorModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ ...errorModal, visible: false })}
        title={errorModal.title}
        message={errorModal.message}
        buttonText="Got it"
      />
    </div>
  );
};

export default Register;
