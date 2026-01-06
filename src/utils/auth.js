/**
 * Authentication utility functions (Web)
 * -------------------------------------
 * Token presence is checked locally.
 * Token validity is enforced by backend (403).
 */

const TOKEN_KEY = 'token';
const USER_EMAIL_KEY = 'userEmail';
const JUST_LOGGED_OUT_KEY = 'just_logged_out'; // Session flag to track recent logout

/* =========================
   TOKEN HELPERS
========================= */

/**
 * Get authentication token
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Save authentication token
 * @param {string} token
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    // Dispatch custom event to notify components of auth state change
    // This allows Landing page to update immediately when user logs in
    window.dispatchEvent(new Event('auth-state-changed'));
  }
};

/**
 * Remove authentication token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  // Dispatch custom event to notify components of auth state change
  // This allows Landing page to update immediately when token is removed
  window.dispatchEvent(new Event('auth-state-changed'));
};

/**
 * Get user email from storage
 * @returns {string|null}
 */
export const getUserEmail = () => {
  return localStorage.getItem(USER_EMAIL_KEY);
};

/**
 * Save user email
 * @param {string} email
 */
export const setUserEmail = (email) => {
  if (email) {
    localStorage.setItem(USER_EMAIL_KEY, email);
  }
};

/* =========================
   AUTH STATE
========================= */

/**
 * Check if user is authenticated
 * NOTE: This only checks token presence.
 * Backend enforces validity via 403.
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return Boolean(getToken());
};

/* =========================
   LOGOUT / RESET
========================= */

/**
 * Logout user
 * Clears token and redirects to landing page
 * Note: Uses window.location.href for hard redirect to ensure clean state
 * Sets a session flag to indicate user just logged out (has an account)
 * Dispatches custom event to notify other components of auth state change
 */
export const logout = () => {
  removeToken(); // This already dispatches 'auth-state-changed' event
  // Set flag to indicate user just logged out (they have an account)
  // This helps smart navigation send them to Login instead of Register
  sessionStorage.setItem(JUST_LOGGED_OUT_KEY, 'true');
  
  window.location.href = '/';
};

/**
 * Check if user just logged out (has an account)
 * @returns {boolean}
 */
export const hasJustLoggedOut = () => {
  return sessionStorage.getItem(JUST_LOGGED_OUT_KEY) === 'true';
};

/**
 * Clear the "just logged out" flag
 * Should be called after user successfully logs in or navigates
 */
export const clearJustLoggedOutFlag = () => {
  sessionStorage.removeItem(JUST_LOGGED_OUT_KEY);
};

/**
 * Reset auth state completely
 * Useful before login attempts
 */
export const resetAuth = () => {
  removeToken();
};

/* =========================
   OPTIONAL JWT HELPERS
========================= */

/**
 * Decode JWT payload safely
 * @returns {object|null}
 */
export const getTokenPayload = () => {
  try {
    const token = getToken();
    if (!token) return null;

    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

/**
 * Get user role from token payload
 * @returns {string|null}
 */
export const getUserRole = () => {
  const payload = getTokenPayload();
  return payload?.role || null;
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token (optional, will get from storage if not provided)
 * @returns {boolean} - true if expired or invalid, false if valid
 */
export const isTokenExpired = (token = null) => {
  try {
    const tokenToCheck = token || getToken();
    if (!tokenToCheck) return true; // No token = expired

    const payload = getTokenPayload();
    if (!payload || !payload.exp) return true; // Invalid token or no expiration

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't decode, treat as expired for safety
  }
};

/**
 * Check if user has a valid (non-expired) token
 * @returns {boolean}
 */
export const hasValidToken = () => {
  return isAuthenticated() && !isTokenExpired();
};
