import React from "react";
import { Trophy, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuizArena() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" data-testid="quiz-arena">
      <div className="glass rounded-3xl p-10 max-w-lg text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FF5E7D] to-[#7C4DFF] flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(255,94,125,0.4)]">
          <Trophy size={28} />
        </div>
        <div className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] mb-3">
          Coming Soon
        </div>
        <h2 className="font-display font-light text-3xl mb-3">Quiz Arena</h2>
        <p className="text-white/65 text-sm leading-relaxed mb-6">
          Hotspot quizzes, drag-and-drop labels, MCQs and timed clinical
          scenarios. Difficulty adapts to your persona. Launching in the next
          update.
        </p>
        <Link
          to="/app/ask"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/8 hover:bg-white/15 border border-white/15 text-sm transition-all"
        >
          <Sparkles size={14} /> Try a sample question with the AI tutor
        </Link>
      </div>
    </div>
  );
}
