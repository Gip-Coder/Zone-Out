import { api } from './apiClient';
import { localDateString } from '../utils/date';

export const progressService = {
  fetchProgress: async (from, to) => {
    const params = new URLSearchParams({ date: localDateString() });
    if (from && to) {
      params.set('from', from);
      params.set('to', to);
    }
    return await api.get(`/progress/summary?${params}`);
  },

  logProgressEvent: async (payload) => {
    // payload: { eventType, value } — the user's local date is attached so
    // sessions land on the right calendar day regardless of timezone.
    return await api.post('/progress/event', { ...payload, date: localDateString() });
  },

  setFocusGoal: async (payload) => {
    // payload: { periodType, goalMinutes }
    return await api.post('/progress/set-focus-goal', { ...payload, date: localDateString() });
  }
};
