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
  import.meta.env.VITE_API_BASE_URL || 'https://jiomeapp.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Separate axios instance for multipart/form-data requests
// Note: Don't set Content-Type header - let axios set it automatically with boundary
const apiMultipart = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Longer timeout for file uploads
});

/* =========================
   REQUEST INTERCEPTOR (for JSON API)
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
   REQUEST INTERCEPTOR (for Multipart API)
========================= */
apiMultipart.interceptors.request.use(
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
   RESPONSE INTERCEPTOR (for JSON API)
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
   RESPONSE INTERCEPTOR (for Multipart API)
   403 = SESSION DEAD
========================= */
apiMultipart.interceptors.response.use(
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

  /** Request permanent deletion of the current user account and associated data. Requires auth. */
  deleteAccount: () =>
    api.delete('/api/user/account', {
      meta: { loadingText: 'Deleting account...' },
    }),
};

/* =========================
   BUSINESS CARD APIs
========================= */
export const cardAPI = {
  registerBusinessCard: (formData) => {
    // Debug: Log FormData before sending
    console.log('📤 Sending FormData to API:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        const str = String(value);
        console.log(`  ${key}:`, str.length > 200 ? str.substring(0, 200) + '...' : str);
      }
    }
    
    return apiMultipart.post('/api/card/register', formData, {
      meta: { loadingText: 'Registering business card...' },
    });
  },

  registerMyBusinessCard: (formData) => {
    // Debug: Log FormData before sending
    console.log('📤 Sending FormData to My Card API:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        const str = String(value);
        console.log(`  ${key}:`, str.length > 200 ? str.substring(0, 200) + '...' : str);
      }
    }
    
    return apiMultipart.post('/api/card/my-card-register', formData, {
      meta: { loadingText: 'Registering your business card...' },
    });
  },

  getCards: () =>
    api.get('/api/card/list', {
      meta: { loadingText: 'Fetching cards...' },
    }),

  getMyProfile: () =>
    api.get('/api/user/my-profile', {
      meta: { loadingText: 'Fetching your profile...' },
    }),

  deleteCard: (id) =>
    api.delete(`/api/card/${id}`, {
      meta: { loadingText: 'Deleting card...' },
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
  deleteCard: (id) => cardAPI.deleteCard(id),
};

export default api;
