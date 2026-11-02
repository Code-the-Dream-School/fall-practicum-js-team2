import "./Home.css";
import heartRoute from "../assets/featured-heart-route.png";

export function HomeDashboard() {
  return (
    <div className="home-dashboard">
      <header>
        <p>VanGo</p>
        <h1>Hey, Edward</h1>
        <p>Get outside. Get Creative</p>
      </header>
      <section>
        <p>Featured challenge</p>
        <h2>Draw a heart</h2>
        <p>Turn your next walk into a work of art</p>
        <img
          className="featured-challenge-image"
          src={heartRoute}
          alt="Heart-shaped walking route on a street map"
        />
      </section>
      <div className="challenge-actions">
        <button type="button">Create challenge</button>
        <button type="button">Join Challenge</button>
      </div>
      <section>
        <h2>Active challenge</h2>
        <h3>Weekend sketch walk</h3>
        <p>5 players · Private lobby</p>
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
