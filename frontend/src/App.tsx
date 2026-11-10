import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomeLandingPage } from "./pages/HomeLandingPage";
import { HomeDashboard } from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLandingPage />} />
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/challenges" element={""} />
        <Route path="/profile" element={""} />
        <Route path="/challenges/new" element={""} />
        <Route path="/challenges/join" element={""} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
