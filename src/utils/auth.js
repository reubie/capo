/**
 * Authentication utility functions
 */

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Get the authentication token
 * @returns {string|null} The token or null if not authenticated
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Save authentication token
 * @param {string} token - The authentication token
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Remove authentication token (logout)
 */
export const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * Logout user and redirect to login page
 */
export const logout = () => {
  removeToken();
  window.location.href = '/login';
};


