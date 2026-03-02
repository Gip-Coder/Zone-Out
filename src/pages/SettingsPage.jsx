import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <div style={pageStyle}>
            <h1 style={titleStyle}>Settings</h1>
            <p style={subStyle}>Customize your application experience.</p>

            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Appearance</h2>
                <div style={settingRowStyle}>
                    <div>
                        <div style={settingLabelStyle}>Theme</div>
                        <div style={settingDescStyle}>
                            Toggle between Dark and Light mode across the entire app.
                        </div>
                    </div>
                    <button onClick={toggleTheme} style={toggleBtnStyle(theme)}>
                        {theme === 'dark' ? (
                            <><Sun size={18} /> Light Mode</>
                        ) : (
                            <><Moon size={18} /> Dark Mode</>
                        )}
                    </button>
                </div>
            </div>

            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Account</h2>
                <p style={{ color: 'var(--text-secondary)' }}>More account settings coming soon.</p>
            </div>
        </div>
    );
}

// --- STYLES ---
const pageStyle = {
    padding: '32px',
    maxWidth: '720px',
    margin: '0 auto',
};

const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
};

const subStyle = {
    color: 'var(--text-secondary)',
    marginBottom: '32px',
};

const sectionStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--glass)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    marginBottom: '24px',
};

const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px',
    color: 'var(--text-primary)',
};

const settingRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderTop: '1px solid var(--glass)'
};

const settingLabelStyle = {
    fontSize: '16px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    marginBottom: '4px',
};

const settingDescStyle = {
    fontSize: '14px',
    color: 'var(--text-secondary)',
};

const toggleBtnStyle = (theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--btn-primary-bg)',
    color: 'var(--btn-primary-text)',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
    boxShadow: theme === 'light' ? '0 4px 15px rgba(124,58,237,0.3)' : 'none'
});
