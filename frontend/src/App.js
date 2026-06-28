import React from "react";
import "@/App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Landing from "@/pages/Landing";
import SelectPersona from "@/pages/SelectPersona";
import AuthCallback from "@/pages/AuthCallback";
import Home from "@/pages/Home";
import HeartExplorer from "@/pages/HeartExplorer";
import BrainExplorer from "@/pages/BrainExplorer";
import DiseaseLab from "@/pages/DiseaseLab";
import AskAI from "@/pages/AskAI";
import Compare from "@/pages/Compare";
import LearningHub from "@/pages/LearningHub";
import QuizArena from "@/pages/QuizArena";
import ARVRLab from "@/pages/ARVRLab";
import Protected from "@/components/Protected";
import { Toaster } from "@/components/ui/sonner";

function AppRouter() {
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const location = useLocation();
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/select-persona" element={<SelectPersona />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/app"
        element={
          <Protected>
            <Home />
          </Protected>
        }
      />
      <Route
        path="/app/heart"
        element={
          <Protected>
            <HeartExplorer />
          </Protected>
        }
      />
      <Route
        path="/app/brain"
        element={
          <Protected>
            <BrainExplorer />
          </Protected>
        }
      />
      <Route
        path="/app/disease"
        element={
          <Protected>
            <DiseaseLab />
          </Protected>
        }
      />
      <Route
        path="/app/compare"
        element={
          <Protected>
            <Compare />
          </Protected>
        }
      />
      <Route
        path="/app/learn"
        element={
          <Protected>
            <LearningHub />
          </Protected>
        }
      />
      <Route
        path="/app/quiz"
        element={
          <Protected>
            <QuizArena />
          </Protected>
        }
      />
      <Route
        path="/app/arvr"
        element={
          <Protected>
            <ARVRLab />
          </Protected>
        }
      />
      <Route
        path="/app/ask"
        element={
          <Protected>
            <AskAI />
          </Protected>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppProvider>
          <AppRouter />
          <Toaster />
        </AppProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
