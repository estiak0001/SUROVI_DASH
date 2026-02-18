import axios from 'axios';

// API URL - /surovidash/api for production
const API_BASE_URL = '/surovidash/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// File Upload
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Dashboard Summary
export const getDashboardSummary = async (month = 11, year = 2025) => {
  const response = await api.get(`/dashboard-summary?month=${month}&year=${year}`);
  return response.data;
};

// Regions
export const getRegions = async () => {
  const response = await api.get('/regions');
  return response.data;
};

// Sales
export const getSales = async (month, year) => {
  let url = '/sales';
  const params = [];
  if (month) params.push(`month=${month}`);
  if (year) params.push(`year=${year}`);
  if (params.length > 0) url += '?' + params.join('&');
  
  const response = await api.get(url);
  return response.data;
};

// Collections
export const getCollections = async (month, year) => {
  let url = '/collections';
  const params = [];
  if (month) params.push(`month=${month}`);
  if (year) params.push(`year=${year}`);
  if (params.length > 0) url += '?' + params.join('&');
  
  const response = await api.get(url);
  return response.data;
};

// Products
export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

// Product Comparison
export const getProductComparison = async () => {
  const response = await api.get('/product-comparison');
  return response.data;
};

// Analytics - Sales by Zone
export const getSalesByZone = async (month, year) => {
  let url = '/analytics/sales-by-zone';
  const params = [];
  if (month) params.push(`month=${month}`);
  if (year) params.push(`year=${year}`);
  if (params.length > 0) url += '?' + params.join('&');
  
  const response = await api.get(url);
  return response.data;
};

// Analytics - Top Products
export const getTopProducts = async (limit = 10) => {
  const response = await api.get(`/analytics/top-products?limit=${limit}`);
  return response.data;
};

// Time Periods
export const getTimePeriods = async () => {
  const response = await api.get('/time-periods');
  return response.data;
};

export default api;
