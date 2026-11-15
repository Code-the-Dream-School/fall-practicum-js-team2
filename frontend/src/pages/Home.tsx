import "./Home.css";

import { BottomNav } from "../components/common/BottomNav";
import { PageHeader } from "../components/common/PageHeader";
import { ButtonLink } from "../components/common/ButtonLink";
import { FeaturedChallengeCard } from "../components/home/FeaturedChallengeCard";

export function HomeDashboard() {
  // TODO: Replace with real user data once the user endpoint/auth exists.
  const userObject = { name: undefined };
  const greetingName = userObject.name || "Username";

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
        <div className="active-challenge-card">
          <h3>Weekend sketch walk</h3>
          <p>5 players · Private lobby</p>
        </div>
      </section>
      <BottomNav />
    </div>
  );
}
