import axios from 'axios';
import { getToken, removeToken } from './auth';

/* =========================
   GLOBAL LOADING HANDLER
========================= */
let loadingHandler = null;

export const registerLoadingHandler = (handler) => {
  loadingHandler = handler;
};

/* =========================
   BASE CONFIG
========================= */
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://3.27.128.227:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (loadingHandler && config.meta?.loadingText) {
      loadingHandler.showLoading(config.meta.loadingText);
    }

    return config;
  },
  (error) => {
    loadingHandler?.hideLoading();
    return Promise.reject(error);
  }
);

/* =========================
   RESPONSE INTERCEPTOR
   403 = SESSION DEAD
========================= */
api.interceptors.response.use(
  (response) => {
    loadingHandler?.hideLoading();
    return response;
  },
  (error) => {
    loadingHandler?.hideLoading();

    if (error.response?.status === 403) {
      // 🔐 Kill session completely
      removeToken();

      // 🔁 Hard redirect ensures clean state
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

/* =========================
   AUTH APIs
========================= */
export const authAPI = {
  signup: (data) =>
    api.post('/api/user/signup', data, {
      meta: { loadingText: 'Creating your account...' },
    }),

  login: (data) =>
    api.post('/api/user/login', data, {
      meta: { loadingText: 'Signing you in...' },
    }),

  verifyOtp: (data) =>
    api.post('/api/user/verify-otp', data, {
      meta: { loadingText: 'Verifying OTP...' },
    }),
};

/* =========================
   BUSINESS CARD APIs
========================= */
export const cardAPI = {
  registerBusinessCard: (data) =>
    api.post('/api/card/register', data, {
      meta: { loadingText: 'Registering business card...' },
    }),

  getCards: () =>
    api.get('/api/card/list', {
      meta: { loadingText: 'Fetching cards...' },
    }),
};

/* =========================
   GIFTICON APIs
========================= */
export const gifticonAPI = {
  getAvailableGifts: () =>
    api.get('/api/gift/list', {
      meta: { loadingText: 'Loading gifts...' },
    }),

  purchaseGift: (giftTemplateId) =>
    api.post(
      '/api/gift/buy',
      { giftTemplateId },
      { meta: { loadingText: 'Processing purchase...' } }
    ),

  sendGift: (data) =>
    api.post('/api/gift/send', data, {
      meta: { loadingText: 'Sending gift...' },
    }),

  getPurchasedGifts: () =>
    api.get('/api/gift/my-list', {
      meta: { loadingText: 'Loading your purchased gifts...' },
    }),

  getPurchaseHistory: () =>
    api.get('/api/gifticon/history', {
      meta: { loadingText: 'Loading purchase history...' },
    }),
};

/* =========================
   NETWORK APIs
========================= */
export const networkAPI = {
  getCards: () => cardAPI.getCards(),
  addCard: (cardData) => cardAPI.registerBusinessCard(cardData),
};

export default api;
