import "./HomeActiveChallengeCard.css";
import { Link } from "react-router-dom";

type HomeActiveChallengeCardProps = {
  title: string;
  playerCount: number;
  path: string;
  privacy: string;
};

export function HomeActiveChallengeCard({
  title,
  playerCount,
  path,
  privacy,
}: HomeActiveChallengeCardProps) {
  const playerLabel = playerCount === 1 ? "player" : "players";

  return (
    <Link to={path} className="home-active-challenge-card">
      <h3>{title}</h3>
      <p>
        {playerCount} {playerLabel} • {privacy}
      </p>
    </Link>
  );
}
