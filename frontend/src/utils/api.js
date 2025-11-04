import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  me: () => api.get('/auth/me'),
};

export const pages = {
  getAll: () => api.get('/pages'),
  getBySlug: (slug) => api.get(`/pages/${slug}`),
  create: (data) => api.post('/pages', data),
  update: (slug, data) => api.put(`/pages/${slug}`, data),
  delete: (slug) => api.delete(`/pages/${slug}`),
};

export const search = {
  query: (q) => api.get('/search', { params: { q } }),
};

export const users = {
  getAll: () => api.get('/users'),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};

export default api;
