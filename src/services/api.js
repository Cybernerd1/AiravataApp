import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sih-saksham.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  
  register: (name, email, password) =>
    api.post('/api/auth/register', { name, email, password }),
  
  logout: () =>
    api.post('/api/auth/logout'),
};

export const elephantAPI = {
  getAll: () =>
    api.get('/api/elephants'),
  
  getById: (id) =>
    api.get(`/api/elephants/${id}`),
  
  create: (data) =>
    api.post('/api/elephants', data),
  
  update: (id, data) =>
    api.put(`/api/elephants/${id}`, data),
  
  delete: (id) =>
    api.delete(`/api/elephants/${id}`),
};

export const sightingAPI = {
  getAll: () =>
    api.get('/api/sightings'),
  
  getById: (id) =>
    api.get(`/api/sightings/${id}`),
  
  create: (data) =>
    api.post('/api/sightings', data),
  
  update: (id, data) =>
    api.put(`/api/sightings/${id}`, data),
  
  delete: (id) =>
    api.delete(`/api/sightings/${id}`),
};

export const alertAPI = {
  getAll: () =>
    api.get('/api/alerts'),
  
  getById: (id) =>
    api.get(`/api/alerts/${id}`),
  
  create: (data) =>
    api.post('/api/alerts', data),
  
  acknowledge: (id) =>
    api.put(`/api/alerts/${id}/acknowledge`),
};

export default api;
