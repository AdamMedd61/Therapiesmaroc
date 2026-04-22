import api from './api';

export const getMySchedule = () =>
  api.get('/schedules').then(r => r.data);

export const createSlot = (data) =>
  api.post('/schedules', data).then(r => r.data);

export const updateSlot = (id, data) =>
  api.put(`/schedules/${id}`, data).then(r => r.data);

export const deleteSlot = (id) =>
  api.delete(`/schedules/${id}`).then(r => r.data);
