import React from 'react';

export interface SubmittedDrawing {
    id: number | string;
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
                {drawing.distanceKm && (<span className="drawing-distance-pill">📍 {drawing.distanceKm}</span>)}
            </div>
            {/* Card Footer */}
            <div className="drawing-card-footer">
                <div className="participant-info">
                    <span className="participant-icon">👤</span>
                    <span className="participant-name">{drawing.participantName}</span>
                </div>
                {/* Toogle Switch */}
                <div className={`vote-toggle ${isSelected ? 'toggle-active' : ''}`}>
                    <div className="toggle-thumb"/>
                </div>
            </div>


        </article>
    );
};