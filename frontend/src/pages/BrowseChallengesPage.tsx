import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BrowseChallenges.css";
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
};

type BrowseGame = Challenge & { lobbyName: string };

function toBrowseGame(game: ApiGame, participantsCount?: number): BrowseGame {
  return {
    id: game.id,
    lobbyName: game.lobbyName,
    pictionaryWord: game.pictionaryWord,
    status: game.status,
    privacy: game.privacy === "PRIVATE" ? "PRIVATE" : "PUBLIC",
    endDate: game.endDate,
    maxParticipants: game.maxParticipants,
    participantsCount,
  };
}

export function BrowseChallengesPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState<BrowseGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [joinError, setJoinError] = useState("");
  const [notice, setNotice] = useState("");
  const [joiningId, setJoiningId] = useState<number | string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<number | string>>(new Set());
  const [joinedGame, setJoinedGame] = useState<BrowseGame | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      try {
        // GET /api/games returns the open (active, public) lobbies.
        const response = await fetch(`${API_BASE}/api/games`);
        if (!response.ok) throw new Error("Failed to load challenges.");
        const body = await response.json().catch(() => ({}));
        const openGames: ApiGame[] = Array.isArray(body)
          ? body
          : (body.data ?? []);

        // The list endpoint does not include player counts, so fill them in
        // from the game status endpoint (one call per lobby).
        const withCounts = await Promise.all(
          openGames.map(async (game) => {
            try {
              const statusResponse = await fetch(
                `${API_BASE}/api/games/${game.id}`,
              );
              if (!statusResponse.ok) return toBrowseGame(game);
              const statusBody = await statusResponse
                .json()
                .catch(() => ({}));
              const count =
                statusBody.data?.currentParticipants ??
                statusBody.data?.participants?.length;
              return toBrowseGame(
                game,
                typeof count === "number" ? count : undefined,
              );
            } catch {
              // Count is a nice-to-have; the card hides it when unknown.
              return toBrowseGame(game);
            }
          }),
        );

        if (!cancelled) setGames(withCounts);
      } catch {
        if (!cancelled) {
          setLoadError(
            "Can't reach the server. Check your connection and try again.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadGames();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleJoin(id: number | string) {
    if (joiningId !== null) return;
    const game = games.find((candidate) => candidate.id === id);
    if (!game) return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate("/login");
      return;
    }

    setJoiningId(id);
    setJoinError("");
    setNotice("");
    try {
      const response = await fetch(`${API_BASE}/api/games/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameId: game.id }),
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
          setJoinedIds((previous) => new Set(previous).add(game.id));
          setNotice(`You're already in "${game.lobbyName}".`);
        } else {
          setJoinError(message);
        }
        return;
      }

      setJoinedIds((previous) => new Set(previous).add(game.id));
      setJoinedGame(game);
    } catch {
      setJoinError("Can't reach the server. Check your connection and try again.");
    } finally {
      setJoiningId(null);
    }
  }

  if (joinedGame) {
    return (
      <div className="browse-challenges-page">
        <BackLink pathDestination="/challenges/join" pathName="Join a Challenge" />

        <PageHeader title="You're in!" />

        <section className="browse-success" role="status">
          <h2>{joinedGame.lobbyName}</h2>
          <p>
            You joined this lobby. The prompt is{" "}
            <strong>{joinedGame.pictionaryWord}</strong> — time to walk your
            drawing.
          </p>
          <Button
            className="browse-success-button"
            onClick={() => navigate("/plan-route")}
          >
            Start drawing
          </Button>
          <button
            type="button"
            className="browse-more-button"
            onClick={() => setJoinedGame(null)}
          >
            Keep browsing
          </button>
        </section>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="browse-challenges-page">
      <BackLink pathDestination="/challenges/join" pathName="Join a Challenge" />

      <PageHeader
        title="Active Challenges"
        subtitle="Public lobbies that are open right now. Pick one and join."
      />

      {joinError && (
        <p className="browse-error" role="alert">
          {joinError}
        </p>
      )}
      {notice && (
        <p className="browse-notice" role="status">
          {notice}
        </p>
      )}

      <section className="browse-feed">
        {isLoading && <p>Loading challenges...</p>}

        {!isLoading && loadError && (
          <div className="browse-empty">
            <p>{loadError}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !loadError && games.length === 0 && (
          <div className="browse-empty">
            <p>No active challenges at the moment.</p>
            <Button
              variant="primary"
              onClick={() => navigate("/challenges/new")}
            >
              Create a Challenge
            </Button>
          </div>
        )}

        {!isLoading &&
          games.map((game) => {
            const joined = joinedIds.has(game.id);
            return (
              <ChallengeLobbyCard
                key={game.id}
                challenge={game}
                actionLabel={
                  joined
                    ? "Joined"
                    : joiningId === game.id
                      ? "Joining..."
                      : "Join Challenge"
                }
                onSelect={joined ? undefined : handleJoin}
              />
            );
          })}
      </section>

      <BottomNav />
    </div>
  );
}
