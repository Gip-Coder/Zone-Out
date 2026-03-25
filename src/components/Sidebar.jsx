import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Book, Layers, TrendingUp, Users, FolderOpen, Settings, User, ChevronLeft, ChevronRight } from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/timeline', label: 'Timeline', icon: ListTodo },
    { path: '/course-vault', label: 'Course Vault', icon: Book },
    { path: '/study-groups', label: 'Study Groups', icon: Users },
];

const placeholderItems = [
    { path: '/flashcards', label: 'Flashcards', icon: Layers },
    { path: '/progress', label: 'Progress', icon: TrendingUp },
    { path: '/resources', label: 'Resources', icon: FolderOpen },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ isMobileMenuOpen, onMobileClose }) {
    const containerClass = `sidebar-container ${isMobileMenuOpen ? 'mobile-open' : 'mobile-closed'}`;

    return (
        <>
            <div className={containerClass}>
                <nav className="sidebar-nav custom-scrollbar">
                    <div className="nav-group">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <NavLink
                                key={path}
                                to={path}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={onMobileClose}
                            >
                                <Icon size={20} className="sidebar-icon" />
                                <span className="sidebar-label">{label}</span>
                            </NavLink>
                        ))}
                    </div>

                    <div className="nav-divider" />

                    <div className="nav-group" style={{ marginBottom: '80px' }}>
                        {placeholderItems.map(({ path, label, icon: Icon }) => (
                            <NavLink
                                key={path}
                                to={path}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={onMobileClose}
                            >
                                <Icon size={18} className="sidebar-icon" />
                                <span className="sidebar-label">{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </div>

            <div
                className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={onMobileClose}
                aria-hidden="true"
            />
        </>
    );
}
