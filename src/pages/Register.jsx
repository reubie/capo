import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { authAPI } from '../utils/api';
import { validateEmail, handleBackendResponse, getErrorMessage } from '../utils/helpers';

const Register = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('manual'); // 'manual' or 'card'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cardImage, setCardImage] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setCardImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCard = () => {
    setCardImage(null);
    setCardPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'manual') {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }
      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (formData.password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    } else {
      if (!cardImage) {
        setError('Please upload a business card image');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'manual') {
        // Call backend signup endpoint: POST /user/signup
        const response = await authAPI.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        
        // Handle backend response format: { code, message, data }
        const result = handleBackendResponse(response.data);
        
        if (result.success) {
          // Success - save token if provided in data
          if (result.data?.token) {
            localStorage.setItem('token', result.data.token);
          }
          
          // Redirect to gifticon page
          navigate('/gifticon');
        } else {
          // Show error message
          setError(result.message);
          setLoading(false);
        }
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append('card', cardImage);
        // TODO: Replace with actual API call when backend supports it
        // await authAPI.uploadBusinessCard(formDataToSend);
        console.log('Registering with business card');
        setError('Business card registration not yet implemented');
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
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/images/logo.png"
              alt="CAPO Logo"
              className="w-24 h-24 md:w-28 md:h-28 object-contain"
            />
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-brand-textSecondary text-sm md:text-base">
              Join Capo 靠谱 today
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'manual'
                  ? 'bg-brand-purplePrimary text-white shadow-sm'
                  : 'text-brand-textSecondary hover:text-white'
              }`}
            >
              Manual Entry
            </button>
            <button
              type="button"
              onClick={() => setMode('card')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'card'
                  ? 'bg-brand-purplePrimary text-white shadow-sm'
                  : 'text-brand-textSecondary hover:text-white'
              }`}
            >
              Business Card
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {mode === 'manual' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand-purplePrimary/50 focus:border-brand-purplePrimary text-white placeholder-brand-textSecondary"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
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
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
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
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand-purplePrimary/50 focus:border-brand-purplePrimary text-white placeholder-brand-textSecondary"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-purplePrimary text-white font-bold rounded-lg hover:bg-brand-purpleLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
                  Business Card Image
                </label>
                {cardPreview ? (
                  <div className="relative">
                    <img
                      src={cardPreview}
                      alt="Business card preview"
                      className="w-full h-48 object-contain rounded-lg border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveCard}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCardUpload}
                      className="hidden"
                      id="card-upload"
                    />
                    <label
                      htmlFor="card-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <div className="p-4 bg-brand-purplePrimary/10 rounded-full">
                        <Upload className="w-8 h-8 text-brand-purplePrimary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Click to upload or take a photo
                        </p>
                        <p className="text-xs text-brand-textSecondary mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !cardImage}
                className="w-full py-3 bg-brand-purplePrimary text-white font-bold rounded-lg hover:bg-brand-purpleLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-brand-textSecondary mb-2">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-white font-semibold hover:underline"
              >
                Login
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

export default Register;
