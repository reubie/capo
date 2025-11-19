import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { authAPI } from '../utils/api';
import { validateEmail, handleBackendResponse, getErrorMessage } from '../utils/helpers';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get the intended destination from navigation state, or default to /gifticon
  const from = location.state?.from?.pathname || '/gifticon';

  useEffect(() => {
    document.title = 'Show you care - Login';
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Call backend login endpoint: POST /user/login
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });
      
      // Handle backend response format: { code, message, data }
      const result = handleBackendResponse(response.data);
      
      if (result.success) {
        // Success - save accessToken from data
        if (result.data?.accessToken) {
          localStorage.setItem('token', result.data.accessToken);
        }
        
        // Redirect to intended destination or default to /gifticon
        navigate(from, { replace: true });
      } else {
        // Show error message
        setError(result.message);
        setLoading(false);
      }
    } catch (err) {
      // Handle network errors or HTTP errors using helper function
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/background-img.png')" }}
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-brand-cardDark rounded-2xl shadow-2xl p-8 md:p-10 border border-white/10">
          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-brand-textSecondary text-sm md:text-base">
              Enter your credentials to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-2 text-sm">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand-purplePrimary/50 focus:border-brand-purplePrimary text-white placeholder-brand-textSecondary"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-2 text-sm">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand-purplePrimary/50 focus:border-brand-purplePrimary text-white placeholder-brand-textSecondary"
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-purplePrimary text-white font-bold rounded-lg hover:bg-brand-purpleLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-brand-textSecondary mb-2">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-white font-semibold hover:underline"
              >
                Register
              </button>
            </p>
          </div>

          {/* Back to Home Link */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-white font-medium hover:underline"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
