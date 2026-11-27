import { useNavigate } from "react-router-dom";
import { CaretRightIcon, MagnifyingGlassIcon, TicketIcon } from "@phosphor-icons/react";
import "./JoinChallenge.css";
import { BackLink } from "../components/common/BackLink";
import { PageHeader } from "../components/common/PageHeader";
import { BottomNav } from "../components/common/BottomNav";

export function JoinChallengePage() {
  const navigate = useNavigate();

  return (
    <div className="join-challenge-page">
      <BackLink pathDestination="/home" pathName="Home" />

      <PageHeader
        title="Join a Challenge"
        subtitle="Two ways in — pick the one that fits."
      />

      <div className="join-options">
        <button
          type="button"
          className="join-option"
          onClick={() => navigate("/challenges/join/browse")}
        >
          <MagnifyingGlassIcon size={28} weight="bold" aria-hidden="true" />
          <span className="join-option-text">
            <span className="join-option-title">Browse active challenges</span>
            <span className="join-option-caption">
              See the public lobbies that are open right now and jump into one.
            </span>
          </span>
          <CaretRightIcon size={20} weight="bold" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="join-option"
          onClick={() => navigate("/challenges/join/code")}
        >
          <TicketIcon size={28} weight="bold" aria-hidden="true" />
          <span className="join-option-text">
            <span className="join-option-title">Join with an invite code</span>
            <span className="join-option-caption">
              A friend shared a code for a private lobby? Enter it to find
              their challenge.
            </span>
          </span>
          <CaretRightIcon size={20} weight="bold" aria-hidden="true" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
