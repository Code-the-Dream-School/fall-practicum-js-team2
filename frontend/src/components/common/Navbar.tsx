import React from 'react';
import { Button } from './Button';

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
                    <Button className="btn btn-secondary" href="/login">Sign In</Button>
                    <Button className="btn btn-primary" href="/login">Get Started</Button>
                </div>
            </div>
        </nav>
    );
};