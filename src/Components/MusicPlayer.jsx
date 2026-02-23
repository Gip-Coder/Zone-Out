import React, { useState, useContext, useEffect, useRef } from 'react';
import { Music, Check, LogIn, AlertCircle } from 'lucide-react';
import { ToastContext } from '../context/ToastContext';
import { useMusicAuth } from '../hooks/useMusicAuth';

export default function MusicPlayer({ isPlaying, setIsPlaying }) {
  const { error: toastError, success: toastSuccess } = useContext(ToastContext) || {};
  const { connections, tokens, loginSpotify, loginYouTube, loginAppleMusic } = useMusicAuth();

  const [activeTab, setActiveTab] = useState('spotify');
  const [showSignIn, setShowSignIn] = useState(false); // Controls if we are viewing the provider selection
  const defaultSpotifyUri = "spotify:playlist:0vvXsWCC9xrXsKd4FyS8kM";
  const embedUrl = "https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM?utm_source=generator";
  // Determine if ANY account is connected to skip straight to the player
  const isAnyConnected = Object.values(connections).some(Boolean);

  // If a provider is connected, ensure the active tab is set to it so the player works
  React.useEffect(() => {
    if (isAnyConnected) {
      const connectedTab = Object.keys(connections).find(key => connections[key]);
      if (connectedTab) setActiveTab(connectedTab);
    }
  }, [connections, isAnyConnected]);

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

  // Detect when user clicks on an iframe (music player)
  useEffect(() => {
    const handleBlur = () => {
      // If the active element that stole focus is an iframe, the user clicked play!
      setTimeout(() => {
        if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
          if (setIsPlaying) setIsPlaying(true);
        }
      }, 100);
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
      if (setIsPlaying) setIsPlaying(false);
    };
  }, [setIsPlaying]);

  // 1. CONNECTED VIEW (Only shows player)
  if (isAnyConnected) {
    // Find which one is connected to show the right player
    const connectedTab = Object.keys(connections).find(key => connections[key]);
    return (
      <div style={{ ...styles.wrapper, padding: '12px' }} className="music-iframe-container">
        <div style={styles.connectedState}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span><span style={{ color: '#10b981' }}>●</span> Connected to {tabs.find(t => t.id === connectedTab)?.label}</span>
          </p>

          {connectedTab === 'spotify' && (
            <iframe src={embedUrl} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={styles.iframe} />
          )}
          {connectedTab === 'youtube' && (
            <YouTubePlaylistFetcher token={tokens?.youtube || window.localStorage.getItem('youtube_token')} />
          )}
          {connectedTab === 'apple' && (
            <div style={{ ...styles.iframe, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
              Apple Music integration requires a signed Developer JWT.
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. SIGN-IN VIEW (Provider Selection)
  if (showSignIn && !isAnyConnected) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={styles.title}>
            <Music size={18} color="var(--accent-primary)" />
            <span>Connect Provider</span>
          </div>
          <button onClick={() => setShowSignIn(false)} style={styles.toggleBtn}>Back</button>
        </div>

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
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.wrapper, padding: isPlaying ? 0 : '22px' }} className="music-iframe-container">
      {!isPlaying && (
        <div style={styles.header}>
          <div style={styles.title}>
            <Music size={18} color="var(--accent-primary)" />
            <span>Focus Music</span>
          </div>
        </div>
      )}

      <div style={styles.connectedState}>
        {!isPlaying && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Default Focus Playlist
          </p>
        )}
        <iframe src={embedUrl} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{ ...styles.iframe, flex: 1, height: '100%', marginBottom: isPlaying ? 0 : '16px' }} />
      </div>

      {!isPlaying && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>Want to listen to your own music?</p>
          <button onClick={() => setShowSignIn(true)} style={{ ...styles.connectBtn, background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>
            Sign in to Provider
          </button>
        </div>
      )}
    </div>
  );
}


// Sub-component to fetch and display YouTube Playlists
function YouTubePlaylistFetcher({ token }) {
  const [playlists, setPlaylists] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [activeEmbed, setActiveEmbed] = React.useState(null);

  React.useEffect(() => {
    if (!token) return;

    fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=10', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error.message);
        setPlaylists(data.items || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load your YouTube playlists. Ensure you added the YouTube Data API v3 to your Google Cloud Project.");
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Loading your playlists...</div>;
  if (error) return <div style={{ color: '#ef4444', fontSize: '13px' }}>{error}</div>;
  if (playlists.length === 0) return <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No public playlists found on your YouTube account.</div>;

  if (activeEmbed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={() => setActiveEmbed(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>← Back to List</button>
        <iframe
          width="100%"
          height="352"
          src={`https://www.youtube.com/embed/videoseries?list=${activeEmbed}`}
          title="YouTube video player"
          style={{ borderRadius: '12px', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
      {playlists.map(p => (
        <div
          key={p.id}
          onClick={() => setActiveEmbed(p.id)}
          style={{
            minWidth: '120px',
            background: 'var(--bg-primary)',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <img src={p.snippet.thumbnails?.default?.url} alt={p.snippet.title} style={{ width: '100%', borderRadius: '4px', marginBottom: '8px' }} />
          <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.snippet.title}</p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  wrapper: {
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    width: '100%',
    boxSizing: 'border-box'
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
    border: '1px solid rgba(255,255,255,0.03)',
    boxSizing: 'border-box',
    width: '100%'
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
    flexDirection: 'column',
    flex: 1
  },
  iframe: {
    width: '100%',
    height: '100%',
    minHeight: '352px',
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
  }
};
