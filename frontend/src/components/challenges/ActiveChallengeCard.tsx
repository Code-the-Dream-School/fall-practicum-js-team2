import React from 'react';

export interface Challenge {
    id: string;
    title: string;
    prompt: string;
    playerCount: number;
    lobbyType: 'Private lobby' | 'Public lobby';
    timeLeft: string;
}

interface ActiveChallengeCardProps {
    challenge: Challenge;
    onSelect?: (id: string) => void;
}

export const ActiveChallengeCard: React.FC<ActiveChallengeCardProps> = ({
    challenge,
    onSelect,
}) => {
    return(
    <article className="active-challenge-card">
        <div className="challenge-card-header">
        <span className="challenge-badge">{challenge.timeLeft}</span>
        <span className="challenge-lobby">
            👥 {challenge.playerCount} players · {challenge.lobbyType}
        </span>
        </div>
        <div className="challenge-card-body">
        <h3 className="challenge-card-title">{challenge.title}</h3>
        <p className="challenge-prompt-text">
            Prompt: <strong>"{challenge.prompt}"</strong>
        </p>
        </div>
        <div className="challenge-card-footer">
        <button
            type="button"
            className="challenge-action-btn"
            onClick={() => onSelect?.(challenge.id)}
        >
            Draw Route 📍
        </button>
        </div>
    </article>
    );
};