import React from "react";
import { Button } from "../common/Button";
import heartImg from "../../assets/heart.jpg";
import starImg from "../../assets/Star.jpg";
import swanImg from "../../assets/swan.jpg";
import "./ChallengeLobbyCard.css"

export interface Challenge {
  id: number | string;
  lobbyName?: string;
  pictionaryWord: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  privacy: "PUBLIC" | "PRIVATE";
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  endDate?: string;
  participantsCount?: number;
  maxParticipants?: number;
}

interface ChallengeLobbyCardProps {
  challenge: Challenge;
  onSelect?: (id: number | string) => void;
  actionLabel?: string;
}

function formatEndDate(endDate: string) {
  const date = new Date(endDate);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PROMPT_IMAGES: Record<string, string> = {
  heart: heartImg,
  star: starImg,
  swan: swanImg,
};

export const ChallengeLobbyCard: React.FC<ChallengeLobbyCardProps> = ({
  challenge,
  onSelect,
  actionLabel = "View Lobby",
}) => {
  const normalizedWord = challenge.pictionaryWord.toLowerCase();
  const thumbnailImg = PROMPT_IMAGES[normalizedWord];
  const endsOn = challenge.endDate ? formatEndDate(challenge.endDate) : null;

  const playersText =
    challenge.participantsCount != null
      ? challenge.maxParticipants != null
        ? `${challenge.participantsCount}/${challenge.maxParticipants} players`
        : `${challenge.participantsCount} players`
      : null;
  const detailsText = [
    playersText,
    challenge.privacy === "PUBLIC" ? "Public lobby" : "Private lobby",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="challenge-lobby-card">
      <div className="challenge-lobby-card-header">
        <span className="challenge-lobby-card-badge">
          {challenge.difficulty ?? "EASY"}
        </span>
        <span className="challenge-lobby-card-details">{detailsText}</span>
      </div>

      {thumbnailImg && (
        <div className="challenge-lobby-card-shape-preview">
          <img
            src={thumbnailImg}
            alt={`${challenge.pictionaryWord} route preview`}
            className="challenge-lobby-card-thumbnail-image"
          />
        </div>
      )}

      {challenge.lobbyName && (
        <h3 className="challenge-lobby-card-name">{challenge.lobbyName}</h3>
      )}

      <div className="challenge-lobby-card-body">
        <p className="challenge-lobby-card-prompt-text">
          Prompt: <strong>"{challenge.pictionaryWord}"</strong>
        </p>
      </div>

      {endsOn && <p className="challenge-lobby-card-ends">Ends {endsOn}</p>}

      {/* No styles yet; hook for footer layout if more actions are added */}
      <div className="challenge-lobby-card-footer">
        <Button
          variant="primary"
          onClick={() => onSelect?.(challenge.id)}
        >
          {actionLabel}
        </Button>
      </div>
    </article>
  );
};
