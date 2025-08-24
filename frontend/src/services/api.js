import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';


// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // This is crucial for CORS with credentials
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  });

// Add auth token to requests
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

// Handle response errors
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

// Auth API calls
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const logout = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');

// Transaction API calls
export const getTransactions = (params) => api.get('/transactions', { params });
export const createTransaction = (transactionData) => api.post('/transactions', transactionData);
export const updateTransaction = (id, transactionData) => api.put(`/transactions/${id}`, transactionData);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
export const getTransactionById = (id) => api.get(`/transactions/${id}`);
export const getTransactionSummary = (params) => api.get('/transactions/summary', { params });
export const getChartData = (params) => api.get('/transactions/charts', { params });
export const getCategories = () => api.get('/transactions/categories');

// Receipt API calls
export const uploadReceipt = (formData) => {
  return api.post('/receipts/upload-receipt', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const extractFromPDF = (formData) => {
  return api.post('/receipts/pdf-extract', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getUploadHistory = (params) => api.get('/receipts/history', { params });

// Insights API calls
export const getInsights = () => {
  return api.get('/insights');
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactionSummary,
  getChartData,
  getCategories,
  uploadReceipt,
  extractFromPDF,
  getUploadHistory,
  getInsights
};