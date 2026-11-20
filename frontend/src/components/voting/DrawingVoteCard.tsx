import React from 'react';

export interface SubmittedDrawing {
    id: number | string;
    participantId: number;
    participantName: string;
    imageUrl: string;
    distanceKm?: string;
}

interface DrawingVoteCardProps {
    drawing: SubmittedDrawing;
    isSelected: boolean;
    onSelect: (id: number | string) => void;
}

export const DrawingVoteCard: React.FC<DrawingVoteCardProps> = ({
    drawing,
    isSelected,
    onSelect,
}) => {
    return (
        <article className={`drawing-vote-card ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(drawing.id)}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}>
            {/* Route Image Container */}
            <div className="drawing-image-container">
                <img src={drawing.imageUrl} alt={`GPS Route drawing by ${drawing.participantName}`} className="drawing-image"/>
                
            </div>
            {/* Card Footer */}
            <div className="drawing-card-footer">
                <div className="participant-info">
                    {/* <span className="participant-icon">👤</span> */}
                    <span className="participant-name">{drawing.participantName}</span>
                </div>
                {/* Checkmark Selector */}
                <div className={`vote-checkmark ${isSelected ? 'checked' : ''}`} aria-hidden="true">
                    {isSelected && (<svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
            </svg>)}
                </div>
            </div>


        </article>
    );
};