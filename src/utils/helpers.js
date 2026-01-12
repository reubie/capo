// Re-export phone utilities for backward compatibility
export { 
  normalizePhoneNumber,
  formatPhoneNumberForDisplay,
  formatPhoneForBackend as formatPhoneForBackendNew,
  validatePhoneNumber as validatePhoneNumberNew,
  getCountryFromPhoneNumber,
  isMobileNumber
} from './phoneUtils';

// Utility function for className merging
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Generate QR code data URL (placeholder - replace with actual QR library)
export function generateQRCode(data) {
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="white" width="200" height="200"/%3E%3Ctext fill="black" font-family="monospace" font-size="12" x="50%25" y="50%25" text-anchor="middle"%3EQR Code%3C/text%3E%3Ctext fill="gray" font-size="10" x="50%25" y="60%25" text-anchor="middle"%3E${encodeURIComponent(
    data
  )}%3C/text%3E%3C/svg%3E`;
}

/**
 * Country code to country name mapping
 * Maps country codes to their full country names for sorting
 */
export const COUNTRY_CODE_TO_NAME = {
  '1': 'United States',
  '20': 'Egypt',
  '27': 'South Africa',
  '31': 'Netherlands',
  '32': 'Belgium',
  '33': 'France',
  '34': 'Spain',
  '39': 'Italy',
  '41': 'Switzerland',
  '44': 'United Kingdom',
  '45': 'Denmark',
  '46': 'Sweden',
  '47': 'Norway',
  '49': 'Germany',
  '52': 'Mexico',
  '54': 'Argentina',
  '55': 'Brazil',
  '60': 'Malaysia',
  '61': 'Australia',
  '62': 'Indonesia',
  '63': 'Philippines',
  '64': 'New Zealand',
  '65': 'Singapore',
  '66': 'Thailand',
  '81': 'Japan',
  '82': 'South Korea',
  '84': 'Vietnam',
  '86': 'China',
  '90': 'Turkey',
  '91': 'India',
  '92': 'Pakistan',
  '94': 'Sri Lanka',
  '212': 'Morocco',
  '233': 'Ghana',
  '234': 'Nigeria',
  '254': 'Kenya',
  '255': 'Tanzania',
  '256': 'Uganda',
  '351': 'Portugal',
  '353': 'Ireland',
  '358': 'Finland',
  '880': 'Bangladesh',
  '966': 'Saudi Arabia',
  '971': 'United Arab Emirates',
  '972': 'Israel',
};

/**
 * Extract country code from phone number and return country name
 * @param {string} phone - Phone number (normalized format like "+82 10 3652 8758" or "+254 720 637771")
 * @returns {string} Country name or country code if name not found
 */
export function getCountryFromPhone(phone) {
  if (!phone || typeof phone !== 'string') return 'Unknown';
  if (phone.trim() === '-') return 'Unknown';
  
  // Extract digits after + sign (country code + number part)
  // Remove spaces to get clean digits
  const digits = phone.replace(/^\+/, '').replace(/\s+/g, '');
  if (!digits || digits.length === 0) return 'Unknown';
  
  // Try to match country codes from longest to shortest (to handle multi-digit codes correctly)
  // Check 4-digit codes first (e.g., 880, 966, 971, 972)
  if (digits.length >= 4) {
    const fourDigit = digits.substring(0, 4);
    if (COUNTRY_CODE_TO_NAME[fourDigit]) {
      return COUNTRY_CODE_TO_NAME[fourDigit];
    }
  }
  
  // Check 3-digit codes (e.g., 254, 351, 353, 358)
  if (digits.length >= 3) {
    const threeDigit = digits.substring(0, 3);
    if (COUNTRY_CODE_TO_NAME[threeDigit]) {
      return COUNTRY_CODE_TO_NAME[threeDigit];
    }
  }
  
  // Check 2-digit codes (e.g., 65, 82, 86, 91)
  if (digits.length >= 2) {
    const twoDigit = digits.substring(0, 2);
    if (COUNTRY_CODE_TO_NAME[twoDigit]) {
      return COUNTRY_CODE_TO_NAME[twoDigit];
    }
  }
  
  // Check 1-digit codes (e.g., 1 for US/Canada)
  if (digits.length >= 1) {
    const oneDigit = digits.substring(0, 1);
    if (COUNTRY_CODE_TO_NAME[oneDigit]) {
      return COUNTRY_CODE_TO_NAME[oneDigit];
    }
  }
  
  // Return country code as fallback (first 1-3 digits based on common patterns)
  const fallbackCode = digits.substring(0, Math.min(3, digits.length));
  return `+${fallbackCode}`;
}

/**
 * Country code patterns for phone number formatting
 * Maps country codes to their formatting functions
 */
const COUNTRY_FORMATTERS = {
  '1': (digits) => {
    // US/Canada: +1 XXX XXX XXXX
    if (digits.length === 10) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return digits;
  },
  '65': (digits) => {
    // Singapore: +65 XXXX XXXX (8 digits, no area code)
    if (digits.length === 8) {
      return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
    return digits;
  },
  '82': (digits) => {
    // Korea: +82 10 XXXX XXXX (mobile) or +82 2 XXXX XXXX (Seoul)
    if (digits.startsWith('10') && digits.length >= 9) {
      // Mobile: +82 10 XXXX XXXX
      return `${digits.slice(0, 2)} ${digits.slice(2, digits.length - 4)} ${digits.slice(digits.length - 4)}`;
    } else if (digits.startsWith('2') && digits.length >= 8) {
      // Seoul landline: +82 2 XXXX XXXX
      return `${digits.slice(0, 1)} ${digits.slice(1, digits.length - 4)} ${digits.slice(digits.length - 4)}`;
    }
    return digits;
  },
  '86': (digits) => {
    // China: +86 1XX XXXX XXXX
    if (digits.length === 11) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
    }
    return digits;
  },
  '81': (digits) => {
    // Japan: +81 XX XXXX XXXX
    if (digits.length >= 10) {
      return `${digits.slice(0, 2)} ${digits.slice(2, digits.length - 4)} ${digits.slice(digits.length - 4)}`;
    }
    return digits;
  },
  '44': (digits) => {
    // UK: +44 XXXX XXXXXX
    if (digits.length >= 10) {
      return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
    return digits;
  },
  '61': (digits) => {
    // Australia: +61 X XXXX XXXX (9 digits total after country code)
    // Example: "85200282" → "8 5200 0282" or "8520 0282"
    if (digits.length === 9) {
      // Format as: first digit (area code) + next 4 digits + last 4 digits
      return `${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5)}`;
    } else if (digits.length === 8) {
      // Alternative format: 8 digits → XXXX XXXX
      return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
    return digits;
  },
};


// Format phone number (legacy function, kept for backward compatibility)
export function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
  }

  return phone;
}

// Validate email
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone number
// Accepts formats like: 01011112222, +821011112222, +82 10 1111 2222
// Returns true if phone is valid (at least 10 digits)
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all non-digit characters to check length
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Phone should have at least 10 digits (minimum for most countries)
  // Maximum 15 digits (E.164 standard)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

// Validate name (single or multiple words, letters only)
export function validateName(name) {
  return /^[A-Za-z\s]+$/.test(name.trim());
}

// ✅ Password validation (NO special characters required)
export function validatePassword(password) {
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isValid = Object.values(rules).every(Boolean);

  return { isValid, rules };
}

// Password strength label
export function getPasswordStrength(password) {
  const { rules } = validatePassword(password);
  const fulfilled = Object.values(rules).filter(Boolean).length;

  if (fulfilled <= 1) return 'Weak';
  if (fulfilled === 2 || fulfilled === 3) return 'Medium';
  if (fulfilled === 4) return 'Strong';
  return 'Weak';
}

// Backend response format: { code, message, data }
export function handleBackendResponse(responseData) {
  if (!responseData || typeof responseData !== 'object') {
    return { success: false, message: 'Invalid response from server' };
  }

  if (responseData.code === '200') {
    return {
      success: true,
      message: responseData.message || 'Success',
      data: responseData.data,
    };
  }

  let errorMessage = responseData.message || 'An error occurred';

  switch (responseData.code) {
    case '400001':
      errorMessage =
        'Please ensure all fields are valid and the password meets the requirements.';
      break;
    case '400003':
      errorMessage =
        'An account with this email already exists. Please log in instead.';
      break;
    case '400004':
      errorMessage =
        'Email or password is incorrect. Please try again.';
      break;
    default:
      errorMessage =
        responseData.message || 'An unexpected error occurred. Please try again.';
  }

  return { success: false, message: errorMessage, code: responseData.code };
}

// Extract error message from API error
export function getErrorMessage(error) {
  const errorData = error?.response?.data;

  if (errorData?.code) {
    return handleBackendResponse(errorData).message;
  }

  return (
    error?.message ||
    'Network error. Please check your connection and try again.'
  );
}
