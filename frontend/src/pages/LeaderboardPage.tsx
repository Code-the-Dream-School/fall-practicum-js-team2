import React, {useState} from "react";
import {useParams} from 'react-router-dom';
import { BackLink } from "../components/common/BackLink";
import { PageHeader } from "../components/common/PageHeader";
import { ButtonLink } from "../components/common/ButtonLink";
import { BottomNav } from "../components/common/BottomNav";

// backend interface
export interface LeaderboardEntry {
    participantId: number;
    participantName: string;
    votes: number;
    rank: number;
}

export const LeaderboardPage: React.FC = () => {
    const {id} = useParams<{ id: string }>();

    const [challengeTitle] = useState<string>
    ('Weekend sketch walk');
    const [promptWord] = useState<string>('Heart');

    // Mock rankings for testing
    const [participants] = useState<LeaderboardEntry[]>([
        {
            participantId: 10,
            participantName: 'Arturo C.',
            votes: 12,
            rank: 1,
        },
        {
            participantId: 15,
            participantName: 'Tonny',
            votes: 8,
            rank: 2,  
        },
        {
            participantId: 22,
            participantName: 'Tanis',
            votes: 5,
            rank: 3,
        },
        {
            participantId: 30,
            participantName: 'Edward',
            votes: 3,
            rank: 4,
        },
    ]);

    // Obtaining top 3 participants for podium
    const firstPlace = participants.find((p) => p.rank === 1);
    const secondPlace = participants.find((p) => p.rank === 2);
    const thirdPlace = participants.find((p) => p.rank === 3);

    return (
        <div className="leaderboard-page">
            {/* backlink */}
            <BackLink pathDestination="={`/challenges/${id ?? '1'}/vote`} pathName="Vote" />
            {/* header, challenge name, and final result */}
            <div className="leaderboard-header">
                <PageHeader title={`Draw a ${promptWord}`} subtitle={challengeTitle}/>
                <h2 className="results-heading">Final results</h2>
            </div>
            {/* podium */}
            <section className="podium-section" aria-label="Top 3 Winner">
                {secondPlace && (
                <div className="podium-column podium second">
                    <span className="podium-rank">2nd</span>
                    <span className="podium-name">{secondPlace.participantName}</span>
                    <span className="podium-votes">{secondPlace.votes} votes</span>
                </div>
                )}
                {firstPlace && (
                <div className="podium-column podium-first">
                    <span className="podium-rank">1st</span>
                    <span className="podium-name">{firstPlace.participantName}</span>
                    <span className="podium-votes">{firstPlace.votes} votes</span>
                </div>
                )}
                {thirdPlace && (
                <div className="podium-column podium-third">
                    <span className="podium-rank">3rd</span>
                    <span className="podium-name">{thirdPlace.participantName}</span>
                    <span className="podium-votes">{thirdPlace.votes} votes</span>
                </div>
                )}

            </section>

            {/* Horizontal rows for all participants */}
            <section className="participants-list" aria-label="All Participants Ranking">
                {participants.map((participant) => (
                    <div key={participant.participantId} className="participant-row">
                        <span className="participant-rank">#{participant.rank}</span>
                        <span className="participant-name">{participant.participantName}</span>
                        <span className="participant-votes">{participant.votes} votes</span>
                    </div>
                ))}
            </section>
            {/* Play Again button */}
            <div className="leaderboard-actions-bar">
                <ButtonLink text="Play again" variant="primary" path="/home" />
            </div>

            <BottomNav />
        </div>
    );
};