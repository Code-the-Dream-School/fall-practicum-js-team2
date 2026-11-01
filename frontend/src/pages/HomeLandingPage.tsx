import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureHighlights } from '../components/landing/FeatureHighlights';
import { HowItWorks } from '../components/landing/HowItWorks';

export const HomeLandingPage: React.FC = () => {
    return (
        <div className="landing-page">
            <HeroSection />
            <FeatureHighlights />
            <HowItWorks />
        </div>
    );
};
