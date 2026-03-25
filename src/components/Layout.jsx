import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header'; // Ensure Header is imported

export default function Layout({ children, user, onLogout }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Check if we are on a page that handles its own scrolling (like study-groups)
    const isCustomScrollRoute = location.pathname === '/study-groups';

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <Header
                onLogout={onLogout}
                user={user}
                onToggleMobileMenu={toggleMobileMenu}
                isMobileMenuOpen={isMobileMenuOpen}
            />

            <div className="app-layout">
                <Sidebar
                    isMobileMenuOpen={isMobileMenuOpen}
                    onMobileClose={closeMobileMenu}
                />

                {/* Spacer keeps sidebar width in flex flow so main-content centers properly */}
                <div className="sidebar-spacer" />

                <main className={`main-content ${isCustomScrollRoute ? 'overflow-hidden' : ''}`}>
                    <div className="content-center-wrapper">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}
