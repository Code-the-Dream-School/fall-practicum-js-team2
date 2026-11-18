import React from 'react';
import heartRoute from '../../assets/featured-heart-route.png';
import {Link} from "react-router-dom";

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
                    <Link to="/login" className="btn btn-primary">
                    Start Drawing Routes</Link>
                    <a href="#how-it-works" className="btn btn-secondary">Learn More</a>
                </div>
            </div>
            <div className="hero-preview">
                <div className="hero-image-card">
                <img src={heartRoute} alt="Heart GPS art route" className="hero-preview-image"/>
                <div className="hero-image-caption">
                    <span>Prompt: <strong>"Heart"</strong></span>
                    <span>Distance: 2.5 km </span>
                </div>
            </div>
            </div>
        </section>
    );
};