import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  Book,
  Timer,
  Music,
  Bot,
  Layers,
  TrendingUp,
  Users,
  FolderOpen,
  Settings,
  User,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';


const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/timeline', label: 'Timeline', icon: ListTodo },
  { path: '/course-vault', label: 'Course Vault', icon: Book },
  { path: '/timer', label: 'Focus Timer', icon: Timer },
  { path: '/music', label: 'Music', icon: Music },
  { path: '/ai', label: 'AI Assistant', icon: Bot },
];

const placeholderItems = [
  { path: '/flashcards', label: 'Flashcards', icon: Layers },
  { path: '/progress', label: 'Progress', icon: TrendingUp },
  { path: '/study-groups', label: 'Study Groups', icon: Users },
  { path: '/resources', label: 'Resources', icon: FolderOpen },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/profile', label: 'Profile', icon: User },
];

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md, 8px)',
  color: 'var(--text-secondary, rgba(255,255,255,0.7))',
  textDecoration: 'none',
  fontWeight: '500',
  fontSize: '14px',
  transition: 'all 0.2s ease',
};

const activeStyle = {
  ...linkStyle,
  color: '#fff',
  background: 'var(--button-gradient, linear-gradient(135deg, #7c3aed, #a78bfa))',
  boxShadow: 'var(--glow-soft, 0 4px 14px rgba(124,58,237,0.35))',
};

export default function Header({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout?.();
    navigate('/');
  };

  return (
    <header style={headerStyle}>
      <div style={innerStyle}>
        <NavLink to="/" style={logoStyle}>
          <span style={logoText}>ZoneOut</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="header-desktop-nav" style={navStyle}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => (isActive ? activeStyle : linkStyle)}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <div style={dropdownWrap}>
            <button
              type="button"
              style={{ ...linkStyle, border: 'none', background: 'none', cursor: 'pointer' }}
              onClick={() => setShowMore(!showMore)}
            >
              More <ChevronDown size={16} style={{ opacity: showMore ? 1 : 0.7 }} />
            </button>
            {showMore && (
              <div style={dropdownStyle}>
                {placeholderItems.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    style={({ isActive }) => (isActive ? activeStyle : linkStyle)}
                    onClick={() => { setShowMore(false); setMenuOpen(false); }}
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div style={rightStyle}>
          <button
            type="button"
            onClick={handleLogout}
            style={logoutBtnStyle}
          >
            Logout
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            className="header-menu-toggle"
            style={menuToggleStyle}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="header-mobile-nav" style={mobileNavStyle}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => (isActive ? activeStyle : linkStyle)}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', paddingTop: '8px' }}>
            {placeholderItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                style={({ isActive }) => (isActive ? activeStyle : linkStyle)}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

const headerStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: 'var(--bg-secondary, rgba(22,22,28,0.95))',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(12px)',
};

const innerStyle = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '12px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '24px',
};

const logoStyle = {
  textDecoration: 'none',
  color: 'var(--text-primary, #fff)',
  fontWeight: '700',
  fontSize: '20px',
};

const logoText = {
  background: 'var(--button-gradient, linear-gradient(135deg, #7c3aed, #a78bfa))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  flex: 1,
  justifyContent: 'center',
};

const dropdownWrap = {
  position: 'relative',
};

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: '4px',
  minWidth: '180px',
  background: 'var(--bg-secondary, rgba(28,28,36,0.98))',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 'var(--radius-lg, 12px)',
  padding: '8px',
  boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const logoutBtnStyle = {
  background: 'var(--button-gradient)',
  border: 'none',
  padding: '8px 16px',
  borderRadius: 'var(--radius-md, 8px)',
  color: '#fff',
  fontWeight: '600',
  cursor: 'pointer',
  fontSize: '14px',
};

const menuToggleStyle = {
  display: 'none',
  background: 'none',
  border: 'none',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  padding: '8px',
};

const mobileNavStyle = {
  display: 'flex',
  flexDirection: 'column',
  padding: '16px 24px',
  gap: '4px',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  background: 'rgba(0,0,0,0.2)',
};

