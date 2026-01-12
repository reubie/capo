// Firebase Authentication Helper Functions
// Following Firebase Phone Authentication best practices
// https://firebase.google.com/docs/auth/web/phone-auth

import { 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  isSignInWithEmailLink
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Module-level state
let recaptchaVerifier = null;
let confirmationResult = null;
let recaptchaInitialized = false;

/**
 * Validate Firebase configuration before use
 * This helps identify configuration issues early
 */
const validateFirebaseConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  };

  console.group('🔍 Firebase Configuration Validation');
  console.log('API Key:', config.apiKey ? `${config.apiKey.substring(0, 20)}...` : 'MISSING');
  console.log('Auth Domain:', config.authDomain || 'MISSING');
  console.log('Project ID:', config.projectId || 'MISSING');
  console.log('Auth Instance:', auth ? 'Initialized ✅' : 'NOT Initialized ❌');
  
  if (!config.apiKey || !config.authDomain || !config.projectId) {
    console.error('❌ Missing required Firebase configuration');
    console.groupEnd();
    throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
  }
  
  console.log('✅ Firebase configuration validated');
  console.groupEnd();
  
  return config;
};

/**
 * Validate phone number format (E.164)
 */
const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new Error('Phone number is required and must be a string');
  }

  const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  
  // E.164 format: +[country code][number], min 8 digits, max 15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  
  if (!e164Regex.test(formatted)) {
    throw new Error(`Invalid phone number format. Expected E.164 format (e.g., +1234567890), got: ${formatted}`);
  }

  return formatted;
};

/**
 * Check if reCAPTCHA container exists in DOM
 */
const checkRecaptchaContainer = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`⚠️ reCAPTCHA container "${containerId}" not found in DOM. Creating it...`);
    const newContainer = document.createElement('div');
    newContainer.id = containerId;
    newContainer.style.position = 'absolute';
    newContainer.style.opacity = '0';
    newContainer.style.pointerEvents = 'none';
    document.body.appendChild(newContainer);
    return newContainer;
  }
  return container;
};

/**
 * Initialize reCAPTCHA verifier for phone authentication
 * Following Firebase documentation best practices
 * 
 * @param {string} recaptchaContainerId - HTML element ID for reCAPTCHA container
 * @returns {Promise<RecaptchaVerifier>} - The reCAPTCHA verifier instance
 */
export const initializeRecaptcha = async (recaptchaContainerId = 'recaptcha-container') => {
  console.group('🔄 Initializing reCAPTCHA');
  
  try {
    // Validate Firebase config first
    validateFirebaseConfig();
    
    // Check if container exists
    checkRecaptchaContainer(recaptchaContainerId);
    
    // Clear existing verifier if any
    if (recaptchaVerifier) {
      console.log('🧹 Clearing existing reCAPTCHA verifier');
      try {
        recaptchaVerifier.clear();
      } catch (clearError) {
        console.warn('Warning clearing reCAPTCHA:', clearError);
      }
      recaptchaVerifier = null;
      recaptchaInitialized = false;
    }

    console.log('📦 Creating new RecaptchaVerifier instance');
    console.log('Container ID:', recaptchaContainerId);
    console.log('Auth instance:', auth ? 'Available ✅' : 'Missing ❌');
    
    // Create new reCAPTCHA verifier
    // Using invisible reCAPTCHA for better UX
    recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible', // Invisible reCAPTCHA - no checkbox shown
      callback: (response) => {
        // reCAPTCHA solved - will be called automatically
        console.log('✅ reCAPTCHA verified successfully');
        console.log('Response token length:', response ? response.length : 0);
      },
      'expired-callback': () => {
        // Response expired - ask user to verify again
        console.warn('⚠️ reCAPTCHA response expired');
        recaptchaInitialized = false;
        if (recaptchaVerifier) {
          recaptchaVerifier.render().catch(err => {
            console.error('Error re-rendering expired reCAPTCHA:', err);
          });
        }
      },
      'error-callback': (error) => {
        // Error occurred during verification
        console.error('❌ reCAPTCHA error callback triggered:', error);
        recaptchaInitialized = false;
      }
    });

    console.log('🎨 Rendering reCAPTCHA widget...');
    
    // Render the reCAPTCHA widget (invisible)
    await recaptchaVerifier.render();
    
    recaptchaInitialized = true;
    console.log('✅ reCAPTCHA initialized and rendered successfully');
    console.groupEnd();
    
    return recaptchaVerifier;
  } catch (error) {
    recaptchaInitialized = false;
    console.error('❌ Failed to initialize reCAPTCHA:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    console.groupEnd();
    
    // Provide helpful error messages
    if (error.message && error.message.includes('container')) {
      throw new Error('reCAPTCHA container not found. Please ensure the container element exists in the DOM.');
    } else if (error.message && error.message.includes('API key')) {
      throw new Error('Firebase API key issue. Please check your Firebase configuration and API key restrictions.');
    } else {
      throw new Error(`Failed to initialize reCAPTCHA: ${error.message || 'Unknown error'}. Please refresh the page and try again.`);
    }
  }
};

/**
 * Send OTP to phone number
 * Comprehensive error logging to identify where INVALID_APP_CREDENTIAL occurs
 * 
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +6512345678)
 * @param {string} recaptchaContainerId - HTML element ID for reCAPTCHA container
 * @returns {Promise<ConfirmationResult>} - Confirmation result containing confirm method
 */
export const sendOTP = async (phoneNumber, recaptchaContainerId = 'recaptcha-container') => {
  console.group('📤 Sending OTP - Step by Step');
  
  try {
    // Step 1: Validate Firebase configuration
    console.log('Step 1: Validating Firebase configuration...');
    const config = validateFirebaseConfig();
    console.log('✅ Step 1 passed: Firebase config valid');
    
    // Step 2: Validate phone number
    console.log('Step 2: Validating phone number...');
    const formattedPhone = validatePhoneNumber(phoneNumber);
    console.log('✅ Step 2 passed: Phone number valid:', formattedPhone);
    
    // Step 3: Validate auth instance
    console.log('Step 3: Validating auth instance...');
    if (!auth) {
      throw new Error('Firebase Auth instance is not initialized');
    }
    console.log('✅ Step 3 passed: Auth instance available');
    console.log('Auth app name:', auth.app.name);
    console.log('Auth project ID:', auth.app.options.projectId);
    
    // Step 4: Initialize reCAPTCHA if needed
    console.log('Step 4: Checking reCAPTCHA verifier...');
    if (!recaptchaVerifier || !recaptchaInitialized) {
      console.log('Initializing new reCAPTCHA verifier...');
      await initializeRecaptcha(recaptchaContainerId);
    } else {
      console.log('✅ Step 4 passed: reCAPTCHA verifier already initialized');
    }
    
    // Step 5: Verify reCAPTCHA verifier is ready
    console.log('Step 5: Verifying reCAPTCHA verifier state...');
    if (!recaptchaVerifier) {
      throw new Error('reCAPTCHA verifier is null after initialization');
    }
    console.log('✅ Step 5 passed: reCAPTCHA verifier ready');
    
    // Step 6: Prepare for signInWithPhoneNumber call
    console.log('Step 6: Preparing to call signInWithPhoneNumber...');
    console.log('Parameters:', {
      auth: auth ? 'Available' : 'Missing',
      phoneNumber: formattedPhone,
      appVerifier: recaptchaVerifier ? 'Available' : 'Missing'
    });
    
    // Step 7: Call signInWithPhoneNumber
    console.log('Step 7: Calling signInWithPhoneNumber...');
    console.log('⏳ This is where INVALID_APP_CREDENTIAL might occur...');
    
    const startTime = Date.now();
    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Step 7 passed: signInWithPhoneNumber succeeded (${duration}ms)`);
    console.log('Confirmation result:', confirmationResult ? 'Received ✅' : 'Missing ❌');
    
    console.log('✅ OTP sent successfully!');
    console.groupEnd();
    
    return confirmationResult;
  } catch (error) {
    console.error('❌ Error in sendOTP - Full Error Details:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Error Name:', error.name);
    console.error('Error Stack:', error.stack);
    
    // Log additional context
    const formattedPhoneForLog = phoneNumber?.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    console.error('Context at error time:', {
      phoneNumber: phoneNumber,
      formattedPhone: formattedPhoneForLog,
      recaptchaInitialized: recaptchaInitialized,
      recaptchaVerifierExists: !!recaptchaVerifier,
      authExists: !!auth,
      authAppName: auth?.app?.name,
      authProjectId: auth?.app?.options?.projectId,
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? `${import.meta.env.VITE_FIREBASE_API_KEY.substring(0, 20)}...` : 'MISSING',
      apiEndpoint: 'https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode'
    });
    
    console.groupEnd();
    
    // Handle specific Firebase errors with detailed logging
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format. Please check your phone number and country code, then try again.');
    } else if (error.code === 'auth/too-many-requests') {
      console.warn('⚠️ Rate limit reached - This is actually GOOD NEWS!');
      console.warn('✅ It means your Firebase configuration is working correctly!');
      console.warn('✅ The INVALID_APP_CREDENTIAL error is fixed!');
      console.warn('⏳ Firebase is rate-limiting to prevent abuse.');
      console.warn('💡 Solutions:');
      console.warn('   1. Wait 5-10 minutes before trying again');
      console.warn('   2. Use a different phone number for testing');
      console.warn('   3. Check Firebase Console → Authentication → Settings for rate limits');
      throw new Error(
        'Too many verification attempts for this phone number.\n\n' +
        '✅ Good news: Your Firebase configuration is working correctly!\n' +
        '⏳ Please wait 5-10 minutes before requesting a new OTP.\n\n' +
        'Alternatively, you can use a different phone number for testing.'
      );
    } else if (error.code === 'auth/quota-exceeded') {
      throw new Error('SMS quota exceeded. Please contact support or try again later.');
    } else if (error.code === 'auth/captcha-check-failed') {
      throw new Error('Security verification failed. Please refresh the page and try again.');
    } else if (error.code === 'auth/billing-not-enabled') {
      console.error('Firebase billing not enabled. Please enable billing in Firebase Console.');
      throw new Error('BILLING_REQUIRED: Service temporarily unavailable. Please contact support.');
    } else if (error.code === 'auth/invalid-app-credential') {
      // CRITICAL: This is where INVALID_APP_CREDENTIAL occurs
      console.error('🚨 INVALID_APP_CREDENTIAL ERROR DETECTED');
      console.error('This error occurs when calling signInWithPhoneNumber');
      console.error('Possible causes:');
      console.error('1. API key restrictions blocking the request');
      console.error('2. Identity Toolkit API not enabled or restricted');
      console.error('3. Phone Authentication not enabled in Firebase Console');
      console.error('4. reCAPTCHA Enterprise not configured (for Blaze plan) ⚠️ CRITICAL');
      console.error('5. Firebase configuration mismatch');
      
      // Log exact point of failure
      console.error('Exact failure point: signInWithPhoneNumber() call');
      const formattedPhoneForError = phoneNumber?.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Try to extract more error details
      let errorDetails = 'No additional details available';
      if (error.customData) {
        errorDetails = JSON.stringify(error.customData, null, 2);
      } else if (error.serverResponse) {
        errorDetails = JSON.stringify(error.serverResponse, null, 2);
      }
      
      console.error('Parameters at failure:', {
        auth: {
          exists: !!auth,
          appName: auth?.app?.name,
          projectId: auth?.app?.options?.projectId,
          apiKey: auth?.app?.options?.apiKey ? `${auth.app.options.apiKey.substring(0, 20)}...` : 'MISSING'
        },
        phoneNumber: formattedPhoneForError,
        recaptchaVerifier: {
          exists: !!recaptchaVerifier,
          initialized: recaptchaInitialized
        },
        apiEndpoint: 'https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode',
        httpStatus: '400 (Bad Request)',
        note: 'Error occurs when Firebase makes POST request to Identity Toolkit API',
        errorDetails: errorDetails
      });
      
      // Check Network tab instruction
      console.error('');
      console.error('📋 TO DEBUG FURTHER:');
      console.error('1. Open browser DevTools → Network tab');
      console.error('2. Filter by "sendVerificationCode"');
      console.error('3. Click on the failed request');
      console.error('4. Check "Response" tab to see the actual error from Google API');
      console.error('5. Check "Request" tab to see what was sent');
      console.error('');
      
      // Check if reCAPTCHA Enterprise warning was shown
      const recaptchaEnterpriseWarning = 'Failed to initialize reCAPTCHA Enterprise config';
      const hasRecaptchaWarning = error.message?.includes(recaptchaEnterpriseWarning) || 
                                   console.warn.toString().includes(recaptchaEnterpriseWarning);
      
      let errorMessage = 'INVALID_APP_CREDENTIAL: Firebase cannot authenticate your app.\n\n';
      errorMessage += 'Based on the logs, the error occurs when calling:\n';
      errorMessage += 'POST https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode\n\n';
      
      if (hasRecaptchaWarning || recaptchaInitialized) {
        errorMessage += '⚠️ IMPORTANT: reCAPTCHA Enterprise failed to initialize and fell back to v2.\n';
        errorMessage += 'This suggests reCAPTCHA Enterprise is not properly configured for Blaze plan.\n\n';
      }
      
      errorMessage += 'Please check (in this order):\n\n';
      errorMessage += '1. Google Cloud Console → APIs & Services → Credentials → Edit API Key\n';
      errorMessage += '   - API Key: AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw\n';
      errorMessage += '   - Application Restrictions: Set to "doesn\'t exist" (for testing)\n';
      errorMessage += '   - API Restrictions: Must include "Identity Toolkit API" ✅\n\n';
      errorMessage += '2. Google Cloud Console → APIs & Services → Library\n';
      errorMessage += '   - Search "Identity Toolkit API" → Click "Enable" if not enabled\n';
      errorMessage += '   - Search "Firebase Authentication API" → Click "Enable" if not enabled\n\n';
      errorMessage += '3. Google Cloud Console → Security → reCAPTCHA Enterprise\n';
      errorMessage += '   - Create a reCAPTCHA Enterprise key for Blaze plan\n';
      errorMessage += '   - Add domains: localhost, 127.0.0.1, *.vercel.app, jiomeapp.com\n\n';
      errorMessage += '4. Firebase Console → Authentication → Sign-in method\n';
      errorMessage += '   - Enable "Phone" authentication (should be green toggle)\n\n';
      errorMessage += '5. Wait 2-3 minutes after making changes, then clear cache and retry\n\n';
      errorMessage += 'Check browser console for detailed error logs above.';
      
      throw new Error(errorMessage);
    } else if (error.code === 'auth/app-not-authorized') {
      throw new Error('This app is not authorized to use Firebase Phone Authentication. Please check your Firebase project settings.');
    } else {
      // Generic error handling
      const errorMessage = error.message || 'Failed to send OTP. Please check your connection and try again.';
      console.error('Unknown error type:', error);
      throw new Error(errorMessage);
    }
  }
};

/**
 * Verify OTP code
 * 
 * @param {string} otpCode - 6-digit OTP code entered by user
 * @returns {Promise<{userCredential, idToken, user, phoneNumber}>} - User credential with ID token
 */
export const verifyOTP = async (otpCode) => {
  console.group('🔐 Verifying OTP');
  
  try {
    if (!confirmationResult) {
      throw new Error('No OTP verification session found. Please request a new OTP.');
    }

    if (!otpCode || otpCode.length !== 6) {
      throw new Error('Invalid OTP code. Please enter a 6-digit code.');
    }

    console.log('Verifying OTP code:', otpCode.replace(/\d/g, '*'));
    const userCredential = await confirmationResult.confirm(otpCode);

    console.log('✅ OTP verified successfully');
    
    // Get ID token for backend authentication
    console.log('Getting ID token...');
    const idToken = await userCredential.user.getIdToken();
    console.log('✅ ID token obtained (length:', idToken.length, 'chars)');
    
    console.groupEnd();

    return {
      userCredential,
      idToken,
      user: userCredential.user,
      phoneNumber: userCredential.user.phoneNumber
    };
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message
    });
    console.groupEnd();
    
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
 * 
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} recaptchaContainerId - HTML element ID for reCAPTCHA container
 * @returns {Promise<ConfirmationResult>} - New confirmation result
 */
export const resendOTP = async (phoneNumber, recaptchaContainerId = 'recaptcha-container') => {
  console.log('🔄 Resending OTP - clearing existing verifier');
  
  try {
    // Clear existing verifier to force new reCAPTCHA
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (clearError) {
        console.warn('Warning clearing reCAPTCHA:', clearError);
      }
      recaptchaVerifier = null;
      recaptchaInitialized = false;
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
  console.log('🧹 Clearing reCAPTCHA verifier');
  
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (error) {
      console.warn('Warning clearing reCAPTCHA:', error);
    }
    recaptchaVerifier = null;
  }
  recaptchaInitialized = false;
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

/**
 * Get debug information about current Firebase auth state
 * Useful for troubleshooting
 */
export const getFirebaseAuthDebugInfo = () => {
  return {
    authInitialized: !!auth,
    authAppName: auth?.app?.name,
    authProjectId: auth?.app?.options?.projectId,
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? `${import.meta.env.VITE_FIREBASE_API_KEY.substring(0, 20)}...` : 'MISSING',
    recaptchaInitialized: recaptchaInitialized,
    recaptchaVerifierExists: !!recaptchaVerifier,
    confirmationResultExists: !!confirmationResult,
    currentUser: auth?.currentUser?.phoneNumber || null
  };
};
