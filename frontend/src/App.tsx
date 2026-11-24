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
import { YourActivityPage } from "./pages/YourActivityPage";

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
        <Route path="/challenges/join" element={""} />
        <Route path="/challenges/:id/vote" element={<VotingPage />} />
        <Route path="/challenges/:id/leaderboard" element={<LeaderboardPage />} />
        <Route path="/challenges/:id/activity" element={<YourActivityPage/>} />
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;