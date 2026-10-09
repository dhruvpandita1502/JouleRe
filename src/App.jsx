import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Analyzer from "./pages/Analyzer";
import Dashboard from "./pages/Dashboard";
import Impact from "./pages/Impact";
import Leaderboard from "./pages/Leaderboard";

import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <BrowserRouter>

    <ScrollToTop />

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/analyzer"
          element={<Analyzer />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/impact"
          element={<Impact />}
        />

        <Route
          path="/leaderboard"
          element={<Leaderboard />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;