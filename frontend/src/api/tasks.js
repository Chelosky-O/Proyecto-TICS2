// frontend/src/api/tasks.js
import api from './client';

export const getMyTasks        = () => api.get('/tasks/mine');
export const getAssignedTasks  = () => api.get('/tasks/assigned');
export const getAllTasks       = () => api.get('/tasks');
export const getUnassigned     = () => api.get('/tasks/unassigned');

export const createTask  = (data)             => api.post('/tasks', data);
export const assignTask  = (id, userId)       => api.patch(`/tasks/${id}/assign/${userId}`);
export const updateState = (id, status)       => api.patch(`/tasks/${id}/status`, { status });
export const changeStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });
export const updateTask   = (id, data)         => api.patch(`/tasks/${id}`, data);
export const deleteTask   = (id)               => api.delete(`/tasks/${id}`);

