import { apiRequest, setAuthToken, getAuthToken } from './api';

export const loginAdmin = async (username, password) => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: { username, password },
  });

  if (data.token) {
    setAuthToken(data.token);
    localStorage.setItem('lsr_admin_user', JSON.stringify(data.user));
  }

  return data;
};

export const logoutAdmin = () => {
  setAuthToken(null);
  localStorage.removeItem('lsr_admin_user');
};

export const getStoredAdminUser = () => {
  try {
    const raw = localStorage.getItem('lsr_admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const checkAdminSession = async () => {
  try {
    const data = await apiRequest('/auth/me');
    return data.user;
  } catch (err) {
    logoutAdmin();
    return null;
  }
};
