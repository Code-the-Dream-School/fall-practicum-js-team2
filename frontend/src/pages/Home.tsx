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

// Based on the Participant Model
type Participant = {
  id: number;
};

// Based on the Game Model
type Game = {
  id: number;
  lobbyName: string;
  participants: Participant[];
  privacy: "PUBLIC" | "PRIVATE" | "SOLO";
};

// This takes in a generic data type T. It will be used to take in a Game object later
// TODO: use when getGame calls the real API
// type ApiResponse<T> = {
//   success: boolean;
//   data: T;
// };

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

// User model currently uses id and email
// uses user.name from /me
async function getCurrentUser(): Promise<User | null> {
  const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

  const url = `${API_BASE}/api/auth/me`;
  const token = localStorage.getItem(TOKEN_KEY);

  // null check
  if (!token) {
    return null;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    switch (response.status) {
      case 401:
        localStorage.removeItem(TOKEN_KEY);
        // handleRedirect();
        throw new Error("Unauthorized: Please log in again.");

      case 404:
        window.location.href = "/login";
        throw new Error("Not Found");

      case 500:
        throw new Error("Server error (500). Please try again later.");

      default:
        throw new Error(`Response status: ${response.status}`);
    }
  }
  // happy-path
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
  // TODO: Replace with real user data once the user endpoint/auth exists.
  const userObject = { name: undefined };
  const greetingName = userObject.name || "Username";
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null); // not sure if I need this

  useEffect(() => {
    const handleRedirect = () => {
      localStorage.removeItem(TOKEN_KEY);
      navigate("/login", { replace: true });
    };
    let isCancelled = false;

    async function loadGame() {
      try {
        const game = await getGame(1); // wait for the data
        if (!isCancelled) {
          setState({ status: "success", game }); // use the data
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

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        // if (!isCancelled) {

        // }

        if (!currentUser) {
          handleRedirect();
          return;
        }

        setUser(currentUser);
      } catch (error: unknown) {
        if (error instanceof AuthError) {
          handleRedirect();
        } else {
          console.error("Failed to load user", error);
          setUser(null);
        }
      }
      return;
    }

    loadUser();
    loadGame();

    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  return (
    <div className="home-dashboard">
      <div className="home-header-logo">
        <h2>VanGo</h2>
      </div>
      <PageHeader
        title={`Hey, ${greetingName}!`}
        subtitle="Get Outside. Get Creative."
      />
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
