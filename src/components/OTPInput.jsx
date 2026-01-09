// OTP Input Component
// A 6-digit OTP input field with auto-focus and validation

import React, { useState, useRef, useEffect } from 'react';
import { Hash } from 'lucide-react';

const OTPInput = ({ 
  value = '', 
  onChange, 
  onComplete,
  error,
  disabled = false,
  autoFocus = true 
}) => {
  const [otp, setOtp] = useState(value);
  const inputRefs = useRef([]);

  useEffect(() => {
    setOtp(value);
  }, [value]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (index, newValue) => {
    // Only allow numbers
    const numericValue = newValue.replace(/\D/g, '');
    
    if (numericValue.length > 1) {
      // Handle paste: extract 6 digits and fill inputs
      const digits = numericValue.slice(0, 6).split('');
      const newOtp = [...otp];
      
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Fill input refs
      newOtp.forEach((digit, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i].value = digit || '';
        }
      });
      
      // Focus next empty input or last input
      const nextEmptyIndex = newOtp.findIndex((d, i) => i >= index && !d);
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(index + digits.length, 5);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }
      
      // Trigger onChange
      const otpString = newOtp.join('');
      if (onChange) {
        onChange(otpString);
      }
      
      // Check if complete
      if (otpString.length === 6 && onComplete) {
        onComplete(otpString);
      }
      
      return;
    }
    
    // Single digit input
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);
    
    // Update input ref
    if (inputRefs.current[index]) {
      inputRefs.current[index].value = numericValue;
    }
    
    // Trigger onChange
    const otpString = newOtp.join('');
    if (onChange) {
      onChange(otpString);
    }
    
    // Auto-focus next input if digit entered
    if (numericValue && index < 5) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
    
    // Check if complete
    if (otpString.length === 6 && onComplete) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current input is empty, focus previous and clear it
        const prevInput = inputRefs.current[index - 1];
        if (prevInput) {
          prevInput.focus();
          prevInput.value = '';
          const newOtp = [...otp];
          newOtp[index - 1] = '';
          setOtp(newOtp);
          
          if (onChange) {
            onChange(newOtp.join(''));
          }
        }
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        
        if (inputRefs.current[index]) {
          inputRefs.current[index].value = '';
        }
        
        if (onChange) {
          onChange(newOtp.join(''));
        }
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length > 0) {
      const newOtp = digits.split('');
      // Pad to 6 digits if needed
      while (newOtp.length < 6) {
        newOtp.push('');
      }
      
      setOtp(newOtp);
      
      // Fill input refs
      newOtp.forEach((digit, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i].value = digit || '';
        }
      });
      
      // Focus last input or next empty
      const lastFilledIndex = newOtp.lastIndexOf(digits[digits.length - 1]);
      const focusIndex = lastFilledIndex !== -1 ? lastFilledIndex : Math.min(digits.length - 1, 5);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      }
      
      if (onChange) {
        onChange(newOtp.join(''));
      }
      
      if (newOtp.join('').length === 6 && onComplete) {
        onComplete(newOtp.join(''));
      }
    }
  };

  return (
    <div className="w-full">
      <label className="flex items-center gap-2 mb-2 text-sm text-brand-brown font-medium">
        <Hash className="w-4 h-4" /> Verification Code (OTP)
      </label>
      
      <div className="flex gap-2 justify-center">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            className={`
              w-12 h-14 text-center text-2xl font-bold
              border rounded-lg
              bg-white text-brand-brown
              focus:outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange
              transition-colors
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-brand-brown/20'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
            `}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            autoComplete="off"
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">
          {error}
        </p>
      )}
      
      <p className="text-xs text-brand-textSecondary mt-2 text-center">
        Enter the 6-digit code sent to your phone
      </p>
    </div>
  );
};

export default OTPInput;

