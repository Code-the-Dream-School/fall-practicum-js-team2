import { NavLink } from "react-router-dom";
import "./BottomNav.css";

export function BottomNav() {
  return (
    <nav aria-label="Main navigation" className="bottom-nav">
      <NavLink to="/home">Home</NavLink>
      <NavLink to="/challenges">Challenges</NavLink>
      <NavLink to="/profile">Profile</NavLink>
    </nav>
  );
}
