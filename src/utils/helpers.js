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

// Format phone number
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
