import React from 'react';
import MusicPlayer from '../Components/MusicPlayer';

export default function MusicPage() {
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Music</h1>
      <p style={subStyle}>Background music for focus and relaxation.</p>
      <div style={wrapStyle}>
        <MusicPlayer />
      </div>
    </div>
  );
}

const pageStyle = { padding: '32px', maxWidth: '480px', margin: '0 auto' };
const titleStyle = { fontSize: '28px', fontWeight: '700', marginBottom: '8px' };
const subStyle = { color: 'var(--text-secondary)', marginBottom: '24px' };
const wrapStyle = { display: 'flex', justifyContent: 'center' };
