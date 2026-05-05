import axios from 'axios';

const API_VERSION = process.env.REACT_APP_API_VERSION || 'v1';
const baseURL = process.env.REACT_APP_API_URL || '';

const http = axios.create({
  baseURL: baseURL || undefined,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('baz_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Bazario marketplace API client.
 * Endpoints align with Express + MongoDB Atlas backend (see ../backend).
 */
class BackendService {
  /* -------- Auth -------- */
  login = (body) => http.post(`/api/${API_VERSION}/auth/login`, body);

  register = (body) => http.post(`/api/${API_VERSION}/auth/register`, body);

  googleAuth = (body) => http.post(`/api/${API_VERSION}/auth/google`, body);

  logout = () => http.post(`/api/${API_VERSION}/auth/logout`);

  requestPasswordResetOtp = (body) => http.post(`/api/${API_VERSION}/auth/password-reset/request`, body);

  confirmPasswordReset = (body) => http.post(`/api/${API_VERSION}/auth/password-reset/confirm`, body);

  /* -------- Catalog -------- */
  getProducts = (params) => http.get(`/api/${API_VERSION}/products`, { params });

  getProduct = (id) => http.get(`/api/${API_VERSION}/products/${id}`);

  searchProducts = (q, params) =>
    http.get(`/api/${API_VERSION}/products/search`, { params: { q, ...params } });

  getCategories = () => http.get(`/api/${API_VERSION}/categories`);

  /* -------- Cart (server-side mirror, optional) -------- */
  getCart = () => http.get(`/api/${API_VERSION}/cart`);

  syncCart = (body) => http.put(`/api/${API_VERSION}/cart`, body);

  /* -------- Orders -------- */
  createOrder = (body) => http.post(`/api/${API_VERSION}/orders`, body);

  getOrders = () => http.get(`/api/${API_VERSION}/orders`);

  getOrder = (id) => http.get(`/api/${API_VERSION}/orders/${id}`);

  updateOrderStatus = (id, body) => http.patch(`/api/${API_VERSION}/orders/${id}/status`, body);

  /* -------- Checkout helpers -------- */
  validateCoupon = (code) => http.post(`/api/${API_VERSION}/coupons/validate`, { code });

  processDummyPayment = (body) => http.post(`/api/${API_VERSION}/payments/dummy`, body);
}

export default BackendService;
