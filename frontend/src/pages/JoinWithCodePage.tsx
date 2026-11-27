import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./JoinWithCode.css";
import {
  ChallengeLobbyCard,
  type Challenge,
} from "../components/challenges/ChallengeLobbyCard";
import { BackLink } from "../components/common/BackLink";
import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/common/Button";
import { BottomNav } from "../components/common/BottomNav";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const TOKEN_KEY = "vango_token";

type ApiGame = {
  id: number;
  lobbyName: string;
  pictionaryWord: string;
  status: Challenge["status"];
  privacy: "PUBLIC" | "PRIVATE" | "SOLO";
  endDate: string;
  maxParticipants: number;
  participants?: unknown[];
};

export function JoinWithCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState("");
  const [joinError, setJoinError] = useState("");
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);
  const [foundGame, setFoundGame] = useState<ApiGame | null>(null);
  const [joined, setJoined] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  function requireToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate("/login");
      return null;
    }
    return token;
  }

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setJoinError("");
    setFoundGame(null);
    setJoined(false);
    setAlreadyJoined(false);

    const joinCode = code.trim().toUpperCase();
    if (!joinCode) {
      setFormError("Enter the invite code from your friend.");
      return;
    }

    const token = requireToken();
    if (!token) return;

    setSearching(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/games/code/${encodeURIComponent(joinCode)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        navigate("/login");
        return;
      }
      if (response.status === 404) {
        setFormError(
          "We couldn't find a lobby with that code. Check the code and try again.",
        );
        return;
      }
      if (!response.ok || !result.data) {
        setFormError(
          result.message ?? result.error ?? "Could not look up that code.",
        );
        return;
      }

      setFoundGame(result.data);
    } catch {
      setFormError("Can't reach the server. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  }

  async function handleJoin() {
    if (!foundGame || joining) return;

    const token = requireToken();
    if (!token) return;

    setJoining(true);
    setJoinError("");
    try {
      const response = await fetch(`${API_BASE}/api/games/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId: foundGame.id,
          joinCode: code.trim().toUpperCase(),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        navigate("/login");
        return;
      }
      if (!response.ok) {
        const message =
          result.message ?? result.error ?? "Could not join this challenge.";
        if (message.toLowerCase().includes("already in this game")) {
          setAlreadyJoined(true);
        } else {
          setJoinError(message);
        }
        return;
      }

      setJoined(true);
    } catch {
      setJoinError("Can't reach the server. Check your connection and try again.");
    } finally {
      setJoining(false);
    }
  }

  function reset() {
    setCode("");
    setFormError("");
    setJoinError("");
    setFoundGame(null);
    setJoined(false);
    setAlreadyJoined(false);
  }

  const foundChallenge: Challenge | null =
    foundGame && foundGame.privacy !== "SOLO"
      ? {
          id: foundGame.id,
          lobbyName: foundGame.lobbyName,
          pictionaryWord: foundGame.pictionaryWord,
          status: foundGame.status,
          privacy: foundGame.privacy === "PRIVATE" ? "PRIVATE" : "PUBLIC",
          endDate: foundGame.endDate,
          maxParticipants: foundGame.maxParticipants,
          participantsCount: foundGame.participants?.length,
        }
      : null;

  return (
    <div className="join-code-page">
      <BackLink pathDestination="/challenges/join" pathName="Join a Challenge" />

      <PageHeader
        title="Join with a Code"
        subtitle="Private lobbies are invite-only. Enter the code your friend shared with you."
      />

      {joined || alreadyJoined ? (
        <section className="join-code-success" role="status">
          <h2>{foundGame?.lobbyName}</h2>
          <p>
            {alreadyJoined
              ? "You're already in this lobby. "
              : "You joined this lobby. "}
            The prompt is <strong>{foundGame?.pictionaryWord}</strong> — time
            to walk your drawing.
          </p>
          <Button
            className="join-code-success-button"
            onClick={() => navigate("/plan-route")}
          >
            Start drawing
          </Button>
          <button
            type="button"
            className="join-code-another-button"
            onClick={reset}
          >
            Use a different code
          </button>
        </section>
      ) : (
        <>
          <form className="join-code-form" onSubmit={handleLookup}>
            {formError && (
              <p className="join-code-error" role="alert">
                {formError}
              </p>
            )}
            <label className="join-code-field">
              Invite code
              <input
                type="text"
                name="joinCode"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="e.g. A1B2C3"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
              />
            </label>
            <Button
              type="submit"
              variant="primary"
              className="join-code-lookup-button"
              disabled={searching}
            >
              {searching ? "Looking up..." : "Find lobby"}
            </Button>
          </form>

          {foundChallenge && (
            <section className="join-code-result">
              <h2 className="join-code-result-title">We found this lobby</h2>
              {joinError && (
                <p className="join-code-error" role="alert">
                  {joinError}
                </p>
              )}
              <ChallengeLobbyCard
                challenge={foundChallenge}
                actionLabel={joining ? "Joining..." : "Join Challenge"}
                onSelect={handleJoin}
              />
            </section>
          )}
        </>
      )}

      <BottomNav />
    </div>
  );
}
