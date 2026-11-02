import React from 'react';

export const HowItWorks: React.FC = () => {
    const steps = [
        {
    step: '1',
    title: 'Pick a Prompt',
    description: 'Select an active drawing challenge from your group or pick your own custom shape.',
    },
    {
    step: '2',
    title: 'Move & Track',
    description: 'Start your walk or run. Your GPS trace maps out your drawing on city streets.',
    },
    {
    step: '3',
    title: 'Submit & Vote',
    description: 'Share your route with your group and vote on your favorites.',
    },
    ];

    return (
        <section id="how-it-works" className="how-it-works-section">
            <header className="section-header">
                <h2 className="section-title">How It Works</h2>
                <p className="section-subtitle">Three steps to your first GPS masterpiece.</p>
            </header>
            <div className="steps-grid">
                {steps.map((item) => (
                    <article key={item.step} className="step-card">
                        <span className="step-number">{item.step}</span>
                        <h3 className="step-title">{item.title}</h3>
                        <p className="step-description">{item.description}</p>
                    </article>
                ))}
            </div>
        </section>
    );
};