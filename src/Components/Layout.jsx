import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header'; // Ensure Header is imported

export default function Layout({ children, user, onLogout }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="layout-wrapper">
            <Header
                onLogout={onLogout}
                user={user}
                onToggleMobileMenu={toggleMobileMenu}
                isMobileMenuOpen={isMobileMenuOpen}
            />

            <Sidebar
                isMobileMenuOpen={isMobileMenuOpen}
                onMobileClose={closeMobileMenu}
            />

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
