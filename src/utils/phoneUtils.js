/**
 * Phone Number Utility using libphonenumber-js
 * Provides accurate, country-specific phone number validation and formatting
 * Based on Google's libphonenumber library (industry standard)
 */

import {
  parsePhoneNumber,
  parsePhoneNumberFromString,
  isValidPhoneNumber,
  getCountries,
  getCountryCallingCode,
  formatIncompletePhoneNumber,
  AsYouType,
} from 'libphonenumber-js';

/**
 * Normalize phone number to E.164 format with country-specific formatting for display
 * Uses libphonenumber-js for accurate parsing and formatting
 * 
 * @param {string} phone - Phone number in any format (local, international, with/without +)
 * @param {string} defaultCountry - ISO 3166-1 alpha-2 country code (e.g., 'US', 'SG', 'KE') - optional
 * @returns {string} - Formatted phone number (e.g., "+65 9123 4567" or "+254 720 637771")
 */
export function normalizePhoneNumber(phone, defaultCountry = null) {
  // Handle edge cases
  if (!phone || typeof phone !== 'string') return phone || '';
  if (phone.trim() === '-') return phone;
  
  const trimmed = phone.trim();
  if (!trimmed) return '';
  
  try {
    // Try to parse the phone number
    let phoneNumber;
    
    if (defaultCountry) {
      // Parse with country context for better accuracy
      phoneNumber = parsePhoneNumberFromString(trimmed, defaultCountry);
    } else {
      // Try parsing without country (will auto-detect from + prefix)
      phoneNumber = parsePhoneNumberFromString(trimmed);
    }
    
    if (phoneNumber && phoneNumber.isValid()) {
      // Format in international format with spaces for readability
      // Example: "+6591234567" → "+65 9123 4567"
      const formatted = phoneNumber.formatInternational();
      return formatted;
    }
    
    // If parsing failed, try to format as user types (for incomplete numbers)
    if (trimmed.startsWith('+')) {
      const asYouType = new AsYouType();
      const formatted = asYouType.input(trimmed);
      if (formatted) {
        return formatted;
      }
    }
    
    // Fallback: return cleaned version if parsing completely fails
    // Remove dots, normalize spaces
    let cleaned = trimmed.replace(/\./g, '').replace(/\s+/g, ' ').trim();
    
    // Ensure it starts with + if it looks like an international number
    if (cleaned.match(/^\d{10,15}$/) && !cleaned.startsWith('+')) {
      // Might be a local number, but we can't format without country
      return cleaned;
    }
    
    return cleaned;
  } catch (error) {
    // If all parsing fails, return cleaned version
    console.warn('Phone number normalization failed:', error.message);
    return trimmed.replace(/\./g, '').replace(/\s+/g, ' ').trim();
  }
}

/**
 * Format phone number for display (country-specific formatting)
 * 
 * @param {string} phone - Phone number in E.164 or any format
 * @param {string} defaultCountry - ISO 3166-1 alpha-2 country code
 * @returns {string} - Formatted phone number for display
 */
export function formatPhoneNumberForDisplay(phone, defaultCountry = null) {
  if (!phone || typeof phone !== 'string') return phone || '';
  if (phone.trim() === '-') return phone;
  
  try {
    const phoneNumber = defaultCountry 
      ? parsePhoneNumberFromString(phone, defaultCountry)
      : parsePhoneNumberFromString(phone);
    
    if (phoneNumber && phoneNumber.isValid()) {
      // Use international format for display (most readable)
      return phoneNumber.formatInternational();
    }
    
    // For incomplete numbers, use AsYouType formatter
    if (phone.startsWith('+')) {
      const asYouType = new AsYouType();
      return asYouType.input(phone) || phone;
    }
    
    return phone;
  } catch (error) {
    return phone;
  }
}

/**
 * Format phone number for backend (E.164 format: +1234567890)
 * 
 * @param {string} phone - Phone number in any format
 * @param {string} defaultCountry - ISO 3166-1 alpha-2 country code
 * @returns {string} - E.164 formatted phone number
 */
export function formatPhoneForBackend(phone, defaultCountry = null) {
  if (!phone || typeof phone !== 'string') return '';
  
  try {
    const phoneNumber = defaultCountry
      ? parsePhoneNumberFromString(phone, defaultCountry)
      : parsePhoneNumberFromString(phone);
    
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.format('E.164'); // +1234567890
    }
    
    // Fallback: clean and ensure starts with +
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `+${cleaned}`;
    }
    
    return phone.startsWith('+') ? phone : `+${phone}`;
  } catch (error) {
    // Fallback: remove spaces and ensure starts with +
    const cleaned = phone.replace(/\s/g, '').replace(/^\+?/, '+');
    return cleaned;
  }
}

/**
 * Validate phone number with country-specific rules
 * 
 * @param {string} phone - Phone number to validate
 * @param {string} defaultCountry - ISO 3166-1 alpha-2 country code (optional, helps with local formats)
 * @returns {{isValid: boolean, error: string|null, country: string|null}} - Validation result
 */
export function validatePhoneNumber(phone, defaultCountry = null) {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required', country: null };
  }
  
  if (!phone.startsWith('+')) {
    return { isValid: false, error: 'Please include country code (e.g., +65 for Singapore)', country: null };
  }
  
  try {
    const phoneNumber = defaultCountry
      ? parsePhoneNumberFromString(phone, defaultCountry)
      : parsePhoneNumberFromString(phone);
    
    if (!phoneNumber) {
      return { isValid: false, error: 'Invalid phone number format', country: null };
    }
    
    if (!phoneNumber.isValid()) {
      return { 
        isValid: false, 
        error: `Invalid phone number for ${phoneNumber.country || 'this country'}`, 
        country: phoneNumber.country 
      };
    }
    
    return { 
      isValid: true, 
      error: null, 
      country: phoneNumber.country || null 
    };
  } catch (error) {
    return { isValid: false, error: 'Invalid phone number format', country: null };
  }
}

/**
 * Get country code from phone number
 * 
 * @param {string} phone - Phone number in E.164 or international format
 * @returns {string|null} - ISO 3166-1 alpha-2 country code or null
 */
export function getCountryFromPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return null;
  
  try {
    const phoneNumber = parsePhoneNumberFromString(phone);
    return phoneNumber?.country || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get country calling code from country code
 * 
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code (e.g., 'SG', 'KE')
 * @returns {string|null} - Country calling code (e.g., '65', '254') or null
 */
export function getCallingCode(countryCode) {
  if (!countryCode) return null;
  
  try {
    return getCountryCallingCode(countryCode.toUpperCase());
  } catch (error) {
    return null;
  }
}

/**
 * Check if phone number is mobile (when possible to determine)
 * Note: Not all countries can reliably distinguish mobile from landline
 * 
 * @param {string} phone - Phone number
 * @param {string} defaultCountry - ISO 3166-1 alpha-2 country code
 * @returns {boolean|null} - true if mobile, false if not mobile, null if cannot determine
 */
export function isMobileNumber(phone, defaultCountry = null) {
  if (!phone || typeof phone !== 'string') return null;
  
  try {
    const phoneNumber = defaultCountry
      ? parsePhoneNumberFromString(phone, defaultCountry)
      : parsePhoneNumberFromString(phone);
    
    if (!phoneNumber || !phoneNumber.isValid()) {
      return null;
    }
    
    // Get number type (MOBILE, FIXED_LINE, etc.)
    const numberType = phoneNumber.getType();
    
    // Return true for mobile, false for fixed line, null for others
    if (numberType === 'MOBILE') return true;
    if (numberType === 'FIXED_LINE') return false;
    
    // For countries where mobile and fixed line share prefixes, return null
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Format phone number as user types (for input fields)
 * Provides real-time formatting as user types
 * 
 * @param {string} value - Current input value
 * @param {string} defaultCountry - ISO 3166-1 alpha-2 country code
 * @returns {string} - Formatted phone number
 */
export function formatAsYouType(value, defaultCountry = null) {
  if (!value || typeof value !== 'string') return '';
  
  try {
    const asYouType = new AsYouType(defaultCountry);
    return asYouType.input(value) || value;
  } catch (error) {
    return value;
  }
}

/**
 * Extract country name from phone number (for display purposes)
 * Uses the country code mapping from helpers.js
 * 
 * @param {string} phone - Phone number
 * @returns {string} - Country name or country code
 */
export function getCountryNameFromPhone(phone) {
  const countryCode = getCountryFromPhoneNumber(phone);
  if (!countryCode) return 'Unknown';
  
  // Import the mapping from helpers (to avoid duplication)
  // For now, return country code - can be enhanced with full country name mapping
  return countryCode;
}

