import React, {useState, useEffect } from 'react';
import './Challenges.css';
import {ActiveChallengeCard, type Challenge } from '../components/challenges/ActiveChallengeCard';



const MOCK_CHALLENGES: Challenge[] = [
    {
    id: 1,
    pictionaryWord: 'Heart',
    status: 'ACTIVE',
    privacy: 'PRIVATE',
    participantsCount: 5,
    },
    {
    id: 2,
    pictionaryWord: 'Star',
    status: 'ACTIVE',
    privacy: 'PUBLIC',
    participantsCount: 12,
    },
    {
    id: 3,
    pictionaryWord: 'Swan',
    status: 'ACTIVE',
    privacy: 'PRIVATE',
    participantsCount: 4,
    },
];

export const ChallengesPage: React.FC = () => {
    const [challenges, setChallenges] =
    useState<Challenge[]>(MOCK_CHALLENGES);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // This will attempt to fetch from backend API
        fetch('http://localhost:8080/api/games')
        .then((res) => {
            if (!res.ok) throw new Error('Failed to load challenges.');
            return res.json();
        })
        .then((data: Challenge[]) => {
            setChallenges(data);
            setError(null);
        })
        .catch((err) => {
            console.error(err);
            setError('Could not connect to the server. Showing offline mock challenges');
            setChallenges(MOCK_CHALLENGES);
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, []);

return (
    <div className="challenges-page">
        <header className="page-header">
            <p className="brand-logo">VanGo</p>
            <h1>Active Challenges</h1>
            <p className="page-subtitle">Pick a lobby and start drawing your route.</p>
        </header>

        {/* {challenge cards feed} */}
        <section className="challenges-feed">
            {isLoading && <p>Loading challenges...</p>}
            {error && <p className="error-banner">{error}</p>}
            {!isLoading && challenges.map((challenge) => (
                <ActiveChallengeCard key={challenge.id} challenge={challenge} />
            ))}
            
        </section>
        
        <nav aria-label="Main navigation"
        className="bottom-nav">
            <a href="/home">Home</a>
        <a href="/challenges" aria-current="page" className="active-link">Challenges</a>
        <a href="/profile">Profile</a>
        </nav>
    </div>
);

};