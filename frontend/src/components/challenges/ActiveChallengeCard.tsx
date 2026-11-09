import React from 'react';

export interface Challenge {
    id: number | string;
    pictionaryWord: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    privacy: 'PUBLIC' | 'PRIVATE';
    endDate?: string;
    participantsCount?: number;
}

interface ActiveChallengeCardProps {
    challenge: Challenge;
    onSelect?: (id: number | string) => void;
}

export const ActiveChallengeCard: React.FC<ActiveChallengeCardProps> = ({
    challenge,
    onSelect,
}) => {
    return(
    <article className="active-challenge-card">
        <div className="challenge-card-header">
        <span className="challenge-badge">{challenge.status}</span>
        <span className="challenge-lobby">
            👥 {challenge.participantsCount ?? 1} players · {challenge.privacy === 'PUBLIC' ? 'Public' : 'Private'} lobby
        </span>
        </div>

        <div className="challenge-card-body">
        <h3 className="challenge-card-title">{challenge.pictionaryWord}</h3>
        <p className="challenge-prompt-text">
            Prompt: <strong>"{challenge.pictionaryWord}"</strong>
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