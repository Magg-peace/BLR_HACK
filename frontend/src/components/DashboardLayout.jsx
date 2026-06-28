import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Heart,
  Brain,
  Activity,
  GraduationCap,
  GitCompare,
  Trophy,
  Sparkles,
  MessageCircle,
  LogOut,
  Search,
  Volume2,
  VolumeX,
} from "lucide-react";
import Particles from "./Particles";
import { useApp } from "../context/AppContext";

const NAV = [
  { to: "/app", label: "Home", icon: Home, end: true, testId: "nav-home" },
  { to: "/app/heart", label: "Heart Explorer", icon: Heart, testId: "nav-heart" },
  { to: "/app/brain", label: "Brain Explorer", icon: Brain, testId: "nav-brain" },
  { to: "/app/disease", label: "Disease Lab", icon: Activity, testId: "nav-disease" },
  { to: "/app/learn", label: "Learning Hub", icon: GraduationCap, testId: "nav-learn" },
  { to: "/app/compare", label: "Compare", icon: GitCompare, testId: "nav-compare" },
  { to: "/app/quiz", label: "Quizzes", icon: Trophy, testId: "nav-quiz" },
  { to: "/app/arvr", label: "AR/VR Lab", icon: Sparkles, testId: "nav-arvr" },
  { to: "/app/ask", label: "Ask AI", icon: MessageCircle, testId: "nav-ask" },
];

const PERSONA_LABELS = {
  school_student: "School Student",
  medical_student: "Medical Student",
  doctor: "Doctor",
};

export default function DashboardLayout({ children }) {
  const { persona, user, logout, narrationOn, setNarrationOn } = useApp();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-[#07111F] text-white">
      <div className="aurora-bg" />
      <Particles count={20} />

      {/* Sidebar */}
      <aside className="relative z-10 m-4 w-64 flex-shrink-0 hidden md:flex flex-col glass rounded-3xl p-5">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C4DFF] to-[#00D4FF] flex items-center justify-center shadow-[0_0_20px_rgba(124,77,255,0.5)]">
            <Sparkles size={20} strokeWidth={1.8} className="text-white" />
          </div>
          <div>
            <div className="font-display text-lg leading-tight">Anatomia</div>
            <div className="text-[10px] tracking-[0.25em] text-[#00D4FF] uppercase">
              AI Atlas
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end, testId }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              data-testid={testId}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all ${
                  isActive
                    ? "bg-white/10 text-white border border-white/15 shadow-[inset_0_0_0_1px_rgba(124,77,255,0.4)]"
                    : "text-white/65 hover:bg-white/5 hover:text-white border border-transparent"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.6} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          data-testid="logout-btn"
          className="mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut size={18} strokeWidth={1.6} />
          Sign out
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="m-4 mb-2 px-5 py-3 glass rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                data-testid="topbar-search"
                placeholder="Search structures, diseases…"
                className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm placeholder:text-white/40 focus:outline-none focus:border-[#00D4FF]/60 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              data-testid="narration-toggle"
              onClick={() => setNarrationOn((v) => !v)}
              title={narrationOn ? "Mute narration" : "Enable narration"}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              {narrationOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={() => navigate("/select-persona")}
              data-testid="persona-badge"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#7C4DFF]/25 to-[#00D4FF]/25 border border-white/15 text-sm font-medium hover:from-[#7C4DFF]/40 hover:to-[#00D4FF]/40 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]" />
              {PERSONA_LABELS[persona] || "Choose Persona"}
            </button>

            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border border-white/20"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C4DFF] to-[#FF5E7D]" />
              )}
              <div className="hidden lg:block leading-tight">
                <div className="text-sm font-medium">{user?.name || "Guest"}</div>
                <div className="text-[11px] text-white/50">{user?.email || ""}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
