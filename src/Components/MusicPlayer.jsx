import React, { useState } from 'react';
import { Music, Check } from 'lucide-react';

export default function MusicPlayer() {

  const DEFAULT_PLAYLIST = "https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM?utm_source=generator";

  const [embedUrl, setEmbedUrl] = useState(DEFAULT_PLAYLIST);
  const [userInput, setUserInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUpdateMusic = () => {
    if (!userInput.trim()) return;

    try {
      const urlParts = new URL(userInput).pathname.split('/');
      if (urlParts.length >= 3) {
        const type = urlParts[1];
        const id = urlParts[2]?.split("?")[0];
        setEmbedUrl(`https://open.spotify.com/embed/${type}/${id}?utm_source=generator`);
        setUserInput("");
        setIsExpanded(false);
      } else {
        alert("Invalid Spotify Link.");
      }
    } catch {
      alert("Please paste a valid Spotify URL.");
    }
  };

  const loadPreset = (url) => setEmbedUrl(url);

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
          {isExpanded ? "Close" : "Change"}
        </button>
      </div>

      {/* Input Area */}
      {isExpanded && (
        <div style={styles.inputPanel}>
          <div style={styles.inputRow}>
            <input
              type="text"
              placeholder="Paste Spotify link..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleUpdateMusic} style={styles.confirmBtn}>
              <Check size={16} />
            </button>
          </div>

          <div style={styles.presetRow}>
            <PresetBtn label="Lo-Fi" onClick={() => loadPreset("https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM")} />
            <PresetBtn label="Piano" onClick={() => loadPreset("https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO")} />
            <PresetBtn label="Nature" onClick={() => loadPreset("https://open.spotify.com/embed/playlist/37i9dQZF1DX4PP3DA4J0N8")} />
            <PresetBtn label="White Noise" onClick={() => loadPreset("https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ")} />
          </div>
        </div>
      )}

      {/* Player */}
      <iframe
        src={embedUrl}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={styles.iframe}
      />
    </div>
  );
}

function PresetBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={styles.presetBtn}>
      {label}
    </button>
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
  backdropFilter: 'blur(12px)'
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

  inputPanel: {
    background: 'var(--bg-primary)',
    padding: '14px',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  inputRow: {
    display: 'flex',
    gap: '8px'
  },

  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem'
  },

  confirmBtn: {
    background: 'var(--button-gradient)',
    border: 'none',
    borderRadius: '10px',
    padding: '0 14px',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center'
  },

  presetRow: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto'
  },

  presetBtn: {
    background: 'var(--bg-secondary)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '6px 12px',
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },

  iframe: {
    width: '100%',
    height: '152px',
    borderRadius: '12px',
    border: 'none'
  }
};
