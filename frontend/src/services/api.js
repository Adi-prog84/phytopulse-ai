import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('phytopulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network request failed';
    if (error.response?.status === 401) {
      // Clear token if invalid or expired
      localStorage.removeItem('phytopulse_token');
      localStorage.removeItem('phytopulse_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const farmAPI = {
  getFarms: () => api.get('/farms'),
  getFarm: (id) => api.get(`/farms/${id}`),
  updateFarm: (id, data) => api.put(`/farms/${id}`, data),
};

export const sensorAPI = {
  getLatest: (farmId = 1) => api.get(`/sensors/latest?farm_id=${farmId}`),
  getHistory: (farmId = 1, limit = 25) => api.get(`/sensors/history?farm_id=${farmId}&limit=${limit}`),
};

export const plantHealthAPI = {
  analyze: (formDataOrJson) => {
    if (formDataOrJson instanceof FormData) {
      return api.post('/plant-health/analyze', formDataOrJson, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/plant-health/analyze', formDataOrJson);
  },
  getHistory: (farmId = 1, limit = 20) => api.get(`/plant-health/history?farm_id=${farmId}&limit=${limit}`),
  getSamples: () => api.get('/plant-health/samples'),
};

export const irrigationAPI = {
  getStatus: (farmId = 1) => api.get(`/irrigation/status?farm_id=${farmId}`),
  evaluateDecision: (data) => api.post('/irrigation/decision', data),
  control: (action, farmId = 1, extra = {}) => api.post('/irrigation/control', { action, farm_id: farmId, ...extra }),
  getHistory: (farmId = 1, limit = 25) => api.get(`/irrigation/history?farm_id=${farmId}&limit=${limit}`),
};

export const alertAPI = {
  getAlerts: (farmId = 1, options = {}) => {
    const params = new URLSearchParams({ farm_id: farmId, ...options });
    return api.get(`/alerts?${params.toString()}`);
  },
  markRead: (id) => api.put(`/alerts/${id}/read`),
  markAllRead: (farmId = 1) => api.put('/alerts/read-all', null, { params: { farm_id: farmId } }),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
};

export const analyticsAPI = {
  getSummary: (farmId = 1, range = '7d') => api.get(`/analytics/summary?farm_id=${farmId}&range=${range}`),
  getSoilMoistureTrend: (farmId = 1, range = '7d') => api.get(`/analytics/soil-moisture?farm_id=${farmId}&range=${range}`),
  getEnvironmentTrend: (farmId = 1, range = '7d') => api.get(`/analytics/environment?farm_id=${farmId}&range=${range}`),
  getPlantHealthTrend: (farmId = 1) => api.get(`/analytics/plant-health?farm_id=${farmId}`),
};

export const deviceAPI = {
  getDevices: (farmId = 1) => api.get(`/devices?farm_id=${farmId}`),
  getDevice: (id) => api.get(`/devices/${id}`),
};

export const simulationAPI = {
  getStatus: () => api.get('/simulation/status'),
  start: () => api.post('/simulation/start'),
  stop: () => api.post('/simulation/stop'),
  reset: () => api.post('/simulation/reset'),
  setScenario: (scenario) => api.post('/simulation/scenario', { scenario }),
  setCustom: (data) => api.post('/simulation/custom', data),
};

export const settingsAPI = {
  getSettings: (farmId = 1) => api.get(`/settings?farm_id=${farmId}`),
  updateSettings: (data) => api.put('/settings', data),
};

export default api;
