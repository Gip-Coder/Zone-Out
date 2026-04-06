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
    // Don't attempt to fetch if user isn't logged in
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("[ProgressContext] No auth token, skipping fetch.");
      return;
    }

    try {
      const data = await progressService.fetchProgress();
      
      if (data && data.summary) {
        const { focus, goals, modules } = data.summary;
        
        setProgressData({
          focus: {
            goalMinutes: focus.goalMinutes,
            minutesCompleted: focus.minutesCompleted,
            percentage: calculatePercentage(focus.minutesCompleted, focus.goalMinutes)
          },
          goals: {
            completed: goals.completed,
            total: goals.total,
            percentage: calculatePercentage(goals.completed, goals.total)
          },
          modules: {
            completed: modules.completed,
            total: modules.total,
            percentage: calculatePercentage(modules.completed, modules.total)
          },
          loading: false,
          error: null
        });
        
        console.log("[ProgressContext] Data refreshed:", {
          focus: `${focus.minutesCompleted}/${focus.goalMinutes} min`,
          goals: `${goals.completed}/${goals.total}`,
          modules: `${modules.completed}/${modules.total}`
        });
      }
    } catch (error) {
      console.error("[ProgressContext] Failed to fetch progress:", error);
      setProgressData(prev => ({ ...prev, loading: false, error: error.message }));
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
      console.log("[ProgressContext] Sending event:", payload);
      await progressService.logProgressEvent(payload);
      await refreshProgress(); // Auto-refresh after event
    } catch (error) {
      console.error("[ProgressContext] Error sending progress event:", error);
    }
  }, [refreshProgress]);

  const pushFocusGoalUpdate = useCallback(async (periodType, goalMinutes) => {
    try {
      await progressService.setFocusGoal({ periodType, goalMinutes });
      await refreshProgress();
    } catch (error) {
      console.error("[ProgressContext] Error updating focus goal:", error);
    }
  }, [refreshProgress]);

  return (
    <ProgressContext.Provider value={{ ...progressData, refreshProgress, pushProgressEvent, pushFocusGoalUpdate }}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgressContext = () => useContext(ProgressContext);
