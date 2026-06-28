import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, Layers3, Trophy, MessageCircle, Sparkles } from "lucide-react";

const MODULES = [
  {
    title: "Cardiac Cycle Essentials",
    body: "Master systole, diastole and the pressure-volume loop.",
    tag: "Cardiology",
    color: "#FF5E7D",
    icon: BookOpen,
  },
  {
    title: "Neural Pathways 101",
    body: "Sensory, motor and autonomic pathways traced end-to-end.",
    tag: "Neurology",
    color: "#7C4DFF",
    icon: Layers3,
  },
  {
    title: "Clinical Case: Chest Pain",
    body: "Differentials, ECG, troponin and disposition.",
    tag: "Case Study",
    color: "#00D4FF",
    icon: Sparkles,
  },
  {
    title: "Flashcards: Heart Valves",
    body: "Quick recall on valve disease and murmurs.",
    tag: "Flashcards",
    color: "#4ADE80",
    icon: GraduationCap,
  },
];

export default function LearningHub() {
  return (
    <div className="space-y-6" data-testid="learning-hub">
      <header>
        <div className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] mb-2">
          Curriculum
        </div>
        <h1 className="font-display font-light text-4xl lg:text-5xl tracking-tight">
          Learning Hub
        </h1>
        <p className="text-white/60 text-sm mt-2 max-w-xl">
          Bite-sized modules, flashcards and clinical scenarios. Pick something
          to study or ask the AI tutor for a custom lesson.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {MODULES.map((m) => (
          <div
            key={m.title}
            className="glass-interactive rounded-3xl p-6 relative overflow-hidden group"
          >
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-25 group-hover:opacity-55 transition-opacity"
              style={{ background: m.color }}
            />
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
              style={{
                background: m.color + "1f",
                border: `1px solid ${m.color}55`,
              }}
            >
              <m.icon size={20} strokeWidth={1.6} color={m.color} />
            </div>
            <span
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{ color: m.color }}
            >
              {m.tag}
            </span>
            <h3 className="font-display text-xl mt-1 mb-2">{m.title}</h3>
            <p className="text-sm text-white/65 leading-relaxed">{m.body}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl">Stuck on a concept?</h3>
          <p className="text-sm text-white/60 mt-1">
            Ask the AI tutor for a personalized explanation.
          </p>
        </div>
        <Link
          to="/app/ask"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#7C4DFF] hover:bg-[#6538E6] text-white text-sm font-medium shadow-[0_0_20px_rgba(124,77,255,0.4)] transition-all"
        >
          <MessageCircle size={16} /> Ask the Tutor
        </Link>
      </div>
    </div>
  );
}
