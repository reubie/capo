import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { authAPI } from '../utils/api';
import { validateEmail, handleBackendResponse, getErrorMessage } from '../utils/helpers';
import { setToken, resetAuth, setUserEmail } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine redirect after login: use location.state.from if exists, else default
  const from = location.state?.from || '/gifticon';

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
      const response = await authAPI.login(formData);
      const result = handleBackendResponse(response.data);

      if (result.success) {
        if (result.data?.accessToken) {
          setToken(result.data.accessToken); // store token centrally
        }
        // Store user email for profile display
        if (formData.email) {
          setUserEmail(formData.email);
        }
        // Redirect to the intended page
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/background-img.png')" }} />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md laptop:max-w-lg bg-brand-cardLight rounded-xl shadow-2xl p-6 border border-brand-brown/20">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-brand-brown mb-2">Welcome Back</h1>
          <p className="text-sm text-brand-textSecondary">Enter your credentials to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 mb-2 text-sm text-brand-brown font-medium">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg border-brand-brown/20 bg-white text-brand-brown placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
              required
            />
          </div>

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
            <button onClick={() => navigate('/register')} className="text-brand-orange font-semibold hover:underline">
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

