// Firebase Authentication Helper Functions
import { 
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';
import { auth } from '../config/firebase';

let recaptchaVerifier = null;
let confirmationResult = null;

/**
 * Initialize reCAPTCHA verifier for phone authentication
 * @param {string} recaptchaContainerId - HTML element ID for reCAPTCHA container
 * @returns {RecaptchaVerifier} - The reCAPTCHA verifier instance
 */
export const initializeRecaptcha = (recaptchaContainerId = 'recaptcha-container') => {
  // Clear existing verifier if any
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }

  // Create new reCAPTCHA verifier
  // Using invisible reCAPTCHA v3 for better UX
  recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
    size: 'invisible', // Invisible reCAPTCHA - no checkbox shown
    callback: (response) => {
      // reCAPTCHA solved - will be called automatically
      console.log('✅ reCAPTCHA verified');
    },
    'expired-callback': () => {
      // Response expired - ask user to verify again
      console.warn('⚠️ reCAPTCHA expired');
      recaptchaVerifier.render().catch(err => {
        console.error('Error rendering reCAPTCHA:', err);
      });
    },
    'error-callback': (error) => {
      // Error occurred during verification
      console.error('❌ reCAPTCHA error:', error);
    }
  });

  // Render the reCAPTCHA widget (invisible)
  recaptchaVerifier.render().catch(err => {
    console.error('Error rendering reCAPTCHA:', err);
    throw new Error('Failed to initialize reCAPTCHA. Please refresh the page and try again.');
  });

  return recaptchaVerifier;
};

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +6512345678)
 * @param {string} recaptchaContainerId - HTML element ID for reCAPTCHA container
 * @returns {Promise<ConfirmationResult>} - Confirmation result containing confirm method
 */
export const sendOTP = async (phoneNumber, recaptchaContainerId = 'recaptcha-container') => {
  try {
    // Ensure phone number is in E.164 format (starts with +)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    // Initialize reCAPTCHA if not already done
    if (!recaptchaVerifier) {
      initializeRecaptcha(recaptchaContainerId);
    }

    // Send OTP via Firebase
    console.log('📤 Sending OTP to:', formattedPhone);
    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);

    console.log('✅ OTP sent successfully');
    return confirmationResult;
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format. Please check your phone number and country code, then try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many verification attempts. Please wait a few minutes before trying again.');
    } else if (error.code === 'auth/quota-exceeded') {
      throw new Error('SMS quota exceeded. Please contact support or try again later.');
    } else if (error.code === 'auth/captcha-check-failed') {
      throw new Error('Security verification failed. Please refresh the page and try again.');
    } else if (error.code === 'auth/billing-not-enabled') {
      // User-friendly error message - technical details should be logged only
      console.error('Firebase billing not enabled. Please enable billing in Firebase Console.');
      throw new Error('BILLING_REQUIRED: Service temporarily unavailable. Please contact support.');
    } else if (error.code === 'auth/invalid-app-credential') {
      throw new Error('Invalid app configuration. Please check your Firebase configuration and try again.');
    } else if (error.code === 'auth/app-not-authorized') {
      throw new Error('This app is not authorized to use Firebase Phone Authentication. Please check your Firebase project settings.');
    } else {
      // Generic error handling
      const errorMessage = error.message || 'Failed to send OTP. Please check your connection and try again.';
      throw new Error(errorMessage);
    }
  }
};

/**
 * Verify OTP code
 * @param {string} otpCode - 6-digit OTP code entered by user
 * @returns {Promise<UserCredential>} - User credential with ID token
 */
export const verifyOTP = async (otpCode) => {
  try {
    if (!confirmationResult) {
      throw new Error('No OTP verification session found. Please request a new OTP.');
    }

    if (!otpCode || otpCode.length !== 6) {
      throw new Error('Invalid OTP code. Please enter a 6-digit code.');
    }

    console.log('🔐 Verifying OTP code...');
    const userCredential = await confirmationResult.confirm(otpCode);

    console.log('✅ OTP verified successfully');
    
    // Get ID token for backend authentication
    const idToken = await userCredential.user.getIdToken();
    console.log('✅ ID token obtained for backend authentication');

    return {
      userCredential,
      idToken,
      user: userCredential.user,
      phoneNumber: userCredential.user.phoneNumber
    };
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid OTP code. Please check and try again.');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('OTP code has expired. Please request a new OTP.');
    } else if (error.code === 'auth/session-expired') {
      throw new Error('OTP session expired. Please request a new OTP.');
    } else {
      throw new Error(error.message || 'Failed to verify OTP. Please try again.');
    }
  }
};

/**
 * Resend OTP (requires new reCAPTCHA verification)
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} recaptchaContainerId - HTML element ID for reCAPTCHA container
 * @returns {Promise<ConfirmationResult>} - New confirmation result
 */
export const resendOTP = async (phoneNumber, recaptchaContainerId = 'recaptcha-container') => {
  try {
    // Clear existing verifier to force new reCAPTCHA
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }

    // Send new OTP
    return await sendOTP(phoneNumber, recaptchaContainerId);
  } catch (error) {
    console.error('❌ Error resending OTP:', error);
    throw error;
  }
};

/**
 * Clear reCAPTCHA verifier (cleanup)
 */
export const clearRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  confirmationResult = null;
};

/**
 * Get current confirmation result (if any)
 * @returns {ConfirmationResult|null} - Current confirmation result
 */
export const getConfirmationResult = () => {
  return confirmationResult;
};

/**
 * Reset confirmation result (when starting new verification)
 */
export const resetConfirmationResult = () => {
  confirmationResult = null;
};

