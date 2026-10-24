import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Page not found</h1>
      <p style={subStyle}>The page you were looking for doesn’t exist.</p>
      <Link to="/" style={linkStyle}>Back to dashboard</Link>
    </div>
  );
}

const pageStyle = { padding: '32px' };
const titleStyle = { fontSize: '28px', fontWeight: '700', marginBottom: '8px' };
const subStyle = { color: 'var(--text-secondary)', marginBottom: '24px' };
const linkStyle = { color: 'var(--accent-primary)', fontWeight: 600 };
