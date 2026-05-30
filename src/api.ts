import axios from 'axios';

// In-memory token — initialized from localStorage so it's available immediately
// on every page load before React even renders.
let _token: string | null = localStorage.getItem('auth_token');

export function setAuthToken(token: string) {
  _token = token;
  localStorage.setItem('auth_token', token);
}

export function clearAuthToken() {
  _token = null;
  localStorage.removeItem('auth_token');
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(config => {
  if (_token) {
    config.headers.Authorization = `Bearer ${_token}`;
  }
  return config;
});
