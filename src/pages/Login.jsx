import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { authAPI } from '../utils/api';
import { validatePhone } from '../utils/helpers';

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // await authAPI.sendOTP(phone);
      console.log('Sending OTP to:', phone);
      
      // Simulate API call
      setTimeout(() => {
        setStep('otp');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await authAPI.login(phone, otp);
      // localStorage.setItem('token', response.data.token);
      
      console.log('Logging in with:', { phone, otp });
      
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
              Welcome Back
            </h1>
            <p className="text-brand-textSecondary text-sm md:text-base">
              {step === 'phone' ? 'Enter your phone number to continue' : 'Enter the OTP sent to your phone'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              {/* Phone Number Input */}
              <div>
                <label className="flex items-center gap-2 text-white font-medium mb-2 text-sm">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand-purplePrimary/50 focus:border-brand-purplePrimary text-white placeholder-brand-textSecondary"
                  required
                />
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-purplePrimary text-white font-bold rounded-lg hover:bg-brand-purpleLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-sm text-brand-textSecondary mb-4 text-center">
                OTP sent to <span className="font-semibold text-white">{phone}</span>
              </div>
              
              {/* OTP Input */}
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
                  Enter OTP
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand-purplePrimary/50 focus:border-brand-purplePrimary text-white placeholder-brand-textSecondary text-center text-2xl tracking-widest"
                  required
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-purplePrimary text-white font-bold rounded-lg hover:bg-brand-purpleLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Login'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                }}
                className="w-full text-sm text-brand-textSecondary hover:text-white transition-colors"
              >
                Change phone number
              </button>
            </form>
          )}

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
