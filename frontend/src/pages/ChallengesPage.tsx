import React, {useState} from 'react';
import './Challenges.css';
import {ActiveChallengeCard, Challenge} from '../components/challenges/ActiveChallengeCard';


export const ChallengesPage: React.FC = () => {
    // active challenges mock data, will replace with API 
const [challenges] = useState<Challenge[]>([
    {
        id: '1',
        title: 'Weekend sketch walk',
        prompt: 'Draw a Heart',
        playerCount: 5,
        lobbyThpe: 'Private lobby',
        timeLeft: '2 day left',
    },
    {
        id: '2',
        title: 'City Center Run',
        prompt: 'Celestial Star',
        playerCount: 12,
        lobbyType: 'Public lobby',
        timeLeft: '5 hours left',
    },
    {
        id: '3',
        title: 'Campus Art Stroll',
        prompt: 'Origami swan',
        playerCount: 4,
        lobbyType: 'Private lobby',
        timeLeft: '3 days left',
    },
]);

const handleSelectChallenge = (id: string) =>
{
    console.log('Selected Challenge:', id);
    // this is where we can open GPS tracking/map once it is set up
};

return (
    <div className="challenges-page">
        <header className="page-header">
            <p className="brand-logo">VanGo</p>
            <h1>Active Challenges</h1>
            <p className="page-subtitle">Pick a lobby and start drawing your route.</p>
        </header>

        {/* {challenge cards feed} */}
        <section className="challenges-feed">
            {challenges.map((challenge) => (
                <ActiveChallengeCard
                key={challenge.id}
                challenge={challenge}
                onSelect={handleSelectChallenge}/>
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