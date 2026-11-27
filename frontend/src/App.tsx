import "./App.css";
import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomeLandingPage } from "./pages/HomeLandingPage";
import { HomeDashboard } from "./pages/Home";
import { ChallengesPage } from "./pages/ChallengesPage";

import { VotingPage } from "./pages/VotingPage";
import { LoginPage } from "./pages/Login";
import { PlanRoute } from "./pages/PlanRoute";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { CreateChallengePage } from "./pages/CreateChallengePage";


// Pages behind login sit inside this wrapper: with no saved token the
// visitor is sent to /login instead of seeing the page. (An expired
// token is handled by the page itself - Home removes it and redirects.)
function RequireAuth({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("vango_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <HomeDashboard />
            </RequireAuth>
          }
        />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/plan-route" element={<PlanRoute />} />
        <Route path="/profile" element={""} />
        <Route path="/challenges/new" element={<CreateChallengePage />} />
        <Route path="/challenges/join" element={""} />
        <Route path="/challenges/:id/vote" element={<VotingPage />} />
        <Route path="/challenges/:id/leaderboard" element={<LeaderboardPage />} />

        

      </Routes>
    </BrowserRouter>
  );
}

export default App;