import api from './client';

export const getExecutors = () => api.get('/users/sg');
export const getAllUsers  = () => api.get('/users');
export const createUser   = (data) => api.post('/users', data);
export const toggleActive = (id)   => api.patch(`/users/${id}/active`);
