// Utility function for className merging
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Generate QR code data URL (placeholder - replace with actual QR library)
export function generateQRCode(data) {
  // This is a placeholder. In production, use a library like 'qrcode' or 'qrcode.react'
  // For now, return a placeholder image
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="white" width="200" height="200"/%3E%3Ctext fill="black" font-family="monospace" font-size="12" x="50%25" y="50%25" text-anchor="middle"%3EQR Code%3C/text%3E%3Ctext fill="gray" font-size="10" x="50%25" y="60%25" text-anchor="middle"%3E${encodeURIComponent(data)}%3C/text%3E%3C/svg%3E`;
}

// Format phone number
export function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
  }
  return phone;
}

// Validate email
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone
export function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
}

// Backend response format: { code, message, data }
// Handle backend API responses and extract error messages
export function handleBackendResponse(responseData) {
  if (!responseData || typeof responseData !== 'object') {
    return { success: false, message: 'Invalid response from server' };
  }

  // Check if response indicates success
  if (responseData.code === "200") {
    return { 
      success: true, 
      message: responseData.message || 'Success',
      data: responseData.data 
    };
  }

  // Handle error codes
  let errorMessage = responseData.message || 'An error occurred';
  
  switch (responseData.code) {
    case "400001":
      errorMessage = 'Please fill in all required fields correctly.';
      break;
    case "400003":
      errorMessage = 'An account with this email already exists. Please login instead.';
      break;
    case "400004":
      errorMessage = 'Email or password is incorrect. Please try again.';
      break;
    default:
      errorMessage = responseData.message || 'An error occurred. Please try again.';
  }

  return { 
    success: false, 
    message: errorMessage,
    code: responseData.code 
  };
}

// Extract error message from API error
export function getErrorMessage(error) {
  const errorData = error?.response?.data;
  
  if (errorData && errorData.code) {
    // Backend error response format
    return handleBackendResponse(errorData).message;
  }
  
  // Network or other errors
  return error?.message || 'Network error. Please check your connection and try again.';
}

