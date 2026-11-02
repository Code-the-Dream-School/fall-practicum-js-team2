import React from 'react';

export const FeatureHighlights: React.FC = () => {
    const features = [
        {
    icon: '📍',
    title: 'Real-time GPS Tracking',
    description: 'Track your route with live GPS coordinates and watch your path draw onto the map as you move.',
    },
    {
    icon: '👥',
    title: 'Group Drawing Challenges',
    description: 'Join groups and take on weekly prompts like animals, shapes, or letters with other members.',
    },
    {
    icon: '🗳️',
    title: 'Community Voting',
    description: 'Review submissions from group members, vote for your favorite routes, and check the leaderboard.',
    },
    ];
    return (
        <section id="features" className="features-section">
            <header className="section-header">
                <h2 className="section-title">Features</h2>
                <p className="section-subtitle">Turn your workouts into creative group art.</p>
            </header>
            <div className="features-grid">
                {features.map((feature, index) => (
                    <article key={index} className="feature-card">
                        <span className="feature-icon" role="img" aria-label={feature.title}>{feature.icon}</span>
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-description">{feature.description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
};