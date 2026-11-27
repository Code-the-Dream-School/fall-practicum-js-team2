import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomeLandingPage } from "./pages/HomeLandingPage";
import { HomeDashboard } from "./pages/Home";
import { ChallengesPage } from "./pages/ChallengesPage";

import { VotingPage } from "./pages/VotingPage";
import { LoginPage } from "./pages/Login";
import { PlanRoute } from "./pages/PlanRoute";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { CreateChallengePage } from "./pages/CreateChallengePage";
import { JoinChallengePage } from "./pages/JoinChallengePage";
import { BrowseChallengesPage } from "./pages/BrowseChallengesPage";
import { JoinWithCodePage } from "./pages/JoinWithCodePage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/plan-route" element={<PlanRoute />} />
        <Route path="/profile" element={""} />
        <Route path="/challenges/new" element={<CreateChallengePage />} />
        <Route path="/challenges/join" element={<JoinChallengePage />} />
        <Route path="/challenges/join/browse" element={<BrowseChallengesPage />} />
        <Route path="/challenges/join/code" element={<JoinWithCodePage />} />
        <Route path="/challenges/:id/vote" element={<VotingPage />} />
        <Route path="/challenges/:id/leaderboard" element={<LeaderboardPage />} />

        

      </Routes>
    </BrowserRouter>
  );
}

export default App;