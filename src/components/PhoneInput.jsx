import React, { useState, useEffect, useRef } from 'react';
import PhoneInputWithCountry from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Phone } from 'lucide-react';
import { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';
import { detectUserCountry, detectUserCountrySync } from '../utils/countryDetection';
import { formatPhoneForBackend as formatPhoneForBackendLib } from '../utils/phoneUtils';

const PhoneInput = ({ 
  value, 
  onChange, 
  onBlur,
  error,
  label = "Phone Number",
  placeholder = "Enter your phone number",
  required = false,
  className = "",
  disabled = false,
  defaultCountry = null // If null, will auto-detect
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState(defaultCountry || 'US');
  const inputRef = useRef(null);

  // Auto-detect country on mount if defaultCountry is not provided
  useEffect(() => {
    if (defaultCountry === null) {
      // Use sync locale detection first for immediate UI feedback (temporary)
      const syncCountry = detectUserCountrySync();
      setDetectedCountry(syncCountry);
      
      // Then immediately try IP-based detection (primary method for location accuracy)
      // This will update the country when IP detection completes
      detectUserCountry(true).then(country => {
        if (country) {
          setDetectedCountry(country);
          console.log('✅ Country updated to:', country);
        }
      }).catch((error) => {
        // Silently fail - we already have a locale-based default
        console.warn('IP detection failed, using locale-based country:', error.message);
      });
    } else {
      setDetectedCountry(defaultCountry);
    }
  }, [defaultCountry]);

  // Handle autofill: If value doesn't start with +, try to detect country code
  useEffect(() => {
    if (value && value !== internalValue) {
      // If value is autofilled and doesn't have country code, try to detect it
      if (!value.startsWith('+') && value.length >= 10) {
        const digitsOnly = value.replace(/\D/g, '');
        
        // Try to detect country based on number patterns
        if (digitsOnly.startsWith('010') && digitsOnly.length === 11) {
          // Korean mobile: 010xxxxxxxx -> +82 10 xxxxxxxx
          const formatted = `+82 ${digitsOnly.substring(1, 3)} ${digitsOnly.substring(3, 7)} ${digitsOnly.substring(7)}`;
          setInternalValue(formatted);
          onChange?.(formatted);
          return;
        } else if (digitsOnly.startsWith('82') && digitsOnly.length >= 11) {
          // Korean with country code but no +: 8210xxxxxxxx -> +82 10 xxxxxxxx
          const formatted = `+82 ${digitsOnly.substring(2, 4)} ${digitsOnly.substring(4, 8)} ${digitsOnly.substring(8)}`;
          setInternalValue(formatted);
          onChange?.(formatted);
          return;
        } else if (digitsOnly.length === 10 && digitsOnly.startsWith('0') === false) {
          // US/Canada format: 10 digits without leading 0
          // Default to US (+1) for 10-digit numbers
          const formatted = `+1 ${digitsOnly.substring(0, 3)} ${digitsOnly.substring(3, 6)} ${digitsOnly.substring(6)}`;
          setInternalValue(formatted);
          onChange?.(formatted);
          return;
        } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
          // US/Canada with country code: 1xxxxxxxxxx -> +1 xxxxxxxxxx
          const formatted = `+1 ${digitsOnly.substring(1, 4)} ${digitsOnly.substring(4, 7)} ${digitsOnly.substring(7)}`;
          setInternalValue(formatted);
          onChange?.(formatted);
          return;
        }
      }
      
      // If value already has + or doesn't match patterns, use as-is
      setInternalValue(value);
    } else if (!value && internalValue) {
      // Clear internal value if external value is cleared
      setInternalValue('');
    }
  }, [value]);

  const handleChange = (newValue) => {
    // react-phone-number-input already handles formatting, so we don't need to format again
    // Just update the internal value and call onChange
    setInternalValue(newValue || '');
    setHasInteracted(true);
    onChange?.(newValue || '');
  };

  const handleBlur = () => {
    setHasInteracted(true);
    onBlur?.();
  };

  // Validate phone number
  const isValid = internalValue ? isValidPhoneNumber(internalValue) : !required;
  const showError = hasInteracted && error;
  const showValidationError = hasInteracted && internalValue && !isValid;

  return (
    <div className={className}>
      <label className="flex items-center gap-2 mb-2 text-sm text-brand-brown font-medium">
        <Phone className="w-4 h-4" /> {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <PhoneInputWithCountry
          ref={inputRef}
          international
          defaultCountry={detectedCountry}
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={`
            phone-input-wrapper
            ${showError || showValidationError ? 'phone-input-error' : ''}
          `}
          numberInputProps={{
            className: `
              w-full px-4 py-3 border rounded-lg
              ${showError || showValidationError 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-brand-brown/20 focus:border-brand-orange focus:ring-brand-orange/50'
              }
              bg-white text-brand-brown 
              placeholder-brand-textSecondary 
              focus:outline-none focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
            `,
            placeholder: placeholder
          }}
        />
      </div>

      {/* User Instructions */}
      {!hasInteracted && (
        <p className="text-xs text-brand-textSecondary mt-1">
          Select your country code and enter your phone number
        </p>
      )}

      {/* Error Messages */}
      {showError && (
        <p className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
      
      {showValidationError && !showError && (
        <p className="text-red-500 text-sm mt-1">
          Please enter a valid phone number with country code
        </p>
      )}

      {/* Helpful hint for autofill */}
      {internalValue && !internalValue.startsWith('+') && hasInteracted && (
        <p className="text-xs text-orange-600 mt-1">
          💡 Tip: Please select your country code from the dropdown
        </p>
      )}
    </div>
  );
};

// Export validation helper
export const validatePhoneWithCountry = (phone) => {
  if (!phone) return { isValid: false, error: 'Phone number is required' };
  if (!phone.startsWith('+')) {
    return { isValid: false, error: 'Please select a country code' };
  }
  if (!isValidPhoneNumber(phone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  return { isValid: true, error: null };
};

// Format phone for backend (E.164 format: +1234567890)
// Uses libphonenumber-js for accurate formatting
export const formatPhoneForBackend = (phone, defaultCountry = null) => {
  if (!phone) return '';
  try {
    // Use libphonenumber-js for better accuracy
    return formatPhoneForBackendLib(phone, defaultCountry);
  } catch {
    // Fallback: use react-phone-number-input
    try {
      const phoneNumber = parsePhoneNumber(phone);
      return phoneNumber ? phoneNumber.format('E.164') : phone.replace(/\s/g, '');
    } catch {
      // Final fallback: remove spaces and ensure starts with +
      return phone.replace(/\s/g, '').replace(/^\+?/, '+');
    }
  }
};

export default PhoneInput;

