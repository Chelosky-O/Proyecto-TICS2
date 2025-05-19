import api from './client';

export const getSummary  = (params) => api.get('/reports/summary', { params });
export const getByArea   = ()        => api.get('/reports/by-area');
export const getByType   = ()        => api.get('/reports/by-type');
