import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function Timer({ focusTime, setFocusTime, isRunning, setIsRunning, onSessionComplete }) {

  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  const [sessionDuration, setSessionDuration] = useState(focusTime);

  const [hoursInput, setHoursInput] = useState(
    Math.floor(focusTime / 3600)
  );
  const [minutesInput, setMinutesInput] = useState(
    Math.floor((focusTime % 3600) / 60)
  );

  // ===============================
  // Sync Inputs when focusTime changes externally (AI etc)
  // ===============================
  useEffect(() => {
    setHoursInput(Math.floor(focusTime / 3600));
    setMinutesInput(Math.floor((focusTime % 3600) / 60));
  }, [focusTime]);

  // ===============================
  // TIMER ENGINE
  // ===============================
  useEffect(() => {
    let interval;

    if (isRunning && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime(prev => prev - 1);
      }, 1000);
    }

    if (focusTime === 0 && isRunning) {
      setIsRunning(false);
      if (typeof onSessionComplete === "function") {
        const minutes = Math.round((sessionDuration || 0) / 60);
        if (minutes > 0) onSessionComplete(minutes);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, focusTime]);

  const toggleTimer = () => setIsRunning(prev => !prev);

  // ===============================
  // MANUAL SET FIXED
  // ===============================
  const applyManualTime = () => {

    const safeHours = Math.max(0, Math.min(hoursInput, 24));
    const safeMinutes = Math.max(0, Math.min(minutesInput, 59));

    const totalSeconds = (safeHours * 3600) + (safeMinutes * 60);

    if (totalSeconds <= 0) return;

    setIsRunning(false);
    setFocusTime(totalSeconds);
    setSessionDuration(totalSeconds);
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

    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
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
    <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
      <div style={{ position: "relative", width: 320, height: 320 }}>

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
            stroke="rgba(255,255,255,0.08)"
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
            width: "85%"
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "monospace" }}>
            {formatTime(focusTime)}
          </div>

          <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
            {percentage}% remaining
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 15, marginTop: 12 }}>
            <button
              onClick={toggleTimer}
              style={{
                background: "var(--button-gradient)",
                border: "none",
                borderRadius: "50%",
                width: 55,
                height: 55,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
                boxShadow: "0 0 20px var(--accent-primary)"
              }}
            >
              {isRunning ? <Pause size={22} /> : <Play size={22} />}
            </button>

            <button
              onClick={resetTimer}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid rgba(255,255,255,0.1)",
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

          {/* Manual Set */}
          {!isRunning && (
            <div style={{ display: "flex", gap: 8, marginTop: 18, alignItems: "center" }}>
              <input
                type="number"
                min="0"
                max="24"
                value={hoursInput}
                onChange={(e) => setHoursInput(Number(e.target.value))}
                style={manualInputStyle}
              />
              <span>h</span>

              <input
                type="number"
                min="0"
                max="59"
                value={minutesInput}
                onChange={(e) => setMinutesInput(Number(e.target.value))}
                style={manualInputStyle}
              />
              <span>m</span>

              <button onClick={applyManualTime} style={setBtnStyle}>
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
  width: 65,
  padding: 8,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  textAlign: "center"
};

const setBtnStyle = {
  padding: "8px 14px",
  borderRadius: 10,
  border: "none",
  background: "var(--button-gradient)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600
};
