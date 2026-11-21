import React, {useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import './Challenges.css';
import {ActiveChallengeCard, type Challenge } from '../components/challenges/ActiveChallengeCard';
import {BottomNav} from '../components/common/BottomNav';
import {BackLink} from '../components/common/BackLink';
import { Button } from '../components/common/Button';
import { PageHeader } from '../components/common/PageHeader';

const MOCK_CHALLENGES: Challenge[] = [
    {
    id: 1,
    pictionaryWord: 'Heart',
    status: 'ACTIVE',
    privacy: 'PRIVATE',
    difficulty: 'EASY',
    participantsCount: 5,
    },
    {
    id: 2,
    pictionaryWord: 'Star',
    status: 'ACTIVE',
    privacy: 'PUBLIC',
    difficulty: 'MEDIUM',
    participantsCount: 5,
    },
    {
    id: 3,
    pictionaryWord: 'Swan',
    status: 'ACTIVE',
    privacy: 'PRIVATE',
    difficulty: 'HARD',
    participantsCount: 4,
    },
];

export const ChallengesPage: React.FC = () => {
    const navigate = useNavigate();
    const [challenges, setChallenges] =
    useState<Challenge[]>(MOCK_CHALLENGES);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const API_Base = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
        // This will attempt to fetch from backend API
        fetch(`${API_Base}/api/games`)
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

    const handleSelectChallenge = (id: number | string) => {
        navigate(`/challenges/${id}/lobby`);
    };

return (
    <div className="challenges-page">
        <BackLink pathDestination='/challenges/join' pathName='Join a Challenge'/>
        <PageHeader title="Active Challenges" subtitle="Pick a lobby and start drawing your route."/>

        {/* {challenge cards feed} */}
        <section className="challenges-feed">
            {isLoading && <p>Loading challenges...</p>}
            {error && <p className="error-banner">{error}</p>}

            {/* Empty State */}
            {!isLoading && challenges.length === 0 && (
                <div className="no-challenges">
                    <p>No active challenges at the moment.</p>
                    <Button className="challenge-action-btn" onClick={() => navigate('/home')}>
                        Browse or Create a Challenge
                    </Button>
                </div>
            )}
            {/* Pass onSelect to challenge card */}
            {!isLoading && challenges.map((challenge) => (
                <ActiveChallengeCard key={challenge.id} challenge={challenge} onSelect={handleSelectChallenge}/>
            ))}
            
        </section>

        <BottomNav/> 

    </div>
);

};