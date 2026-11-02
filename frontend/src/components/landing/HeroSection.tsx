import React from 'react';

export const HeroSection: React.FC = () => {
    return(
        <section id="home" className="hero-section">
            <div className="hero-content">
                <span className="badge">GPS Art & Social Running</span>
                <h1 className="hero-title">
                    Turn Every Step into a <span className="hero-highlight">Masterpiece</span>
                </h1>
                <p className="hero-subtitle">
                    VanGo transforms your walks, runs, and bike rides into GPS art. Complete Weekly creative prompts,
                    share routes with friends, and vote on the best design.
                </p>
                <div className="hero-actions">
                    <button className="btn btn-primary" type="button">Start Drawing Routes</button>
                    <a href="#how-it-works" className="btn btn-secondary">Learn More</a>
                </div>
            </div>
            <div className="hero-preview">
                <div className="hero-preview-box">
                <p>🗺️ GPS Route Preview / Map Mockup</p>
            </div>
            </div>
        </section>
    );
};