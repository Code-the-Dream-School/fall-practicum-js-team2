import "./Home.css";
import { BottomNav } from "../components/common/BottomNav";
import { PageHeader } from "../components/common/PageHeader";
import { ButtonLink } from "../components/common/ButtonLink";
import { FeaturedChallengeCard } from "../components/home/FeaturedChallengeCard";
import { useState, useEffect } from "react";
import { ActiveChallengeCard } from "../components/home/ActiveChallengeCard";
import { useNavigate } from "react-router-dom";

class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

// TODO: move to shared auth module
const TOKEN_KEY = "vango_token";

type Participant = {
  id: number;
};

type Game = {
  id: number;
  lobbyName: string;
  participants: Participant[];
  privacy: "PUBLIC" | "PRIVATE" | "SOLO";
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "success"; game: Game };

async function getGame(id: number): Promise<Game> {
  return {
    id,
    lobbyName: "Weekend sketch walk",
    participants: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
    privacy: "PRIVATE",
  };
}

type User = {
  name: string;
  id: number;
  email: string;
  createdAt: string;
};

async function getCurrentUser(): Promise<User | null> {
  const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
  const url = `${API_BASE}/api/auth/me`;
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return null;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 404) {
      throw new AuthError("Session is no longer valid", response.status);
    }
    throw new Error(`Failed to load current user (status ${response.status})`);
  }

  const result = await response.json();
  return result.user;
}

const privacyLabels = {
  PUBLIC: "Public lobby",
  PRIVATE: "Private lobby",
  SOLO: "Solo",
};

function renderActiveChallenge(state: LoadState) {
  switch (state.status) {
    case "loading":
      return <p>Loading your challenge...</p>;
    case "error":
      return <p>Couldn't load your challenge</p>;
    case "empty":
      return <p>You're not in a challenge yet.</p>;
    case "success": {
      const playerCount = state.game.participants.length;

      return (
        // TODO: /challenges/:id route doesn't exist yet (add in App.tsx)
        <ActiveChallengeCard
          title={state.game.lobbyName}
          playerCount={playerCount}
          path={`/challenges/${state.game.id}`}
          privacy={privacyLabels[state.game.privacy]}
        />
      );
    }
  }
}

export function HomeDashboard() {
  const navigate = useNavigate();

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadCurrentUser() {
      try {
        const currentUser = await getCurrentUser();
        if (!isCancelled) {
          setUser(currentUser);
        }
      } catch (error: unknown) {
        if (isCancelled) return;

        if (error instanceof AuthError) {
          localStorage.removeItem(TOKEN_KEY);
          navigate("/login", {
            replace: true,
            state: { sessionExpired: true },
          });
        } else {
          console.error("Failed to load current user", error);
        }
      }
    }

    loadCurrentUser();

    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    let isCancelled = false;

    async function loadGame() {
      try {
        const game = await getGame(1);
        if (!isCancelled) {
          setState({ status: "success", game });
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "An unexpected error occurred.";
          setState({ status: "error", message });
          console.error(err);
        }
      }
    }

    loadGame();

    return () => {
      isCancelled = true;
    };
  }, []);

  const greeting = user ? `Hey, ${user.name}!` : "Hey there!";

  return (
    <div className="home-dashboard">
      <div className="home-header-logo">
        <h2>VanGo</h2>
      </div>
      <PageHeader title={greeting} subtitle="Get Outside. Get Creative." />
      <FeaturedChallengeCard title="Draw a heart" />
      <div className="challenge-actions">
        <ButtonLink
          text="Create challenge"
          variant="primary"
          path="/challenges/new"
        />
        <ButtonLink
          text="Join challenge"
          variant="secondary"
          path="/challenges/join"
        />
      </div>
      <section className="home-active-challenge">
        <h2>Active challenge</h2>
        {renderActiveChallenge(state)}
      </section>
      <BottomNav />
    </div>
  );
}