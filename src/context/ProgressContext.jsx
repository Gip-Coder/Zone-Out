import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { progressService } from '../services/progressService';

const ProgressContext = createContext();

const INITIAL_PROGRESS = {
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
};

const calculatePercentage = (completed, total) => {
  if (!total || total === 0) return 0;
  const pct = ((completed || 0) / total) * 100;
  return Math.min(Math.round(pct), 100);
};

export function ProgressProvider({ children }) {
  const [progressData, setProgressData] = useState(INITIAL_PROGRESS);
  // The range the Progress page last asked for. Refreshes triggered by events
  // (timer finished, goal toggled) reuse it so the page's charts don't blank out.
  const rangeRef = useRef({ from: undefined, to: undefined });
  // Ignore responses that arrive after a newer request was started
  const requestIdRef = useRef(0);

  const refreshProgress = useCallback(async (from, to) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (from && to) rangeRef.current = { from, to };
    const range = rangeRef.current;
    const requestId = ++requestIdRef.current;

    try {
      const data = await progressService.fetchProgress(range.from, range.to);
      if (requestId !== requestIdRef.current) return;

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
      if (requestId !== requestIdRef.current) return;
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

  /** Clears cached progress on logout so the next user never sees it. */
  const resetProgress = useCallback(() => {
    requestIdRef.current++;
    rangeRef.current = { from: undefined, to: undefined };
    setProgressData(INITIAL_PROGRESS);
  }, []);

  // Initial load + cross-tab auth changes. Same-tab logins are handled by App,
  // which calls refreshProgress() once the user is authenticated.
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      if (token) {
        refreshProgress();
      } else {
        resetProgress();
      }
    };

    handleAuthChange();
    window.addEventListener("storage", handleAuthChange);
    return () => window.removeEventListener("storage", handleAuthChange);
  }, [refreshProgress, resetProgress]);

  const pushProgressEvent = useCallback(async (payload) => {
    try {
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
    <ProgressContext.Provider value={{ ...progressData, refreshProgress, resetProgress, pushProgressEvent, pushFocusGoalUpdate }}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgressContext = () => useContext(ProgressContext);
