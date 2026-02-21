import React, { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (_) {
      setUser(null);
    }
  }, []);

  const displayName = user?.name || user?.email || 'User';
  const initial = displayName && displayName[0] ? displayName[0].toUpperCase() : '?';

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Profile</h1>
      <p style={subStyle}>
        Your account details and preferences.
      </p>
      <div style={boxStyle}>
        <div style={avatarRow}>
          <div style={avatarStyle}>{initial}</div>
          <div>
            <div style={nameStyle}>{user ? displayName : '—'}</div>
            {user?.email && (
              <div style={emailStyle}>{user.email}</div>
            )}
          </div>
        </div>
        {!user && (
          <p style={placeholderStyle}>
            Sign in to see your profile. Your name and email are shown here once you’re logged in.
          </p>
        )}
        <p style={placeholderStyle}>
          More profile options (avatar upload, password change, etc.) are coming soon.
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
const avatarRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '20px',
};
const avatarStyle = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'var(--button-gradient)',
  color: '#fff',
  fontWeight: '700',
  fontSize: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
};
const nameStyle = { fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' };
const emailStyle = { fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' };
const placeholderStyle = { color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 };
