import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { authAPI } from '../utils/api';
import { validateEmail, validatePhone } from '../utils/helpers';

const Register = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('manual'); // 'manual' or 'card'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('form'); // 'form' or 'otp'
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
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Please fill in all fields');
        return;
      }
      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
      if (!validatePhone(formData.phone)) {
        setError('Please enter a valid phone number');
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
        // TODO: Replace with actual API call
        // await authAPI.register(formData);
        console.log('Registering with:', formData);
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append('card', cardImage);
        // TODO: Replace with actual API call
        // await authAPI.uploadBusinessCard(formDataToSend);
        console.log('Registering with business card');
      }

      // Simulate API call
      setTimeout(() => {
        setStep('otp');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await authAPI.register({ ...formData, otp });
      // localStorage.setItem('token', response.data.token);
      
      console.log('Verifying OTP:', otp);
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        navigate('/gifticon');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
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
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#F5E6D3] rounded-2xl shadow-2xl p-8 md:p-10">
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
            <h1 className="text-3xl md:text-4xl font-bold text-[#8B4513] mb-2">
              Create Account
            </h1>
            <p className="text-[#8B4513]/70 text-sm md:text-base">
              Join Capo 靠谱 today
            </p>
          </div>

          {step === 'form' && (
            <>
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6 p-1 bg-[#8B4513]/10 rounded-lg">
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    mode === 'manual'
                      ? 'bg-[#8B4513] text-white shadow-sm'
                      : 'text-[#8B4513]/70 hover:text-[#8B4513]'
                  }`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setMode('card')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    mode === 'card'
                      ? 'bg-[#8B4513] text-white shadow-sm'
                      : 'text-[#8B4513]/70 hover:text-[#8B4513]'
                  }`}
                >
                  Business Card
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {mode === 'manual' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[#8B4513] font-medium mb-2 text-sm">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#8B4513]/30 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/50 focus:border-[#8B4513] text-[#8B4513] placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#8B4513] font-medium mb-2 text-sm">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#8B4513]/30 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/50 focus:border-[#8B4513] text-[#8B4513] placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#8B4513] font-medium mb-2 text-sm">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#8B4513]/30 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/50 focus:border-[#8B4513] text-[#8B4513] placeholder-gray-400"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#8B4513] text-white font-bold rounded-lg hover:bg-[#A0522D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Continue'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[#8B4513] font-medium mb-2 text-sm">
                      Business Card Image
                    </label>
                    {cardPreview ? (
                      <div className="relative">
                        <img
                          src={cardPreview}
                          alt="Business card preview"
                          className="w-full h-48 object-contain rounded-lg border-2 border-[#8B4513]/30"
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
                      <div className="border-2 border-dashed border-[#8B4513]/30 rounded-lg p-8 text-center hover:border-[#8B4513] transition-colors">
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
                          <div className="p-4 bg-[#8B4513]/10 rounded-full">
                            <Upload className="w-8 h-8 text-[#8B4513]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#8B4513]">
                              Click to upload or take a photo
                            </p>
                            <p className="text-xs text-[#8B4513]/70 mt-1">
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
                    className="w-full py-3 bg-[#8B4513] text-white font-bold rounded-lg hover:bg-[#A0522D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Continue'}
                  </button>
                </form>
              )}
            </>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-[#8B4513]/70 text-sm">
                  We've sent a verification code to your phone
                </p>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[#8B4513] font-medium mb-2 text-sm">
                  Enter OTP
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full px-4 py-3 border border-[#8B4513]/30 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/50 focus:border-[#8B4513] text-[#8B4513] placeholder-gray-400 text-center text-2xl tracking-widest"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#8B4513] text-white font-bold rounded-lg hover:bg-[#A0522D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Register'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setOtp('');
                }}
                className="w-full text-sm text-[#8B4513]/70 hover:text-[#8B4513] transition-colors"
              >
                Back to registration
              </button>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-[#8B4513]/20">
            <p className="text-center text-sm text-[#8B4513]/70 mb-2">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-[#8B4513] font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </div>

          {/* Back to Home Link */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-[#8B4513] font-medium hover:underline"
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
