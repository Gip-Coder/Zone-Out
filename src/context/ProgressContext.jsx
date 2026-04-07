import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { progressService } from '../services/progressService';

const ProgressContext = createContext();

export function ProgressProvider({ children }) {
  const [progressData, setProgressData] = useState({
    focus: { goalMinutes: 0, minutesCompleted: 0, percentage: 0 },
    goals: { completed: 0, total: 0, percentage: 0 },
    modules: { completed: 0, total: 0, percentage: 0 },
    stats: {
      totalMinutes: 0,
      sessionsCompleted: 0,
      dailyBreakdown: [],
      subjectBreakdown: []
    },
    loading: false,
    error: null
  });

  const calculatePercentage = (completed, total) => {
    if (!total || total === 0) return 0;
    const pct = (completed / total) * 100;
    return Math.min(Math.round(pct), 100);
  };

  const refreshProgress = useCallback(async (from, to) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const data = await progressService.fetchProgress(from, to);
      
      if (data && data.summary) {
        const { focus, goals, modules } = data.summary;
        const { stats } = data;
        
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
          stats: {
            totalMinutes: stats?.totalMinutes || 0,
            sessionsCompleted: stats?.sessionsCompleted || 0,
            dailyBreakdown: stats?.dailyBreakdown || [],
            subjectBreakdown: stats?.subjectBreakdown || []
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
  // Initial load + Auth change detection
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      if (token) {
        refreshProgress();
      }
    };
    
    handleAuthChange(); // Check on mount/update

    // Since token is in localStorage, we can use storage event for cross-tab 
    // OR we can just rely on the fact that App.jsx re-renders the tree when auth state changes.
    // However, ProgressProvider is ABOVE App.jsx in main.jsx, so it won't re-render.
    // We add a recurring check or a custom event if needed, but storage event helps.
    window.addEventListener("storage", handleAuthChange);
    return () => window.removeEventListener("storage", handleAuthChange);
  }, [refreshProgress]);

  const pushProgressEvent = useCallback(async (payload) => {
    try {
      // Ensure we use the correct event names mapping if needed, 
      // but the components should pass correct ones.
      await progressService.logProgressEvent(payload);
      await refreshProgress(); // Centralized refresh
    } catch (error) {
      console.warn("[ProgressContext] Progress event failed:", error.message);
    }
  }, [refreshProgress]);

  const pushFocusGoalUpdate = useCallback(async (periodType, goalMinutes) => {
    try {
      await progressService.setFocusGoal({ periodType, goalMinutes });
      await refreshProgress(); // Centralized refresh
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

