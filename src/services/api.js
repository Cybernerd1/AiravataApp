import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sih-saksham.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        const refreshResponse = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
          withCredentials: true
        });
        const newToken = refreshResponse.data.accessToken;
        await AsyncStorage.setItem('authToken', newToken);
        
        // Retry the original request
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios(error.config);
      } catch (refreshError) {
        // Refresh failed, logout user
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION APIs
// ============================================

export const authAPI = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  
  register: (name, email, password, role = 'user') =>
    api.post('/api/auth/register', { name, email, password, role }),
  
  logout: () =>
    api.post('/api/auth/logout'),
  
  getProfile: () =>
    api.get('/api/auth/me'),
  
  refreshToken: () =>
    api.post('/api/auth/refresh'),
};

// ============================================
// USER MANAGEMENT APIs (Admin only)
// ============================================

export const userAPI = {
  getAll: () =>
    api.get('/api/users'),
  
  getByRole: (role) =>
    api.get(`/api/users/role/${role}`),
  
  getById: (id) =>
    api.get(`/api/users/${id}`),
  
  update: (id, data) =>
    api.put(`/api/users/${id}`, data),
  
  delete: (id) =>
    api.delete(`/api/users/${id}`),
  
  search: (query, role = null) =>
    api.get('/api/users/search', { params: { query, role } }),
};

// ============================================
// DEVICE MANAGEMENT APIs
// ============================================

export const deviceAPI = {
  getAll: () =>
    api.get('/api/devices'),
  
  getById: (id) =>
    api.get(`/api/devices/${id}`),
  
  create: (data) =>
    api.post('/api/devices/create', data),
  
  update: (id, data) =>
    api.put(`/api/devices/${id}`, data),
  
  delete: (id) =>
    api.delete(`/api/devices/${id}`),
};

// ============================================
// EVENT/DETECTION APIs
// ============================================

export const eventAPI = {
  getAll: () =>
    api.get('/api/events'),
  
  getLatest: (deviceId) =>
    api.get(`/api/events/latest/${deviceId}`),
  
  getHistory: (deviceId) =>
    api.get(`/api/events/history/${deviceId}`),
  
  receive: (data) =>
    api.post('/api/events/receive', data),
};

// ============================================
// HOTSPOT MANAGEMENT APIs
// ============================================

export const hotspotAPI = {
  getAll: (params = {}) =>
    api.get('/api/hotspots', { params }),
  
  getById: (id) =>
    api.get(`/api/hotspots/${id}`),
  
  create: (data) =>
    api.post('/api/hotspots', data),
  
  update: (id, data) =>
    api.put(`/api/hotspots/${id}`, data),
  
  delete: (id) =>
    api.delete(`/api/hotspots/${id}`),
  
  getNearby: (latitude, longitude, radiusKm = 10) =>
    api.get('/api/hotspots', {
      params: {
        near_lat: latitude,
        near_lng: longitude,
        radius_km: radiusKm
      }
    }),
};

// ============================================
// NOTIFICATION APIs
// ============================================

export const notificationAPI = {
  registerToken: (fcmToken, deviceType = 'mobile') =>
    api.post('/api/notifications/register-token', { fcm_token: fcmToken, device_type: deviceType }),
  
  sendToAll: (title, body, data = {}) =>
    api.post('/api/notifications/send-all', { title, body, data }),
  
  getMy: (limit = 50, offset = 0) =>
    api.get('/api/notifications/my', { params: { limit, offset } }),
  
  markAsRead: (id) =>
    api.put(`/api/notifications/${id}/read`),
};

export default api;
