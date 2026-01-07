import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Lock } from 'lucide-react';
import { authAPI } from '../utils/api';
import { setToken, clearJustLoggedOutFlag } from '../utils/auth';
import {
  validatePassword,
  getPasswordStrength,
  validateName,
  handleBackendResponse,
} from '../utils/helpers';
import PhoneInput, { validatePhoneWithCountry, formatPhoneForBackend } from '../components/PhoneInput';

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
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateName(formData.name) ? '' : 'Name should contain only letters and spaces';
    const phoneValidation = validatePhoneWithCountry(formData.phone);
    const passwordValidation = validatePassword(formData.password);

    setFieldErrors({
      name: nameError,
      phone: phoneValidation.isValid ? '' : phoneValidation.error,
      password: passwordValidation.isValid ? '' : 'Password does not meet all requirements',
    });

    if (nameError || !phoneValidation.isValid || !passwordValidation.isValid) {
      toast.error('Please fill in all fields correctly');
      return;
    }

    // Format phone number for backend (E.164 format)
    const formattedPhone = formatPhoneForBackend(formData.phone);

    const payload = {
      name: formData.name.trim(),
      phone: formattedPhone,
      password: formData.password,
      role: 'USER', // Default role
    };

    console.group('📝 REGISTER REQUEST');
    console.log('Payload →', payload);
    console.groupEnd();

    try {
      // ✅ Using global wrapper via meta
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

        // Check if registration response includes an access token (auto-login)
        if (result.data?.accessToken) {
          // Auto-login: Store token
          setToken(result.data.accessToken);
          // Note: Phone is not stored separately as it can be retrieved from token payload if needed
          // Clear logout flag since user is now logged in
          clearJustLoggedOutFlag();
          
          // Redirect directly to intended destination (authenticated experience)
          setTimeout(() => {
            navigate(intendedDestination, { replace: true });
          }, 1500);
        } else {
          // No token provided - redirect to login page
          setTimeout(() => {
            navigate('/login', { 
              state: { from: intendedDestination, reason: 'after_signup' }
            });
          }, 1500);
        }
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
            toast.error('This phone number is already registered.');
            break;
          default:
            toast.error(res.data?.message || 'Registration failed.');
        }
      }
    }
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

      {/* Register Card */}
      <div 
        className="relative z-10 w-full max-w-md laptop:max-w-lg bg-brand-cardLight rounded-xl shadow-2xl p-6 border border-brand-brown/20"
        onClick={(e) => e.stopPropagation()} // Prevent background click when clicking inside card
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-brand-brown mb-2">
            Create Account
          </h1>
          <p className="text-sm text-brand-textSecondary">
            Join Show you care today
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            className="w-full py-3 bg-brand-orange text-brand-textOnDark font-bold rounded-lg hover:bg-brand-orangeLight transition-colors"
          >
            Create Account
          </button>
        </form>

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
    </div>
  );
};

export default Register;
