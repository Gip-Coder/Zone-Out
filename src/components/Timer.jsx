import React, { useState, useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";

const TICK_MS = 250;

export default function Timer({
  focusTime,
  setFocusTime,
  isRunning,
  setIsRunning,
  onSessionComplete,
  onTimerStart,
  sessionDuration: sessionDurationProp,
  setSessionDuration: setSessionDurationProp,
}) {

  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  // The session length can be owned by the parent (so AI-set timers report the
  // right duration) or fall back to local state.
  const [localSessionDuration, setLocalSessionDuration] = useState(focusTime);
  const sessionDuration = sessionDurationProp ?? localSessionDuration;
  const setSessionDuration = setSessionDurationProp ?? setLocalSessionDuration;

  const [hoursInput, setHoursInput] = useState(
    Math.floor(focusTime / 3600)
  );
  const [minutesInput, setMinutesInput] = useState(
    Math.floor((focusTime % 3600) / 60)
  );

  const [isEditing, setIsEditing] = useState(false);

  // The h/m inputs are only visible in edit mode, so they are synced from the
  // current time (which the AI may have changed) whenever edit mode opens.
  const openEditor = () => {
    setHoursInput(Math.floor(focusTime / 3600));
    setMinutesInput(Math.floor((focusTime % 3600) / 60));
    setIsEditing(true);
  };

  // ===============================
  // TIMER ENGINE
  // Counts down against a wall-clock deadline instead of decrementing once
  // per interval tick: browsers throttle timers in background tabs, which made
  // the old countdown run far slower than real time while the user studied
  // in another tab.
  // ===============================
  const deadlineRef = useRef(null);
  const lastEmittedRef = useRef(focusTime);
  // Latest callbacks/values for the interval, without restarting it each render
  const callbacksRef = useRef({ onSessionComplete, sessionDuration, setFocusTime, setIsRunning });
  useEffect(() => {
    callbacksRef.current = { onSessionComplete, sessionDuration, setFocusTime, setIsRunning };
  });

  // (Re)arm the deadline whenever the timer starts or its value is changed
  // from outside the engine (manual set, AI command, reset).
  useEffect(() => {
    if (!isRunning) {
      deadlineRef.current = null;
      return;
    }
    if (deadlineRef.current === null || focusTime !== lastEmittedRef.current) {
      deadlineRef.current = Date.now() + focusTime * 1000;
      lastEmittedRef.current = focusTime;
    }
  }, [isRunning, focusTime]);

  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      if (deadlineRef.current === null) return;
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      const cb = callbacksRef.current;
      if (remaining !== lastEmittedRef.current) {
        lastEmittedRef.current = remaining;
        cb.setFocusTime(remaining);
      }
      if (remaining === 0) {
        deadlineRef.current = null;
        cb.setIsRunning(false);
        if (typeof cb.onSessionComplete === "function") {
          const minutes = Math.round((cb.sessionDuration || 0) / 60);
          if (minutes > 0) cb.onSessionComplete(minutes);
        }
      }
    };

    const interval = setInterval(tick, TICK_MS);
    // Catch up immediately when the tab becomes visible again
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [isRunning]);

  const handleRingClick = () => {
    if (!isRunning && !isEditing) {
      // Open edit mode if stopped
      openEditor();
    } else if (isRunning) {
      // Pause if running
      setIsRunning(false);
    } else if (!isRunning && isEditing && focusTime > 0) {
      // Starts timer from edit mode if time is gt 0 (fallback if clicking ring instead of Set)
      setIsEditing(false);
      setIsRunning(true);
      if (onTimerStart) onTimerStart();
    }
  };

  // ===============================
  // MANUAL SET FIXED
  // ===============================
  const applyManualTime = () => {

    const safeHours = Number.isFinite(hoursInput) ? Math.max(0, Math.min(hoursInput, 24)) : 0;
    const safeMinutes = Number.isFinite(minutesInput) ? Math.max(0, Math.min(minutesInput, 59)) : 0;

    const totalSeconds = (safeHours * 3600) + (safeMinutes * 60);

    if (totalSeconds <= 0) return;

    setIsRunning(false);
    setFocusTime(totalSeconds);
    setSessionDuration(totalSeconds);
    setIsEditing(false);
    setIsRunning(true);
    if (onTimerStart) onTimerStart();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setFocusTime(sessionDuration);
  };

  // ===============================
  // FORMAT
  // ===============================
  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ===============================
  // PROGRESS FIX
  // ===============================
  const safeDuration = sessionDuration || 1;
  const progress = focusTime / safeDuration;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - clampedProgress);
  const percentage = Math.round(clampedProgress * 100);

  // ===============================
  // UI
  // ===============================
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        role="button"
        tabIndex={0}
        aria-label={isRunning ? "Pause timer" : isEditing ? "Start timer" : "Edit timer"}
        style={{
          position: "relative",
          width: 320,
          height: 320,
          cursor: "pointer"
        }}
        onClick={handleRingClick}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleRingClick();
          }
        }}
      >

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            top: 50,
            left: 50,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--accent-primary)33, transparent 70%)",
            animation: isRunning ? "pulse 3s ease-in-out infinite" : "none"
          }}
        />

        <svg width="320" height="320">
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-secondary)" />
            </linearGradient>
          </defs>

          {/* Background ring */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="var(--glass)"
            strokeWidth="14"
            fill="transparent"
          />

          {/* Progress ring */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="url(#timerGradient)"
            strokeWidth="14"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.8s ease",
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              filter: isRunning
                ? "drop-shadow(0 0 20px var(--accent-primary))"
                : "none"
            }}
          />
        </svg>

        {/* CENTER */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            width: "100%"
          }}
        >
          <div role="timer" aria-live="off" style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "monospace" }}>
            {formatTime(focusTime)}
          </div>

          <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
            {percentage}% remaining
          </div>

          {/* Controls - Only visible during Edit Mode */}
          {isEditing && (
            <div style={{ display: "flex", gap: 15, marginTop: 12 }}>
              <button
                type="button"
                aria-label="Reset timer"
                onClick={(e) => {
                  // Without this the click bubbled to the ring, which
                  // immediately restarted the timer after resetting it.
                  e.stopPropagation();
                  resetTimer();
                }}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--glass)",
                  borderRadius: "50%",
                  width: 55,
                  height: 55,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-primary)"
                }}
              >
                <RotateCcw size={20} />
              </button>
            </div>
          )}

          {/* Manual Set */}
          {isEditing && (
            <div className="timer-controls" onClick={e => e.stopPropagation()}>
              <input
                type="number"
                min="0"
                max="24"
                aria-label="Hours"
                value={hoursInput}
                onChange={(e) => setHoursInput(Number(e.target.value))}
                style={manualInputStyle}
              />
              <span>h</span>

              <input
                type="number"
                min="0"
                max="59"
                aria-label="Minutes"
                value={minutesInput}
                onChange={(e) => setMinutesInput(Number(e.target.value))}
                style={manualInputStyle}
              />
              <span>m</span>

              <button type="button" onClick={applyManualTime} style={setBtnStyle}>
                Set
              </button>
            </div>
          )}
        </div>

        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 0.6; }
              50% { transform: scale(1.08); opacity: 0.9; }
              100% { transform: scale(1); opacity: 0.6; }
            }
          `}
        </style>

      </div>
    </div>
  );
}

const manualInputStyle = {
  width: 55,
  padding: '8px',
  borderRadius: '12px',
  border: "1px solid var(--glass)",
  background: "var(--overlay-bg)",
  color: "var(--text-primary)",
  textAlign: "center",
  fontSize: '16px',
  outline: 'none',
  backdropFilter: 'blur(10px)',
  transition: 'border 0.2s',
};

const setBtnStyle = {
  padding: "8px 16px",
  borderRadius: '12px',
  border: "none",
  background: "var(--btn-primary-bg)",
  color: "var(--btn-primary-text)",
  cursor: "pointer",
  fontWeight: '600',
  boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
  transition: 'transform 0.1s',
};
