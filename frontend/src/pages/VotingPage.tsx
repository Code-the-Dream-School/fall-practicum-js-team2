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

// Button and header components
import {PageHeader} from '../components/common/PageHeader';
import {Button} from '../components/common/Button';

// Mock timestamps for development
const MOCK_VOTING_ENDS_AT = new Date(Date.now() + 5 * 60 * 1000);
const MOCK_DRAWING_ENDS_AT = new Date(Date.now() - 1000);

export const VotingPage: React.FC = () => {
    const {id} = useParams<{ id: string}>();
    const navigate = useNavigate();

    const [challengeTitle] = useState<string>('Weekend sketch walk');
    const [promptWord] = useState<string>('Heart');
    const [selectedDrawingId, setSelectedDrawingId] = useState<number | string | null>(null);
    const [hasVoted, setHasVoted] = useState<boolean>(false);
    const [currentParticipantId] = useState<number>(10);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);

    // Timestamps ready for backend
    const [drawingEndsAt] = useState<Date>(MOCK_DRAWING_ENDS_AT);
    const [votingEndsAt] = useState<Date>(MOCK_VOTING_ENDS_AT);

    const [timeLeft, setTimeLeft] = useState<number>(() => {
        const diff = Math.floor((MOCK_VOTING_ENDS_AT.getTime() - Date.now()) / 1000);
        return diff > 0 ? diff : 0;
    });

    // checking if voting has started
    const isVotingOpen = drawingEndsAt.getTime() <= votingEndsAt.getTime();

    // Live Timer
    useEffect(() => {
        const timer = setInterval(() => {
            const diff = Math.floor((votingEndsAt.getTime() - Date.now()) / 1000);
            const remaining = diff > 0 ? diff : 0;
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [votingEndsAt]);

    // format time 
    const formatTime = (totalSeconds: number) => {
        if (totalSeconds <= 0) return '00:00 (Voting Closed)';
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
        }
        return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    };

    // sample drawings

    const [drawings] = useState<SubmittedDrawing[]>
    ([
        {
            id: 1,
            participantId: 10,
            participantName: 'Arturo C.',
            imageUrl: heartImg,
            distanceKm: '2.4 km',
        },
        {
            id: 2,
            participantId: 15,
            participantName: 'Tonny',
            imageUrl: starImg,
            distanceKm: '3.1 km',
        },
        {
            id: 3,
            participantId: 22,
            participantName: 'Tanis',
            imageUrl: swanImg,
            distanceKm: '2.8 km',
        },
    ]);

    const handleToggleSelect = (drawingId: number | string) => {
        if (hasVoted) return;
        //Prevent voting for your own drawing
        const clickedDrawing = drawings.find((d) => d.id === drawingId);
        if (clickedDrawing?.participantId === currentParticipantId) {
            setWarningMessage("You cannot vote for your own drawing.");
            //clear message after 3 sec
            setTimeout(() => setWarningMessage(null), 3500);
            return;
        }
        //Clear any previous warning
        setWarningMessage(null);
        
        //selecting same card deselects, otherwise selects the new one
        setSelectedDrawingId((prev) => (prev === drawingId ? null : drawingId));
    };

    const handleSubmitVote = () => {
        if (!selectedDrawingId) return;

        const selectedDrawing = drawings.find((d) => d.id === selectedDrawingId);
        if (!selectedDrawing) return;

        console.log(`Casting vote in game #${id ?? '1'} : targetParticipantId is ${selectedDrawing.participantId} (${selectedDrawing.participantName})`);

        // fetch call once backend is ready this will replace above console.log
        // const response = await
        // fetch(`/api/games/${id}/vote`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         Authorization: `Bearer ${token}`,
        //     },
        //     body: JSON.stringify({
        //         targetParticipantId: selectedDrawing.participantId,
        //     }),
        // });

        setHasVoted(true);

        setTimeout(() => {navigate(`/challenges/${id ?? '1'}/leaderboard`);
    }, 800);
    };

    return (
        <div className="voting-page">
            <BackLink pathDestination="/YourActivity" pathName="Your activity"/>
        
        {/* challenge title and prompt */}
        <div className="voting-header">
            <PageHeader title={`Which route looks most like a ${promptWord}?`} 
            subtitle={challengeTitle}/>
        </div>
        
        {!isVotingOpen ? (
            <div className="voting-phase-guard">
                <div className="phase-guard-card">
                    <h3>Drawing Phase in Progress</h3>
                    <p>Participants are currently drawing their routes.</p>
                    <p className="phase-note">Voting opens as soon as the challenge timer runs out!</p>
                </div>
                </div>):(
            <>
            {/* In-app warning banner */}
        {warningMessage && (
            <div className="voting-warning-banner" role="alert">
                <span>⚠️</span>
                <span>{warningMessage}</span>
            </div>
            )}

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
            <Button type="button" className="challenge-action-btn" disabled={!selectedDrawingId || hasVoted || timeLeft === 0}
            onClick={handleSubmitVote}>
                {hasVoted ? 'Vote Submitted!' : 'Submit Vote'}
            </Button>
        </div>
        </>
                )}

        <BottomNav />
        </div>
    );
};
