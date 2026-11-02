import React from 'react';

export const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <div className="nav-container">
                <a href="#home" className="nav-logo">
                    <span className="logo-icon">🎨</span> Van<span 
                    className="logo-highlight">Go</span>
                </a>
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How It Works</a>
                    <a href="#challenges">Challenges</a>
                </div>
                <div className="nav-actions">
                    <button className="btn btn-secondary">Sign In</button>
                    <button className="btn btn-primary">Get Started</button>
                </div>
            </div>
        </nav>
    );
};