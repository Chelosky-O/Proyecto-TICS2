import api from './client';

export const getSummary  = (params) => api.get('/reports/summary', { params });
export const getByArea   = (params) => api.get('/reports/by-area', { params });
export const getByType   = (params) => api.get('/reports/by-type', { params });
