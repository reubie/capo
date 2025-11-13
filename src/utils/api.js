import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions (ready for backend integration)
export const authAPI = {
  login: (phone, otp) => api.post('/auth/login', { phone, otp }),
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

