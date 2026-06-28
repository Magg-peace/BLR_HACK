import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  Brain,
  Activity,
  GraduationCap,
  GitCompare,
  Trophy,
  Sparkles,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const PERSONA_GREETING = {
  school_student: "Ready to explore the body's coolest machines?",
  medical_student: "Let's review some anatomy and pathology today.",
  doctor: "Pick a system to drill into clinical scenarios.",
};

const HIGHLIGHTS = [
  {
    to: "/app/heart",
    title: "Heart Explorer",
    desc: "Pulsing 3D heart with chamber-by-chamber breakdown.",
    icon: Heart,
    accent: "#FF5E7D",
  },
  {
    to: "/app/brain",
    title: "Brain Explorer",
    desc: "Lobes, nuclei, vascular and functional networks.",
    icon: Brain,
    accent: "#7C4DFF",
  },
  {
    to: "/app/disease",
    title: "Disease Lab",
    desc: "Animated progression of cardiac & neurological disease.",
    icon: Activity,
    accent: "#00D4FF",
  },
  {
    to: "/app/ask",
    title: "Ask AI Tutor",
    desc: "Persona-aware answers from Gemini 3 Flash.",
    icon: MessageCircle,
    accent: "#4ADE80",
  },
];

const SECONDARY = [
  { to: "/app/learn", title: "Learning Hub", icon: GraduationCap, color: "#F59E0B" },
  { to: "/app/compare", title: "Compare Mode", icon: GitCompare, color: "#00D4FF" },
  { to: "/app/quiz", title: "Quiz Arena", icon: Trophy, color: "#FF5E7D" },
  { to: "/app/arvr", title: "AR/VR Lab", icon: Sparkles, color: "#7C4DFF" },
];

export default function Home() {
  const { user, persona } = useApp();
  const displayName = user?.name?.trim() || "Explorer";

  return (
    <div className="space-y-8" data-testid="dashboard-home">
      {/* Greeting */}
      <div className="glass rounded-3xl p-8 lg:p-10 grid lg:grid-cols-3 gap-8 relative overflow-hidden grid-overlay">
        <div className="lg:col-span-2 relative z-10">
          <div className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] mb-3">
            Welcome back
          </div>
          <h1 className="font-display font-light text-4xl lg:text-5xl tracking-tight mb-3">
            Hello, <span className="text-gradient">{displayName}</span>
          </h1>
          <p className="text-white/70 max-w-xl text-base leading-relaxed">
            {PERSONA_GREETING[persona] ||
              "Pick where to dive in — heart, brain, or pathology."}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/app/heart"
              className="px-5 py-3 rounded-full bg-[#7C4DFF] hover:bg-[#6538E6] text-white text-sm font-medium shadow-[0_0_20px_rgba(124,77,255,0.4)] transition-all inline-flex items-center gap-2"
            >
              Open Heart Explorer <ArrowRight size={16} />
            </Link>
            <Link
              to="/app/ask"
              className="px-5 py-3 rounded-full bg-white/8 hover:bg-white/14 border border-white/15 text-sm font-medium transition-all inline-flex items-center gap-2"
            >
              Ask the AI Tutor <MessageCircle size={16} />
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center relative z-10">
          <div className="w-56 h-56 rounded-full bg-gradient-to-br from-[#FF5E7D]/40 to-[#7C4DFF]/40 blur-3xl absolute" />
          <div className="relative w-44 h-44 rounded-3xl glass-light flex items-center justify-center heartbeat">
            <Heart size={70} strokeWidth={1.2} color="#FF5E7D" />
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {HIGHLIGHTS.map((h, i) => (
          <motion.div
            key={h.to}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
          >
            <Link
              to={h.to}
              data-testid={`home-${h.to.split("/").pop()}-card`}
              className="block glass-interactive rounded-3xl p-6 h-full relative overflow-hidden group"
            >
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-25 group-hover:opacity-55 transition-opacity"
                style={{ background: h.accent }}
              />
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: `${h.accent}1f`,
                  border: `1px solid ${h.accent}55`,
                }}
              >
                <h.icon size={22} strokeWidth={1.6} color={h.accent} />
              </div>
              <h3 className="font-display text-xl mb-1">{h.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{h.desc}</p>
              <div className="mt-4 text-xs text-[#00D4FF] inline-flex items-center gap-1.5">
                Open <ArrowRight size={12} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Secondary modules */}
      <div className="glass rounded-3xl p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl">Other Modules</h2>
          <span className="text-xs text-white/50 tracking-widest uppercase">
            Coming up next
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SECONDARY.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white/3 border border-white/8 hover:bg-white/8 hover:border-white/15 transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `${s.color}1f`,
                  border: `1px solid ${s.color}55`,
                }}
              >
                <s.icon size={18} color={s.color} strokeWidth={1.6} />
              </div>
              <span className="font-medium text-sm">{s.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
