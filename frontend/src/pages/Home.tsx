import "./Home.css";

import { BottomNav } from "../components/common/BottomNav";
import { PageHeader } from "../components/common/PageHeader";
import { ButtonLink } from "../components/common/ButtonLink";
import { FeaturedChallengeCard } from "../components/home/FeaturedChallengeCard";
import { useState, useEffect } from "react";
import { ActiveChallengeCard } from "../components/home/ActiveChallengeCard";

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

  useEffect(() => {
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

    loadGame();

    return () => {
      isCancelled = true;
    };
  }, []);

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
