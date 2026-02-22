import React, { useState, useContext } from 'react';
import { Music, Check, LogIn, AlertCircle } from 'lucide-react';
import { ToastContext } from '../context/ToastContext';
import { useMusicAuth } from '../hooks/useMusicAuth';

export default function MusicPlayer() {
  const { error: toastError, success: toastSuccess } = useContext(ToastContext) || {};
  const { connections, loginSpotify, loginYouTube, loginAppleMusic } = useMusicAuth();

  const [activeTab, setActiveTab] = useState('spotify'); // 'spotify', 'apple', 'youtube', 'amazon'
  const [isExpanded, setIsExpanded] = useState(true);

  const [embedUrl, setEmbedUrl] = useState("https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM?utm_source=generator");

  const handleConnect = async (provider) => {
    try {
      switch (provider) {
        case 'amazon':
          if (toastError) toastError("Amazon Music API is restricted for third-party apps.");
          else alert("Amazon Music API is restricted for third-party apps.");
          break;
        case 'spotify':
          loginSpotify();
          break;
        case 'apple':
          await loginAppleMusic();
          toastSuccess?.("Apple Music connected!");
          break;
        case 'youtube':
          loginYouTube();
          break;
        default:
          break;
      }
    } catch (error) {
      toastError?.(error.message || `Failed to connect to ${provider}`);
      console.error(error);
    }
  };

  const tabs = [
    { id: 'spotify', label: 'Spotify', color: '#1DB954' },
    { id: 'apple', label: 'Apple Music', color: '#FA243C' },
    { id: 'youtube', label: 'YouTube Music', color: '#FF0000' },
    { id: 'amazon', label: 'Amazon Music', color: '#00A8E1' },
  ];

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <Music size={18} color="var(--accent-primary)" />
          <span>Focus Music</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={styles.toggleBtn}
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Provider Tabs */}
          <div style={styles.tabsContainer}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tabBtn,
                  background: activeTab === tab.id ? 'var(--bg-primary)' : 'transparent',
                  borderColor: activeTab === tab.id ? tab.color : 'transparent',
                  color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={styles.contentArea}>
            {!connections[activeTab] ? (
              <div style={styles.connectState}>
                <div style={{ ...styles.iconWrapper, background: tabs.find(t => t.id === activeTab).color + '20', color: tabs.find(t => t.id === activeTab).color }}>
                  <Music size={32} />
                </div>
                <h3 style={styles.connectTitle}>Connect {tabs.find(t => t.id === activeTab).label}</h3>
                <p style={styles.connectDesc}>Link your account to access your personal focus playlists and saved albums directly in ZoneOut.</p>

                {activeTab === 'amazon' ? (
                  <div style={styles.warningBox}>
                    <AlertCircle size={16} />
                    <span style={{ fontSize: '13px' }}>Amazon Music does not offer a timeline API for third-party embeds.</span>
                  </div>
                ) : (
                  <button onClick={() => handleConnect(activeTab)} style={{ ...styles.connectBtn, background: tabs.find(t => t.id === activeTab).color }}>
                    <LogIn size={16} /> Connect Account
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.connectedState}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  <span style={{ color: '#10b981' }}>●</span> Connected to {tabs.find(t => t.id === activeTab).label}
                </p>
                {/* Embedded Player */}
                {activeTab === 'spotify' && (
                  <iframe src={embedUrl} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={styles.iframe} />
                )}
                {/* Note: In a full app, Apple and YouTube would have their respective custom JS players rendered here */}
                {activeTab !== 'spotify' && (
                  <div style={{ ...styles.iframe, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                    Playlists will render here after fetching from API.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    border: '1px solid rgba(255,255,255,0.05)',
    boxShadow: '0 15px 40px rgba(0,0,0,0.35)',
    backdropFilter: 'blur(12px)',
    width: '100%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600'
  },
  toggleBtn: {
    background: 'var(--bg-primary)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '6px 12px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    fontSize: '0.8rem'
  },
  tabsContainer: {
    display: 'flex',
    gap: '4px',
    background: 'var(--bg-primary)',
    padding: '4px',
    borderRadius: '12px',
    overflowX: 'auto'
  },
  tabBtn: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid',
    borderBottomWidth: '2px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  contentArea: {
    background: 'var(--bg-primary)',
    borderRadius: '14px',
    padding: '24px',
    minHeight: '220px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.03)'
  },
  connectState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '300px'
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  connectTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  connectDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '20px',
    lineHeight: '1.5'
  },
  connectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '24px',
    border: 'none',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  warningBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'left'
  },
  connectedState: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  iframe: {
    width: '100%',
    height: '152px',
    borderRadius: '12px',
    border: 'none'
  }
};
