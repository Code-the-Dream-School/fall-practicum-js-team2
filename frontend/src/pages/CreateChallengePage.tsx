import { useState } from "react";
import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import "./CreateChallenge.css";
import { BackLink } from "../components/common/BackLink";
import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/common/Button";
import { BottomNav } from "../components/common/BottomNav";

const CHALLENGE_TYPES = ["Solo", "Private", "Public"] as const;
const CHALLENGE_DURATIONS = ["24 hours", "48 hours", "72 hours"] as const;
const VOTING_DURATIONS = ["6 hours", "12 hours", "24 hours"] as const;

export function CreateChallengePage() {

  const [challengeType, setChallengeType] = useState<(typeof CHALLENGE_TYPES)[number]>("Private");
  const [challengeDuration, setChallengeDuration] = useState<(typeof CHALLENGE_DURATIONS)[number]>("72 hours");
  const [votingDuration, setVotingDuration] = useState<(typeof VOTING_DURATIONS)[number]>("24 hours");
  const [playerLimit, setPlayerLimit] = useState(5);

  return (
    <div className="create-challenge-page">
      <BackLink pathDestination="/home" pathName="Home" />

      <PageHeader
        title="Create a Challenge"
        subtitle="Pick a prompt and invite your friends."
      />

      <form
        className="create-challenge-form"
        onSubmit={(event) => event.preventDefault()}
      >
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

        <Button type="submit" className="create-lobby-button">
          Create lobby
        </Button>
      </form>

      <BottomNav />
    </div>
  );
}
