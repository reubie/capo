import axios from 'axios';
import { getToken, removeToken } from './auth';

// Default to Spring Boot backend port (usually 8080)
// Note: Remove /api if your backend doesn't use it as a prefix
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - remove token and redirect to login
      // Skip redirect if on gifticon or network page (allows UI testing without auth)
      const isGifticonPage = window.location.pathname === '/gifticon';
      const isNetworkPage = window.location.pathname === '/network';
      removeToken();
      if (!isGifticonPage && !isNetworkPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions (ready for backend integration)
export const authAPI = {
  // Signup endpoint matching backend: POST /user/signup
  signup: (data) => api.post('/user/signup', data), // { email, password, name }
  // Login endpoint matching backend: POST /user/login
  login: (data) => api.post('/user/login', data), // { email, password }
  register: (data) => api.post('/auth/register', data),
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  uploadBusinessCard: (formData) => api.post('/auth/register-with-card', formData),
};

export const gifticonAPI = {
  getProducts: () => api.get('/gifticon/products'),
  purchase: (productId) => api.post('/gifticon/purchase', { productId }),
  getPurchaseHistory: () => api.get('/gifticon/history'),
};

export const networkAPI = {
  getCards: (params) => api.get('/network/cards', { params }),
  addCard: (formData) => api.post('/network/cards', formData),
  deleteCard: (cardId) => api.delete(`/network/cards/${cardId}`),
};

