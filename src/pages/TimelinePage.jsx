import React from 'react';
import StudyGoals from '../Components/StudyGoals';

export default function TimelinePage({ goals, setGoals }) {
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Timeline</h1>
      <p style={subStyle}>Your study goals and schedule.</p>
      <StudyGoals goals={goals || []} setGoals={setGoals || (() => {})} />
    </div>
  );
}

const pageStyle = { padding: '24px', maxWidth: '900px', margin: '0 auto' };
const titleStyle = { fontSize: '24px', fontWeight: '700', marginBottom: '6px' };
const subStyle = { color: 'var(--text-secondary)', marginBottom: '20px' };
