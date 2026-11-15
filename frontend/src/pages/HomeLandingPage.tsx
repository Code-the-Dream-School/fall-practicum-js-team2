import React from 'react';

import { HeroSection } from '../components/landing/HeroSection';
import { FeatureHighlights } from '../components/landing/FeatureHighlights';
import { HowItWorks } from '../components/landing/HowItWorks';

export const HomeLandingPage: React.FC = () => {
    return (
        <div className="landing-page">
            <header className="landing-header">
            <p className="app-brand-name">VanGo</p>
            </header>
            <main>
                <HeroSection />
                <FeatureHighlights />
                <HowItWorks />
            </main>
                
        </div>
    );
};
