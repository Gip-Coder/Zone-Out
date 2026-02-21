import React from 'react';
import Timer from '../Components/Timer';

export default function FocusTimerPage({ focusTime, setFocusTime, isFocusRunning, setIsFocusRunning }) {
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Focus Timer</h1>
      <p style={subStyle}>Set a session and stay in the zone.</p>
      <div style={wrapStyle}>
        <Timer
          focusTime={focusTime}
          setFocusTime={setFocusTime}
          isRunning={isFocusRunning}
          setIsRunning={setIsFocusRunning}
        />
      </div>
    </div>
  );
}

const pageStyle = { padding: '32px', maxWidth: '480px', margin: '0 auto' };
const titleStyle = { fontSize: '28px', fontWeight: '700', marginBottom: '8px' };
const subStyle = { color: 'var(--text-secondary)', marginBottom: '24px' };
const wrapStyle = { display: 'flex', justifyContent: 'center' };
