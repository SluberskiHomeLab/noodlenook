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
  register: (username, email, password, invitation_token) => api.post('/auth/register', { username, email, password, invitation_token }),
  me: () => api.get('/auth/me'),
};

export const pages = {
  getAll: () => api.get('/pages'),
  getBySlug: (slug) => api.get(`/pages/${slug}`),
  create: (data) => api.post('/pages', data),
  update: (slug, data) => api.put(`/pages/${slug}`, data),
  delete: (slug) => api.delete(`/pages/${slug}`),
  updateOrder: (slug, display_order) => api.put(`/pages/order/${slug}`, { display_order }),
};

export const search = {
  query: (q) => api.get('/search', { params: { q } }),
};

export const users = {
  getAll: () => api.get('/users'),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};

export const invitations = {
  getAll: () => api.get('/invitations'),
  create: (email, role, method) => api.post('/invitations', { email, role, method }),
  validate: (token) => api.get(`/invitations/validate/${token}`),
  delete: (id) => api.delete(`/invitations/${id}`),
};

export default api;
