/**
 * User-friendly error messages for Firebase OTP authentication
 * Converts technical errors into messages users can understand
 */

/**
 * Get user-friendly error message from Firebase error
 * @param {Error} error - Firebase error object
 * @returns {{title: string, message: string}} - User-friendly error title and message
 */
export const getUserFriendlyOTPError = (error) => {
  // Handle error codes
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';

  // Check for specific error patterns in message
  const isBillingError = errorMessage.includes('BILLING_REQUIRED') || 
                         errorCode === 'auth/quota-exceeded' ||
                         errorMessage.toLowerCase().includes('billing');
  
  const isInvalidCredential = errorCode === 'auth/invalid-app-credential' ||
                             errorMessage.includes('INVALID_APP_CREDENTIAL') ||
                             errorMessage.includes('CAPTCHA_CHECK_FAILED');
  
  const isRateLimit = errorCode === 'auth/too-many-requests' ||
                      errorMessage.toLowerCase().includes('too many');
  
  const isExpired = errorCode === 'auth/code-expired' ||
                    errorCode === 'auth/session-expired' ||
                    errorMessage.toLowerCase().includes('expired');
  
  const isInvalidCode = errorCode === 'auth/invalid-verification-code' ||
                        errorMessage.toLowerCase().includes('invalid') && 
                        (errorMessage.toLowerCase().includes('code') || errorMessage.toLowerCase().includes('otp'));
  
  const isInvalidPhone = errorCode === 'auth/invalid-phone-number' ||
                         errorMessage.toLowerCase().includes('invalid phone');
  
  const isNetworkError = !errorCode && (
    errorMessage.toLowerCase().includes('network') ||
    errorMessage.toLowerCase().includes('connection') ||
    errorMessage.toLowerCase().includes('fetch')
  );
  
  const isRecaptchaRendered = errorMessage.includes('already been rendered') ||
                              errorMessage.includes('reCAPTCHA has already been rendered');

  // Return user-friendly messages
  if (isBillingError) {
    return {
      title: 'Service Temporarily Unavailable',
      message: 'Phone verification is currently unavailable. Please try again in a few minutes, or contact support if the issue persists.\n\nWe apologize for the inconvenience.'
    };
  }

  if (isInvalidCredential) {
    return {
      title: 'Verification Failed',
      message: 'We couldn\'t verify your request. Please refresh the page and try again.\n\nIf the problem continues, please contact support.'
    };
  }

  if (isRateLimit) {
    return {
      title: 'Too Many Attempts',
      message: 'You\'ve requested too many verification codes. Please wait 5-10 minutes before trying again.\n\nFor testing, you can use a different phone number.'
    };
  }

  if (isExpired) {
    return {
      title: 'Code Expired',
      message: 'Your verification code has expired. Please request a new code using the "Resend OTP" button.'
    };
  }

  if (isInvalidCode) {
    return {
      title: 'Invalid Code',
      message: 'The code you entered is incorrect. Please check the 6-digit code and try again.\n\nMake sure you\'re entering the code from your latest SMS message.'
    };
  }

  if (isInvalidPhone) {
    return {
      title: 'Invalid Phone Number',
      message: 'The phone number format is incorrect. Please check:\n\n• Country code is included (e.g., +65 for Singapore)\n• Phone number is correct\n• No extra spaces or characters'
    };
  }

  if (isNetworkError) {
    return {
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection and try again.'
    };
  }

  if (isRecaptchaRendered) {
    return {
      title: 'Verification Reset Required',
      message: 'Please refresh the page and try again. This helps reset the verification process.'
    };
  }

  // Generic fallback
  return {
    title: 'Something Went Wrong',
    message: 'We couldn\'t complete your request. Please try again in a moment.\n\nIf the problem continues, please contact support.'
  };
};

/**
 * Get user-friendly error message for OTP sending errors
 * @param {Error} error - Firebase error object
 * @returns {{title: string, message: string}} - User-friendly error title and message
 */
export const getUserFriendlySendOTPError = (error) => {
  const friendly = getUserFriendlyOTPError(error);
  
  // Customize title for sending OTP
  if (friendly.title === 'Something Went Wrong') {
    friendly.title = 'Failed to Send Code';
  }
  
  return friendly;
};

/**
 * Get user-friendly error message for OTP verification errors
 * @param {Error} error - Firebase error object
 * @returns {string} - User-friendly error message (for inline display)
 */
export const getUserFriendlyVerifyOTPError = (error) => {
  const friendly = getUserFriendlyOTPError(error);
  
  // For inline errors, return just the message
  return friendly.message.split('\n\n')[0]; // Return first paragraph for inline display
};

/**
 * Get user-friendly error message for resend OTP errors
 * @param {Error} error - Firebase error object
 * @returns {{title: string, message: string}} - User-friendly error title and message
 */
export const getUserFriendlyResendOTPError = (error) => {
  const friendly = getUserFriendlyOTPError(error);
  
  // Customize title for resending OTP
  if (friendly.title === 'Something Went Wrong') {
    friendly.title = 'Failed to Resend Code';
  }
  
  return friendly;
};

