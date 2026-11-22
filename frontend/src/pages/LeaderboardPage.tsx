import React, {useState} from "react";//add useEffect when backend is ready
import {useParams} from 'react-router-dom';
import './Leaderboard.css';
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
    const [participants] = useState<LeaderboardEntry[]>([ //add setParticipants when backend ready
        {
            participantId: 10,
            participantName: 'Andrey',
            votes: 5,
            rank: 1,
        },
        {
            participantId: 15,
            participantName: 'Tonny',
            votes: 4,
            rank: 2,  
        },
        {
            participantId: 22,
            participantName: 'Tanis',
            votes: 3,
            rank: 3,
        },
        {
            participantId: 30,
            participantName: 'Edward',
            votes: 2,
            rank: 4,
        },
        {
        participantId: 29,
            participantName: 'Arturo C.',
            votes: 1,
            rank: 5,
        },      
    ]);
    // Backend useEffect 
    /* useEffect(() => {
        async function fetchLeaderboard() {
            try { const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
            const token = localStorage.getItem("vango_token");
            const response = await fetch(`${API_BASE}/api/games/${id ?? '1'}/votes`,
            { headers: { Authorization: `Bearer ${token}`, },});
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                
            const mapped: 
                LeaderboardEntry[] = result.data.map((item: any, index: number) => ({
                    participantId: item.id, participantName: item.user.name, votes: item._count.received, rank: index + 1,
                }));
            setParticipants(mapped);
            }
        }
        catch(error){
            console.error('Error fetching leaderboard data:', error);
        }
        }
        fetchLeaderboard();
    }, [id]);
    */

    // Obtaining top 3 participants for podium
    const firstPlace = participants.find((p) => p.rank === 1);
    const secondPlace = participants.find((p) => p.rank === 2);
    const thirdPlace = participants.find((p) => p.rank === 3);

    return (
        <div className="leaderboard-page">
            {/* backlink */}
            <BackLink pathDestination={`/challenges/${id ?? '1'}/vote`} pathName="Vote" />
            {/* header, challenge name, and final result */}
            <div className="leaderboard-header">
                <PageHeader title={`Draw a ${promptWord}`} subtitle={challengeTitle}/>
                <h2 className="results-heading">Final results</h2>
            </div>
            {/* podium */}
            <section className="podium-section" aria-label="Top 3 Winner">
                {secondPlace && (
                <div className="podium-column podium-second">
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