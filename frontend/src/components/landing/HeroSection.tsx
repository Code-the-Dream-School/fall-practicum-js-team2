import React from 'react';
import heartRoute from '../../assets/featured-heart-route.png';

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
                <div className="hero-image-card">
                <img src={heartRoute} alt="Heart GPS art route" className="hero-preview-image"/>
                <div className="hero-image-caption">
                    <span>Your Word: <strong>"Heart"</strong></span>
                    <span>Distance: 2.5 km </span>
                </div>
            </div>
            </div>
        </section>
    );
};