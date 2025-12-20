/**
 * Authentication utility functions (Web)
 * -------------------------------------
 * Token presence is checked locally.
 * Token validity is enforced by backend (403).
 */

const TOKEN_KEY = 'token';

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
  }
};

/**
 * Remove authentication token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
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
 * Clears token and redirects to login
 */
export const logout = () => {
  removeToken();
  window.location.href = '/login';
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
