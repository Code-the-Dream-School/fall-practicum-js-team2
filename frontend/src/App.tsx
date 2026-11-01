import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { HomeLandingPage } from "./pages/HomeLandingPage";
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <HomeLandingPage />
      </main>
      <Footer />
    </div>
  );
}

export default App;
