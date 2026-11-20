import React from "react";
import { Button } from "../common/Button";
import heartImg from "../../assets/heart.jpg";
import starImg from "../../assets/Star.jpg";
import swanImg from "../../assets/swan.jpg";

export interface Challenge {
  id: number | string;
  pictionaryWord: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  privacy: "PUBLIC" | "PRIVATE";
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  endDate?: string;
  participantsCount?: number;
}

interface ChallengeLobbyCardProps {
  challenge: Challenge;
  onSelect?: (id: number | string) => void;
}

const PROMPT_IMAGES: Record<string, string> = {
  heart: heartImg,
  star: starImg,
  swan: swanImg,
};

export const ChallengeLobbyCard: React.FC<ChallengeLobbyCardProps> = ({
  challenge,
  onSelect,
}) => {
  const normalizedWord = challenge.pictionaryWord.toLowerCase();
  const thumbnailImg = PROMPT_IMAGES[normalizedWord];

  return (
    <article className="active-challenge-card">
      <div className="challenge-card-header">
        <span className="challenge-badge">
          {challenge.difficulty ?? "EASY"}
        </span>
        <span className="challenge-lobby">
          {challenge.participantsCount ?? 1} players ·{" "}
          {challenge.privacy === "PUBLIC" ? "Public" : "Private"} lobby
        </span>
      </div>

      {thumbnailImg && (
        <div className="challenge-shape-preview">
          <img
            src={thumbnailImg}
            alt={`${challenge.pictionaryWord} route preview`}
            className="challenge-thumbnail-image"
          />
        </div>
      )}

      <div className="challenge-card-body">
        {/* <h3 className="challenge-card-title">{challenge.pictionaryWord}</h3>   */}
        <p className="challenge-prompt-text">
          Prompt: <strong>"{challenge.pictionaryWord}"</strong>
        </p>
      </div>

      <div className="challenge-card-footer">
        <Button
          variant="primary"
          onClick={() => onSelect?.(challenge.id)}
        >
          View Lobby
        </Button>
      </div>
    </article>
  );
};
