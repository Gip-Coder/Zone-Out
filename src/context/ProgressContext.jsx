import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { progressService } from '../services/progressService';

const ProgressContext = createContext();

export function ProgressProvider({ children }) {
  const [progressData, setProgressData] = useState({
    focus: { goalMinutes: 0, minutesCompleted: 0, percentage: 0 },
    goals: { completed: 0, total: 0, percentage: 0 },
    modules: { completed: 0, total: 0, percentage: 0 },
    loading: false,
    error: null
  });

  const calculatePercentage = (completed, total) => {
    if (!total || total === 0) return 0;
    const pct = (completed / total) * 100;
    return Math.min(Math.round(pct), 100);
  };

  const refreshProgress = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const data = await progressService.fetchProgress();
      
      if (data && data.summary) {
        const { focus, goals, modules } = data.summary;
        
        setProgressData({
          focus: {
            goalMinutes: focus?.goalMinutes || 0,
            minutesCompleted: focus?.minutesCompleted || 0,
            percentage: calculatePercentage(focus?.minutesCompleted, focus?.goalMinutes)
          },
          goals: {
            completed: goals?.completed || 0,
            total: goals?.total || 0,
            percentage: calculatePercentage(goals?.completed, goals?.total)
          },
          modules: {
            completed: modules?.completed || 0,
            total: modules?.total || 0,
            percentage: calculatePercentage(modules?.completed, modules?.total)
          },
          loading: false,
          error: null
        });
      }
    } catch (error) {
      // Silently handle 404/401/network errors — don't spam console
      const msg = error?.message || '';
      const isIgnorable = msg.includes('Not Found') || msg.includes('404')
        || msg.includes('401') || msg.includes('Invalid token')
        || msg.includes('Unauthorized') || msg === 'Error';
      if (!isIgnorable) {
        console.warn("[ProgressContext] Could not fetch progress:", msg);
      }
      setProgressData(prev => ({ ...prev, loading: false, error: null }));
    }
  }, []);

  // Initial load — only when token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setProgressData(prev => ({ ...prev, loading: true }));
      refreshProgress();
    }
  }, [refreshProgress]);

  const pushProgressEvent = useCallback(async (payload) => {
    try {
      await progressService.logProgressEvent(payload);
      await refreshProgress();
    } catch (error) {
      // Silent fallback — don't break user flow
      console.warn("[ProgressContext] Progress event failed:", error.message);
    }
  }, [refreshProgress]);

  const pushFocusGoalUpdate = useCallback(async (periodType, goalMinutes) => {
    try {
      await progressService.setFocusGoal({ periodType, goalMinutes });
      await refreshProgress();
    } catch (error) {
      console.warn("[ProgressContext] Focus goal update failed:", error.message);
    }
  }, [refreshProgress]);

  return (
    <ProgressContext.Provider value={{ ...progressData, refreshProgress, pushProgressEvent, pushFocusGoalUpdate }}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgressContext = () => useContext(ProgressContext);

