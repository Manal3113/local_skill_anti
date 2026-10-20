const API_BASE = '/api';

export const getAuthToken = () => {
  return localStorage.getItem('lsr_admin_token') || null;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('lsr_admin_token', token);
  } else {
    localStorage.removeItem('lsr_admin_token');
  }
};

const BACKEND_URL = 'http://localhost:5000/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (initialErr) {
    // If relative /api failed (e.g. running on port without proxy, or service worker issue), fallback directly to port 5000
    try {
      response = await fetch(`${BACKEND_URL}${endpoint}`, config);
    } catch (fallbackErr) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, fallbackErr);
      throw fallbackErr;
    }
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.errors = data.errors || [];
    throw err;
  }

  return data;
};
