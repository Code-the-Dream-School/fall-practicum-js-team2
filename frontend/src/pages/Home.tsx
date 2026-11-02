import "./Home.css";
import heartRoute from "../assets/featured-heart-route.png";

export function HomeDashboard() {
  return (
    <div className="home-dashboard">
      <header>
        <div className="home-header-logo">
          <h2>VanGo</h2>
        </div>
        <div className="home-user-greeting">
          <h1>Hey, Edward</h1>
        </div>
        <div className="home-header-tagline">
          <p>Get outside. Get Creative.</p>
        </div>
      </header>
      <section className="home-featured-challenge-section">
        <div>
          <p className="challenge-label">FEATURED CHALLENGE</p>
          <h2>Draw a heart</h2>
          <p className="challenge-description">
            Turn your next walk into a work of art
          </p>
        </div>
        <img
          className="featured-challenge-image"
          src={heartRoute}
          alt="Heart-shaped walking route on a street map"
        />
      </section>
      <div className="challenge-actions">
        <button type="button" className="challenge-create">
          Create challenge
        </button>
        <button type="button" className="challenge-join">
          Join challenge
        </button>
      </div>
      <section className="home-active-challenge">
        <h2>Active challenge</h2>
        <div className="active-challenge-card">
          <h3>Weekend sketch walk</h3>
          <p>5 players · Private lobby</p>
        </div>
      </section>
      <nav aria-label="Main navigation" className="bottom-nav">
        <a href="/" aria-current="page">
          Home
        </a>
        <a href="/challenges">Challenges</a>
        <a href="/profile">Profile</a>
      </nav>
    </div>
  );
}
