import React, { useEffect, useState } from 'react';
import './ProgressBar.css';

/**
 * Reusable ProgressBar component.
 * 
 * Props:
 *   title      - Label text (e.g., "Focus Progress")
 *   percentage - Number 0-100
 *   subtitle   - Detail text (e.g., "45 / 120 min")
 *   emptyText  - Shown when percentage is null/undefined or data is missing
 *   accentVar  - CSS variable for the accent color (optional, defaults to --accent-primary)
 */
export default function ProgressBar({ title, percentage = 0, subtitle, emptyText, accentVar }) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  // Animate on mount and when percentage changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedWidth(Math.min(Math.max(percentage, 0), 100));
    }, 80);
    return () => clearTimeout(timeout);
  }, [percentage]);

  // Dynamic color based on percentage
  const getProgressLevel = (pct) => {
    if (pct >= 80) return 'progress-high';
    if (pct >= 40) return 'progress-mid';
    return 'progress-low';
  };

  const showEmpty = emptyText && (percentage === 0 || percentage === null || percentage === undefined);

  return (
    <div className="progress-bar-card">
      <div className="progress-bar-header">
        <span className="progress-bar-title">{title}</span>
        <span className={`progress-bar-percentage ${getProgressLevel(animatedWidth)}`}>
          {animatedWidth}%
        </span>
      </div>

      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${getProgressLevel(animatedWidth)}`}
          style={{
            width: `${animatedWidth}%`,
            ...(accentVar ? { '--bar-accent': `var(${accentVar})` } : {})
          }}
        />
      </div>

      <div className="progress-bar-subtitle">
        {showEmpty ? (
          <span className="progress-bar-empty">{emptyText}</span>
        ) : (
          subtitle
        )}
      </div>
    </div>
  );
}
