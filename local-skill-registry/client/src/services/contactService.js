import { apiRequest } from './api';

export const submitContactRequest = async (requestData) => {
  return apiRequest('/contact-requests', {
    method: 'POST',
    body: requestData,
  });
};

export const trackContactRequest = async (identifier, accessCode = '') => {
  const query = accessCode ? `?accessCode=${encodeURIComponent(accessCode)}` : '';
  return apiRequest(`/contact-requests/track/${encodeURIComponent(identifier)}${query}`);
};

export const fetchAdminRequests = async (params = {}) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      query.append(key, params[key]);
    }
  });
  return apiRequest(`/contact-requests?${query.toString()}`);
};

export const updateRequestStatus = async (id, status, adminNotes = '') => {
  return apiRequest(`/contact-requests/${id}/status`, {
    method: 'PATCH',
    body: { status, adminNotes },
  });
};

export const rateWorker = async (requestId, ratingData) => {
  return apiRequest(`/contact-requests/${requestId}/rate`, {
    method: 'POST',
    body: ratingData,
  });
};

export const fetchStats = async () => {
  return apiRequest('/stats');
};
