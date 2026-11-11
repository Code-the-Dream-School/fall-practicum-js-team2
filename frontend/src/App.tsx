import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomeLandingPage } from "./pages/HomeLandingPage";
import { HomeDashboard } from "./pages/Home";
import { LoginPage } from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/challenges" element={""} />
        <Route path="/profile" element={""} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
