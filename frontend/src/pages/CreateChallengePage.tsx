import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import "./CreateChallenge.css";
import { BackLink } from "../components/common/BackLink";
import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/common/Button";
import { BottomNav } from "../components/common/BottomNav";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const TOKEN_KEY = "vango_token";

const CHALLENGE_TYPES = ["Solo", "Private", "Public"] as const;
const CHALLENGE_DURATIONS = ["24 hours", "48 hours", "72 hours"] as const;
const VOTING_DURATIONS = ["6 hours", "12 hours", "24 hours"] as const;

type ChallengeType = (typeof CHALLENGE_TYPES)[number];

type CreatedGame = {
  id: number;
  lobbyName: string;
  privacy: "SOLO" | "PRIVATE" | "PUBLIC";
  joinCode: string | null;
  pictionaryWord: string;
};

function hoursFromLabel(label: string) {
  return Number(label.split(" ")[0]);
}

export function CreateChallengePage() {
  const navigate = useNavigate();
  const [challengeType, setChallengeType] = useState<ChallengeType>("Private");
  const [challengeDuration, setChallengeDuration] = useState<(typeof CHALLENGE_DURATIONS)[number]>("72 hours");
  const [votingDuration, setVotingDuration] = useState<(typeof VOTING_DURATIONS)[number]>("24 hours");
  const [playerLimit, setPlayerLimit] = useState(5);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdGame, setCreatedGame] = useState<CreatedGame | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate("/login");
      return;
    }

    const form = new FormData(event.currentTarget);
    const lobbyName = String(form.get("challengeName") ?? "").trim();
    const drawingPrompt = String(form.get("drawingPrompt") ?? "").trim();

    if (lobbyName.length < 3 || lobbyName.length > 50) {
      setFormError("Challenge name must be 3–50 characters.");
      return;
    }
    if (drawingPrompt && (drawingPrompt.length < 2 || drawingPrompt.length > 50)) {
      setFormError("Drawing prompt must be 2–50 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/games/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lobbyName,
          drawingPrompt: drawingPrompt || undefined,
          privacy: challengeType.toUpperCase(),
          gameDuration: hoursFromLabel(challengeDuration),
          voteDuration: hoursFromLabel(votingDuration),
          playerLimit,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        navigate("/login");
        return;
      }
      if (!response.ok || !result.data) {
        setFormError(result.message ?? result.error ?? "Could not create the lobby.");
        return;
      }

      setCreatedGame(result.data);
    } catch {
      setFormError("Can't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="create-challenge-page">
      <BackLink pathDestination="/home" pathName="Home" />

      <PageHeader
        title="Create a Challenge"
        subtitle="Pick a prompt and invite your friends."
      />

      {createdGame ? (
        <section className="create-success" role="status">
          <h2>Lobby created</h2>
          <p>
            {createdGame.lobbyName} is ready. The prompt is{" "}
            <strong>{createdGame.pictionaryWord}</strong>.
          </p>
          {createdGame.privacy === "PRIVATE" && createdGame.joinCode ? (
            <>
              <p>Share this code so friends can join.</p>
              <p className="create-join-code">{createdGame.joinCode}</p>
            </>
          ) : null}
          <Button className="create-lobby-button" onClick={() => navigate("/plan-route")}>
            Start drawing
          </Button>
          <button
            type="button"
            className="create-another-button"
            onClick={() => setCreatedGame(null)}
          >
            Create another
          </button>
        </section>
      ) : (
      <form className="create-challenge-form" onSubmit={handleSubmit}>
        {formError ? (
          <p className="create-form-error" role="alert">
            {formError}
          </p>
        ) : null}
        <label className="create-field">
          Challenge name
          <input
            type="text"
            name="challengeName"
            defaultValue="Weekend sketch walk"
          />
        </label>

        <label className="create-field">
          Drawing prompt
          <input type="text" name="drawingPrompt" defaultValue="Heart" />
        </label>

        <section className="settings-card" aria-labelledby="challenge-settings-title">
          <h2 id="challenge-settings-title">Challenge settings</h2>
          <p>Choose how your challenge works.</p>

          <fieldset className="option-group">
            <legend>Challenge type</legend>
            <div className="option-row">
              {CHALLENGE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={challengeType === type ? "chip chip-filled" : "chip"}
                  aria-pressed={challengeType === type}
                  onClick={() => setChallengeType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="option-group">
            <legend>Challenge duration</legend>
            <div className="option-row">
              {CHALLENGE_DURATIONS.map((duration) => (
                <button
                  key={duration}
                  type="button"
                  className={
                    challengeDuration === duration ? "chip chip-outline" : "chip"
                  }
                  aria-pressed={challengeDuration === duration}
                  onClick={() => setChallengeDuration(duration)}
                >
                  {duration}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="option-group">
            <legend>Voting duration</legend>
            <div className="option-row">
              {VOTING_DURATIONS.map((duration) => (
                <button
                  key={duration}
                  type="button"
                  className={
                    votingDuration === duration ? "chip chip-outline" : "chip"
                  }
                  aria-pressed={votingDuration === duration}
                  onClick={() => setVotingDuration(duration)}
                >
                  {duration}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="player-limit">
            <div>
              <p className="option-label">Player limit</p>
              <p className="player-limit-caption">Maximum players</p>
            </div>
            <div className="stepper">
              <button
                type="button"
                aria-label="Decrease maximum players"
                onClick={() =>
                  setPlayerLimit((count) => Math.max(2, count - 1))
                }
              >
                <MinusIcon size={16} weight="bold" />
              </button>
              <span>{playerLimit}</span>
              <button
                type="button"
                aria-label="Increase maximum players"
                onClick={() =>
                  setPlayerLimit((count) => Math.min(20, count + 1))
                }
              >
                <PlusIcon size={16} weight="bold" />
              </button>
            </div>
          </div>

          <p className="settings-note">
            Challenge countdown starts when the host starts.
          </p>
        </section>

        <Button type="submit" className="create-lobby-button" disabled={submitting}>
          {submitting ? "Creating lobby..." : "Create lobby"}
        </Button>
      </form>
      )}

      <BottomNav />
    </div>
  );
}
