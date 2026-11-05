import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomeLandingPage } from "./pages/HomeLandingPage";
import { HomeDashboard } from "./pages/Home";
import { ChallengesPage } from "./pages/ChallengesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLandingPage />} />
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/challenges" element={<ChallengesPage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;