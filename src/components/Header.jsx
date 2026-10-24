import React, { useState, useRef, useEffect, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import logoDark from '../assets/logo-dark.png';
import logoLight from '../assets/logo-light.png';
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
  LogOut,
} from 'lucide-react';


// navItems and placeholderItems moved to Sidebar.jsx

export default function Header({ onLogout, user, onToggleMobileMenu, isMobileMenuOpen }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  const theme = themeContext ? themeContext.theme : 'dark';

  useEffect(() => {
    const close = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserMenuOpen(false);
    onLogout?.();
    navigate('/');
  };

  const displayName = user?.name || user?.email || 'User';
  const initial = (displayName && displayName[0]) ? displayName[0].toUpperCase() : '?';

  return (
    <header style={headerStyle}>
      <div style={innerStyle}>
        <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="header-brand">
            <img
              src={theme === "light" ? logoLight : logoDark}
              alt="Zone Out Logo"
              className="header-logo"
            />
            <span className="header-title">Zone Out</span>
          </div>
        </NavLink>

        {/* Desktop nav removed - moved to Sidebar */}

        <div style={rightStyle}>
          {/* User bubble + dropdown */}
          <div ref={userMenuRef} style={userBubbleWrap}>
            <button
              type="button"
              aria-label="Account menu"
              style={userBubbleStyle}
              onClick={() => setUserMenuOpen((o) => !o)}
            >
              <span style={userBubbleInitial}>{initial}</span>
            </button>
            {userMenuOpen && (
              <div style={userDropdownStyle}>
                <div style={userDropdownHeader}>
                  <span style={userDropdownName}>{displayName}</span>
                  {user?.email && user.email !== displayName && (
                    <span style={userDropdownEmail}>{user.email}</span>
                  )}
                </div>
                <NavLink
                  to="/profile"
                  style={userDropdownItem}
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User size={16} />
                  Profile
                </NavLink>
                <button type="button" style={userDropdownItem} onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            className="header-menu-toggle"
            style={menuToggleStyle}
            onClick={onToggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}

const headerStyle = {
  position: 'fixed',
  top: '0px',
  left: '0px',
  zIndex: 1000,
  width: '100%',
  height: '70px',
  background: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--glass)',
  backdropFilter: 'blur(12px)',
};

const innerStyle = {
  height: '100%',
  padding: '0 24px 0 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '24px',
};

const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const menuToggleStyle = {
  display: 'none',
  background: 'none',
  border: 'none',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  padding: '8px',
};

const userBubbleWrap = { position: 'relative' };

const userBubbleStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '2px solid var(--glass)',
  background: 'var(--btn-primary-bg)',
  color: 'var(--btn-primary-text)',
  fontWeight: '700',
  fontSize: '16px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
};

const userBubbleInitial = { lineHeight: 1 };

const userDropdownStyle = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '8px',
  minWidth: '200px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--glass)',
  borderRadius: 'var(--radius-lg, 12px)',
  padding: '8px',
  boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const userDropdownHeader = {
  padding: '10px 12px',
  borderBottom: '1px solid var(--glass)',
  marginBottom: '4px',
};

const userDropdownName = {
  display: 'block',
  fontWeight: '600',
  color: 'var(--text-primary)',
  fontSize: '14px',
};

const userDropdownEmail = {
  display: 'block',
  fontSize: '12px',
  color: 'var(--text-secondary)',
  marginTop: '2px',
};

const userDropdownItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 12px',
  borderRadius: 'var(--radius-md, 8px)',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  fontWeight: '500',
  fontSize: '14px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
  transition: 'all 0.2s ease',
};

