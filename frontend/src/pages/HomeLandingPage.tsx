import React from 'react';
import {Navbar} from '../components/common/Navbar';
import {Footer} from '../components/common/Footer';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureHighlights } from '../components/landing/FeatureHighlights';
import { HowItWorks } from '../components/landing/HowItWorks';

export const HomeLandingPage: React.FC = () => {
    return (
        <div className="landing-page">
            <Navbar />
            <main>
                <HeroSection />
                <FeatureHighlights />
                <HowItWorks />
            </main>
            <Footer /> 
        </div>
    );
};
