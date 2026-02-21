import React from 'react';
import { Link } from 'react-router-dom';
import { ListTodo, Book, Timer, Music, Bot, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Dashboard</h1>
      <p style={subStyle}>Your study hub. Jump to any feature below.</p>

      <div style={gridStyle}>
        <Link to="/timeline" style={cardStyle}>
          <ListTodo size={32} style={{ color: 'var(--accent-primary)' }} />
          <h3>Timeline</h3>
          <p>View and manage your study goals.</p>
          <span style={linkStyle}>Open <ArrowRight size={14} /></span>
        </Link>
        <Link to="/course-vault" style={cardStyle}>
          <Book size={32} style={{ color: 'var(--accent-secondary)' }} />
          <h3>Course Vault</h3>
          <p>Notes, modules, and course materials.</p>
          <span style={linkStyle}>Open <ArrowRight size={14} /></span>
        </Link>
        <Link to="/timer" style={cardStyle}>
          <Timer size={32} style={{ color: 'var(--accent-tertiary)' }} />
          <h3>Focus Timer</h3>
          <p>Pomodoro-style focus sessions.</p>
          <span style={linkStyle}>Open <ArrowRight size={14} /></span>
        </Link>
        <Link to="/music" style={cardStyle}>
          <Music size={32} style={{ color: 'var(--accent-primary)' }} />
          <h3>Music</h3>
          <p>Background music for studying.</p>
          <span style={linkStyle}>Open <ArrowRight size={14} /></span>
        </Link>
        <Link to="/ai" style={cardStyle}>
          <Bot size={32} style={{ color: 'var(--accent-secondary)' }} />
          <h3>AI Assistant</h3>
          <p>Study Buddy and Q&A chatbot.</p>
          <span style={linkStyle}>Open <ArrowRight size={14} /></span>
        </Link>
      </div>
    </div>
  );
}

const pageStyle = { padding: '32px', maxWidth: '1000px', margin: '0 auto' };
const titleStyle = { fontSize: '28px', fontWeight: '700', marginBottom: '8px' };
const subStyle = { color: 'var(--text-secondary)', marginBottom: '28px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' };
const cardStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 'var(--radius-lg)',
  padding: '24px',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'transform 0.2s, box-shadow 0.2s',
};
const linkStyle = { display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontSize: '14px', marginTop: '8px' };
