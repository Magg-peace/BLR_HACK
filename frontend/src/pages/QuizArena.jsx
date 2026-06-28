import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import {
  Trophy,
  Flame,
  Sparkles,
  Star,
  Crown,
  GraduationCap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Heart,
  Brain,
  Award,
} from "lucide-react";
import { QUIZZES } from "../data/quizzes";
import { API, useApp } from "../context/AppContext";

const BADGE_ICONS = {
  trophy: Trophy,
  flame: Flame,
  sparkles: Sparkles,
  star: Star,
  crown: Crown,
  "graduation-cap": GraduationCap,
};

export default function QuizArena() {
  const { user, setUser } = useApp();
  const [activeId, setActiveId] = useState(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    axios.get(`${API}/badges`).then((r) => setBadges(r.data)).catch(() => {});
    axios.get(`${API}/leaderboard`).then((r) => setLeaderboard(r.data.top || [])).catch(() => {});
  }, [result]);

  const quiz = useMemo(() => QUIZZES.find((q) => q.id === activeId), [activeId]);
  const totalQ = quiz?.questions.length || 0;
  const current = quiz?.questions[idx];

  const start = (id) => {
    setActiveId(id);
    setIdx(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setResult(null);
  };

  const reset = () => {
    setActiveId(null);
    setIdx(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setResult(null);
  };

  const choose = (i) => {
    if (selected !== null) return;
    setSelected(i);
  };

  const next = async () => {
    const correct = selected === current.a;
    const newAnswers = [...answers, { chosen: selected, correct }];
    setAnswers(newAnswers);
    setSelected(null);

    if (idx + 1 < totalQ) {
      setIdx(idx + 1);
    } else {
      const score = newAnswers.filter((a) => a.correct).length;
      setFinished(true);
      if (user) {
        setSubmitting(true);
        try {
          const res = await axios.post(`${API}/quiz/submit`, {
            quiz_id: quiz.id,
            score,
            total: totalQ,
          });
          setResult({ score, total: totalQ, ...res.data });
          // Update local user XP/streak/badges
          setUser?.((u) => u ? { ...u, xp: res.data.xp, streak: res.data.streak,
                                  badges: res.data.all_badges } : u);
          if (res.data.new_badges?.length) {
            toast.success(`New badge unlocked! +${res.data.earned_xp} XP`);
          } else {
            toast.success(`+${res.data.earned_xp} XP earned`);
          }
        } catch (e) {
          setResult({ score, total: totalQ, earned_xp: 0, error: true });
        } finally {
          setSubmitting(false);
        }
      } else {
        setResult({ score, total: totalQ, earned_xp: 0, anonymous: true });
      }
    }
  };

  return (
    <div className="space-y-6" data-testid="quiz-arena">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-[#FF5E7D] mb-2">
            Gamified Learning
          </div>
          <h1 className="font-display font-light text-4xl lg:text-5xl tracking-tight">
            Quiz Arena
          </h1>
          <p className="text-white/60 text-sm mt-2 max-w-lg">
            Earn XP, build streaks, unlock badges. Difficulty adapts to your persona.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2">
          <Stat icon={<Trophy size={14} />} label="XP" value={user?.xp ?? 0} color="#F59E0B" />
          <Stat icon={<Flame size={14} />} label="Streak" value={user?.streak ?? 0} color="#FF5E7D" />
          <Stat icon={<Award size={14} />} label="Badges" value={user?.badges?.length ?? 0} color="#00D4FF" />
        </div>
      </header>

      {!activeId && (
        <>
          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUIZZES.map((q, i) => (
              <motion.button
                key={q.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                onClick={() => start(q.id)}
                data-testid={`quiz-${q.id}`}
                className="text-left glass-interactive rounded-3xl p-6 relative overflow-hidden group"
              >
                <div
                  className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-25 group-hover:opacity-55 transition-opacity ${
                    q.organ === "heart" ? "bg-[#FF5E7D]" : "bg-[#7C4DFF]"
                  }`}
                />
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      q.organ === "heart"
                        ? "bg-[#FF5E7D]/20 border border-[#FF5E7D]/50"
                        : "bg-[#7C4DFF]/20 border border-[#7C4DFF]/50"
                    }`}
                  >
                    {q.organ === "heart" ? (
                      <Heart size={16} color="#FF5E7D" />
                    ) : (
                      <Brain size={16} color="#7C4DFF" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] tracking-[0.25em] uppercase px-2 py-1 rounded-full ${
                      q.difficulty === "easy"
                        ? "text-[#4ADE80] bg-[#4ADE80]/15 border border-[#4ADE80]/40"
                        : q.difficulty === "hard"
                        ? "text-[#EF4444] bg-[#EF4444]/15 border border-[#EF4444]/40"
                        : "text-[#F59E0B] bg-[#F59E0B]/15 border border-[#F59E0B]/40"
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>
                <h3 className="font-display text-xl mb-2">{q.title}</h3>
                <p className="text-white/55 text-sm">{q.questions.length} questions · ~{q.questions.length} min</p>
              </motion.button>
            ))}
          </section>

          {/* Badges row */}
          <section className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl">Badges</h3>
              <span className="text-xs text-white/45">
                {user?.badges?.length || 0} / {badges.length} unlocked
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {badges.map((b) => {
                const unlocked = user?.badges?.includes(b.id);
                const Icon = BADGE_ICONS[b.icon] || Trophy;
                return (
                  <div
                    key={b.id}
                    className={`text-center p-4 rounded-2xl border transition-all ${
                      unlocked
                        ? "bg-gradient-to-br from-[#7C4DFF]/15 to-[#FF5E7D]/15 border-[#7C4DFF]/40"
                        : "bg-white/3 border-white/8 opacity-50"
                    }`}
                  >
                    <Icon
                      size={28}
                      strokeWidth={1.4}
                      className={unlocked ? "mx-auto text-[#F59E0B]" : "mx-auto text-white/40"}
                    />
                    <div className="mt-2 text-xs font-medium">{b.name}</div>
                    <div className="text-[10px] text-white/45 mt-0.5">+{b.xp} XP</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <section className="glass rounded-3xl p-6">
              <h3 className="font-display text-2xl mb-4">Leaderboard</h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((u, i) => (
                  <div
                    key={u.name + i}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/8"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-white/50 w-6">{i + 1}</span>
                      {u.picture ? (
                        <img src={u.picture} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C4DFF] to-[#FF5E7D]" />
                      )}
                      <span className="font-medium text-sm">{u.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[#F59E0B] inline-flex items-center gap-1">
                        <Trophy size={12} /> {u.xp || 0} XP
                      </span>
                      <span className="text-[#FF5E7D] inline-flex items-center gap-1">
                        <Flame size={12} /> {u.streak || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* QUIZ in progress */}
      {activeId && !finished && current && (
        <motion.section
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#00D4FF]">
              {quiz.title} · Q{idx + 1} / {totalQ}
            </div>
            <div className="w-40 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7C4DFF] to-[#00D4FF] transition-all"
                style={{ width: `${((idx + (selected !== null ? 1 : 0)) / totalQ) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="font-display text-2xl lg:text-3xl mb-7 leading-snug">{current.q}</h2>

          <div className="space-y-3">
            {current.options.map((opt, i) => {
              const isPicked = selected === i;
              const isCorrect = selected !== null && i === current.a;
              const isWrongPick = selected !== null && isPicked && i !== current.a;
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  data-testid={`quiz-option-${i}`}
                  disabled={selected !== null}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                    isCorrect
                      ? "bg-[#4ADE80]/15 border-[#4ADE80]/60"
                      : isWrongPick
                      ? "bg-[#EF4444]/15 border-[#EF4444]/60"
                      : isPicked
                      ? "bg-white/10 border-white/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono ${
                      isCorrect
                        ? "bg-[#4ADE80] text-black"
                        : isWrongPick
                        ? "bg-[#EF4444] text-white"
                        : "bg-white/10"
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 size={14} /> : isWrongPick ? <XCircle size={14} /> : String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#00D4FF] mb-1">
                  Explanation
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{current.explain}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            <button
              onClick={reset}
              className="text-sm text-white/55 hover:text-white inline-flex items-center gap-2"
            >
              <RotateCcw size={14} /> Cancel
            </button>
            <button
              disabled={selected === null}
              onClick={next}
              data-testid="quiz-next"
              className="px-6 py-3 rounded-full bg-[#7C4DFF] hover:bg-[#6538E6] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium shadow-[0_0_20px_rgba(124,77,255,0.4)] transition-all"
            >
              {idx + 1 < totalQ ? "Next" : "Finish"}
            </button>
          </div>
        </motion.section>
      )}

      {/* RESULTS */}
      {finished && result && (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-8 max-w-2xl mx-auto text-center"
        >
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
              result.perfect
                ? "bg-gradient-to-br from-[#F59E0B] to-[#FF5E7D] shadow-[0_0_40px_rgba(245,158,11,0.6)]"
                : "bg-gradient-to-br from-[#7C4DFF] to-[#00D4FF] shadow-[0_0_30px_rgba(124,77,255,0.5)]"
            }`}
          >
            {result.perfect ? <Crown size={36} /> : <Trophy size={32} />}
          </div>
          <h2 className="font-display text-3xl mb-2">
            {result.perfect ? "Perfect Score!" : `${result.score} / ${result.total} correct`}
          </h2>
          <p className="text-white/65 mb-6">
            {submitting
              ? "Saving your score…"
              : result.anonymous
              ? "Sign in to save XP, streaks and unlock badges."
              : `+${result.earned_xp} XP earned${
                  result.new_badges?.length ? ` · ${result.new_badges.length} new badge(s)!` : ""
                }`}
          </p>

          {result.new_badges?.length > 0 && (
            <div className="flex justify-center gap-3 mb-6">
              {result.new_badges.map((b) => (
                <div
                  key={b}
                  className="px-3 py-2 rounded-full bg-gradient-to-r from-[#7C4DFF]/20 to-[#FF5E7D]/20 border border-[#7C4DFF]/50 text-sm font-medium"
                >
                  <Sparkles size={12} className="inline mr-1" /> {b.replace(/-/g, " ")}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button
              onClick={() => start(activeId)}
              className="px-6 py-3 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 text-sm font-medium transition-all"
            >
              Retry
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 rounded-full bg-[#7C4DFF] hover:bg-[#6538E6] text-white text-sm font-medium transition-all"
            >
              More quizzes
            </button>
          </div>
        </motion.section>
      )}
    </div>
  );
}

function Stat({ icon, label, value, color }) {
  return (
    <div
      className="px-4 py-2 rounded-full border inline-flex items-center gap-2"
      style={{ background: color + "1f", borderColor: color + "55", color }}
    >
      {icon}
      <span className="font-display font-medium">{value}</span>
      <span className="text-[10px] tracking-widest uppercase text-white/55">{label}</span>
    </div>
  );
}
