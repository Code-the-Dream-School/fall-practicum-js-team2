import React, {useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Voting.css';
import { BackLink } from '../components/common/BackLink';
import { BottomNav } from '../components/common/BottomNav';
import { DrawingVoteCard, type SubmittedDrawing } from '../components/voting/DrawingVoteCard';

// sample submitted routes using assets img for testing
import heartImg from '../assets/featured-heart-route.png';
import starImg from '../assets/featured-heart-route.png';
import swanImg from '../assets/featured-heart-route.png';

export const VotingPage: React.FC = () => {
    const {id} = useParams<{ id: string}>();
    const navigate = useNavigate();

    const [challengeTitle] = useState<string>('Weekend sketch walk');
    const [promptWord] = useState<string>('Heart');
    const [selectedDrawingId, setSelectedDrawingId] = useState<number | string | null>(null);
    const [hasVoted, setHasVoted] = useState<boolean>(false);

    const [timeLeft, setTimeLeft] = useState<number>(300);

    // sample drawings

    const [drawings] = useState<SubmittedDrawing[]>
    ([
        {
            id: 1,
            participantName: 'Arturo C.',
            imageUrl: heartImg,
            distanceKm: '2.4 km',
        },
        {
            id: 2,
            participantName: 'Edwarb B.',
            imageUrl: starImg,
            distanceKm: '3.1 km',
        },
        {
            id: 3,
            participantName: 'Frank S.',
            imageUrl: swanImg,
            distanceKm: '2.8 km',
        },
    ]);

    // Live Countdown
    useEffect(() => {
        if(timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return ()=> clearInterval(timer);
    }, [timeLeft]);

    // format time into MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    };
    const handleToggleSelect = (drawingId: number | string) => {
        if (hasVoted) return;
        //selecting same card deselects, otherwise selects the new one
        setSelectedDrawingId((prev) => (prev === drawingId ? null : drawingId));
    };

    const handleSubmitVote = () => {
        if (!selectedDrawingId) return;

        // this should have it ready for backend POST api
        console.log(`Vote submitted for drawing #${selectedDrawingId} in game #${id ?? '1'}`);
        setHasVoted(true);

        // Navigate to leaderboard after voting
        setTimeout(() => {
            navigate(`/challenges/${id ?? '1'}/leaderboard`);
        }, 800);
    };

    return (
        <div className="voting-page">
            <BackLink pathDestination="/challenges" pathName="Vote"/>
        
        {/* challenge title and prompt */}
        <header className="voting-header">
            <h1>Which route looks most like a {promptWord}?</h1>
            <h2 className="challenge-title">{challengeTitle}</h2>
        </header>

            {/* submissions cards */}
        <section className="drawings-grid">
            {drawings.map((drawing) => (
                <DrawingVoteCard
                key={drawing.id}
                drawing={drawing}
                isSelected={selectedDrawingId === drawing.id}
                onSelect={handleToggleSelect}/>
            ))}
        </section>

        {/* timer and timer title*/}
        <div className="voting-status-section">
            <p className="voting-subtitle">Vote for your favorite drawing before time expires.</p>

            <div className={`voting-time-banner ${timeLeft <60 ? 'timer-urgent' : ''}`}>
                {/* <span className="timer-icon">⏳</span> */}
                <span>Time Remaining to Vote: <strong>{formatTime(timeLeft)}</strong></span>
            </div>
        </div>

        

        {/* Vote button */}
        <div className="voting-actions-bar">
            <button type="button" className="challenge-action-btn" disabled={!selectedDrawingId || hasVoted || timeLeft === 0}
            onClick={handleSubmitVote}>
                {hasVoted ? 'Vote Submitted!' : 'Submit Vote'}
            </button>
        </div>

        <BottomNav />
        </div>
    );
};
