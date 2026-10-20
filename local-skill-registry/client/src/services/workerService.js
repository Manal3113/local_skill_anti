import { apiRequest } from './api';

export const fetchWorkers = async (params = {}) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      query.append(key, params[key]);
    }
  });
  return apiRequest(`/workers?${query.toString()}`);
};

export const fetchWorkerById = async (id) => {
  return apiRequest(`/workers/${id}`);
};

export const registerWorker = async (workerData) => {
  return apiRequest('/workers', {
    method: 'POST',
    body: workerData,
  });
};

export const toggleVerification = async (id) => {
  return apiRequest(`/workers/${id}/verify`, {
    method: 'PATCH',
  });
};

export const updateWorker = async (id, data) => {
  return apiRequest(`/workers/${id}`, {
    method: 'PUT',
    body: data,
  });
};

export const deleteWorker = async (id) => {
  return apiRequest(`/workers/${id}`, {
    method: 'DELETE',
  });
};

export const fetchFilterOptions = async () => {
  return apiRequest('/workers/meta/filters');
};
