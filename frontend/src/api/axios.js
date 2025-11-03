import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Base URL without API version path
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the token in all requests
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add a response interceptor to handle common errors
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Handle 401 Unauthorized errors (token expired)
//     if (error.response && error.response.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// Auth API
export const authAPI = {
  login: (credentials) => {
    console.log("Sending credentials:", credentials); // ✅ valid here
    return api.post('/auth/', credentials);
  },
  register: (userData) => api.post('/auth/SignUp', userData),
};


// Products API
export const productsAPI = {
  getAll: () => api.get('/api/v1/products'),
  getById: (id) => api.get(`/api/v1/products/${id}`),
  create: (product) => api.post('/api/v1/products', product),
  update: (id, product) => api.put(`/api/v1/products/${id}`, product),
  delete: (id) => api.delete(`/api/v1/products/${id}`),
};

// Sales API
export const salesAPI = {
  getAll: () => api.get('/sales'),
  create: (sale) => api.post('/sales', sale),
};

// Dashboard API
export const dashboardAPI = {
  getLowStockAlert: (threshold) => api.get(`/dashboard/low-stock-alert?low_stock_threshold=${threshold}`),
  getExpiryAlert: () => api.get('/dashboard/expiry-alert'),
  getSalesOverTime: () => api.get('/dashboard/sales-over-time'),
  getTopSellingProducts: () => api.get('/dashboard/top-selling-products'),
  getStockLevels: () => api.get('/dashboard/stock-levels'),
  getSalesByProduct: () => api.get('/dashboard/sales-by-product'),
  getAllData: () => api.get('/dashboard/all'),
};

// Assistant API
export const assistantAPI = {
  askQuestion: (question) => api.post('/api/v1/ask-n8n', { question }),
};

export default api;