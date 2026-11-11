import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomeLandingPage } from "./pages/HomeLandingPage";
import { HomeDashboard } from "./pages/Home";
import { ChallengeMap } from "./components/Map/ChallengeMap";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLandingPage />} />
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/challenge-map" element={<ChallengeMap />} />
        <Route path="/challenges" element={""} />
        <Route path="/profile" element={""} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
