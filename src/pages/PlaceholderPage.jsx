import React from 'react';

export default function PlaceholderPage({ title = 'Coming Soon' }) {

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>{title}</h1>
      <p style={subStyle}>
        This feature is coming soon. Check back later for updates.
      </p>
      <div style={boxStyle}>
        <p style={placeholderStyle}>
          Placeholder content for future development. You can add your own
          components and logic here when you’re ready to build this section.
        </p>
      </div>
    </div>
  );
}

const pageStyle = { padding: '32px', maxWidth: '720px', margin: '0 auto' };
const titleStyle = { fontSize: '28px', fontWeight: '700', marginBottom: '8px' };
const subStyle = { color: 'var(--text-secondary)', marginBottom: '24px' };
const boxStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 'var(--radius-lg)',
  padding: '32px',
};
const placeholderStyle = { color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 };
