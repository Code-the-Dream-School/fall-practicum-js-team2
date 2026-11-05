import { NavLink } from "react-router-dom";
import "./BottomNav.css";
import { HouseIcon, TrophyIcon, UserIcon } from "@phosphor-icons/react";

export function BottomNav() {
  return (
    <nav aria-label="Main navigation" className="bottom-nav">
      <NavLink to="/home">
        <HouseIcon size={28} />
        Home
      </NavLink>
      <NavLink to="/challenges">
        <TrophyIcon size={28} />
        Challenges
      </NavLink>
      <NavLink to="/profile">
        <UserIcon size={28} />
        Profile
      </NavLink>
    </nav>
  );
}
