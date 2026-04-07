import { api } from './apiClient';

export const progressService = {
  fetchProgress: async (from, to) => {
    const query = (from && to) ? `?from=${from}&to=${to}` : "";
    return await api.get(`/progress/summary${query}`);
  },
  
  logProgressEvent: async (payload) => {
    // payload: { eventType, value }
    return await api.post('/progress/event', payload);
  },
  
  setFocusGoal: async (payload) => {
    // payload: { periodType, goalMinutes }
    return await api.post('/progress/set-focus-goal', payload);
  }
};
