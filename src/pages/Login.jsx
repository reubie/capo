import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { authAPI } from '../utils/api';
import { handleBackendResponse, getErrorMessage } from '../utils/helpers';
import { setToken, resetAuth, clearJustLoggedOutFlag } from '../utils/auth';
import PhoneInput, { validatePhoneWithCountry, formatPhoneForBackend } from '../components/PhoneInput';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Determine redirect after login: use location.state.from if exists, else default to landing page
  const from = location.state?.from || '/';
  const reason = location.state?.reason; // 'token_expired' or 'after_signup'

  useEffect(() => {
    document.title = 'Show you care - Login';
    // Clear any old tokens on mount
    resetAuth();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setPhoneError('');

    // Validate phone number
    const phoneValidation = validatePhoneWithCountry(formData.phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      setError(phoneValidation.error);
      return;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    // Format phone number for backend (E.164 format)
    const formattedPhone = formatPhoneForBackend(formData.phone);

    setLoading(true);
    try {
      const response = await authAPI.login({
        phone: formattedPhone,
        password: formData.password,
      });
      const result = handleBackendResponse(response.data);

      if (result.success) {
        if (result.data?.accessToken) {
          setToken(result.data.accessToken); // store token centrally
        }
        // Note: Phone is not stored separately as it can be retrieved from token payload if needed
        // Clear logout flag since user is now logged in
        clearJustLoggedOutFlag();
        // Redirect to landing page after login
        navigate('/', { replace: true });
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      const res = err?.response;
      const backendCode = res?.data?.code;
      
      // Handle specific error codes
      if (backendCode === '400001') {
        setError('Please fill in all required fields correctly.');
      } else if (backendCode === '400004') {
        setError('Phone number or password is incorrect.');
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

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
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/background-img.png')" }} />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Login Card */}
      <div 
        className="relative z-10 w-full max-w-md laptop:max-w-lg bg-brand-cardLight rounded-xl shadow-2xl p-6 border border-brand-brown/20"
        onClick={(e) => e.stopPropagation()} // Prevent background click when clicking inside card
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-brand-brown mb-2">Welcome Back</h1>
          <p className="text-sm text-brand-textSecondary">Enter your credentials to continue</p>
        </div>

        {/* Show helpful message if redirected due to expired token or after logout */}
        {reason === 'token_expired' && (
          <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-700 text-sm">
            Your session has expired. Please log in again to continue.
          </div>
        )}
        {reason === 'after_logout' && (
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-700 text-sm">
            You've been logged out. Please log in again to continue.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <PhoneInput
            value={formData.phone}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, phone: value || '' }));
              const validation = validatePhoneWithCountry(value);
              setPhoneError(validation.isValid ? '' : validation.error);
              if (validation.isValid) {
                setError(''); // Clear general error if phone is now valid
              }
            }}
            error={phoneError}
            label="Phone Number"
            placeholder="Enter your phone number"
            required
            disabled={loading}
          />

          <div>
            <label className="flex items-center gap-2 mb-2 text-sm text-brand-brown font-medium">
              <Lock className="w-4 h-4" /> Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg border-brand-brown/20 bg-white text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-orange text-brand-textOnDark font-bold rounded-lg hover:bg-brand-orangeLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-brand-brown/20 text-center">
          <p className="text-sm text-brand-textSecondary mb-2">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register', { 
              state: { from: from } 
            })} className="text-brand-orange font-semibold hover:underline">
              Register
            </button>
          </p>
          <button onClick={() => navigate('/')} className="text-sm text-brand-brown font-medium hover:underline">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

