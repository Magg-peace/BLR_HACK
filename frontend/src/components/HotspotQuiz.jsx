import React, { Suspense, lazy, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { Heart, Brain, Target, CheckCircle2, XCircle, RefreshCw, Trophy } from "lucide-react";
import { HEART_STRUCTURES, BRAIN_REGIONS } from "../data/anatomy";
import { API, useApp } from "../context/AppContext";

const HeartViewer = lazy(() =>
  import("./Anatomy3D").then((m) => ({ default: m.HeartViewer }))
);
const BrainViewer = lazy(() =>
  import("./Anatomy3D").then((m) => ({ default: m.BrainViewer }))
);

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Tap-the-correct-structure quiz.
 * organ: "heart" | "brain"
 * Picks `count` random structures, asks user to tap the right hotspot.
 */
export default function HotspotQuiz({ organ = "heart", count = 5, onClose }) {
  const { setUser } = useApp();

  const pool = organ === "heart" ? HEART_STRUCTURES : BRAIN_REGIONS;
  const questions = useMemo(() => shuffle(pool).slice(0, count), [pool, count]);

  const [idx, setIdx] = useState(0);
  const [tapped, setTapped] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);

  const target = questions[idx];

  const Viewer = organ === "heart" ? HeartViewer : BrainViewer;
  const color = organ === "heart" ? "#FF5E7D" : "#7C4DFF";

  const reset = () => {
    setIdx(0);
    setTapped(null);
    setAnswers([]);
    setFinished(false);
    setResult(null);
  };

  const onTap = (id) => {
    if (tapped !== null) return;
    setTapped(id);
  };

  const next = async () => {
    const correct = tapped === target.id;
    const newAnswers = [...answers, { id: target.id, tapped, correct }];
    setAnswers(newAnswers);
    setTapped(null);

    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
    } else {
      const score = newAnswers.filter((a) => a.correct).length;
      setFinished(true);
      try {
        const res = await axios.post(`${API}/quiz/submit`, {
          quiz_id: `hotspot-${organ}`,
          score,
          total: questions.length,
        });
        setResult({ score, total: questions.length, ...res.data });
        setUser?.((u) =>
          u ? { ...u, xp: res.data.xp, streak: res.data.streak, badges: res.data.all_badges } : u
        );
        if (res.data.new_badges?.length) toast.success(`New badge! +${res.data.earned_xp} XP`);
        else toast.success(`+${res.data.earned_xp} XP earned`);
      } catch {
        setResult({ score, total: questions.length, earned_xp: 0, anonymous: true });
      }
    }
  };

  return (
    <div className="glass rounded-3xl p-7" data-testid="hotspot-quiz">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#00D4FF] mb-2 inline-flex items-center gap-2">
            <Target size={12} /> Identify the Structure
          </div>
          <h3 className="font-display text-2xl">
            {organ === "heart" ? "Heart" : "Brain"} Hotspot Challenge
          </h3>
          <p className="text-sm text-white/60 mt-1">
            Find and tap the requested structure on the 3D model.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase border border-white/15 bg-white/5 text-white/70">
          {idx + 1} / {questions.length}
        </span>
      </div>

      {!finished && target && (
        <>
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4 text-center"
          >
            <div className="text-[10px] tracking-[0.3em] uppercase text-white/45 mb-1">
              Find this structure
            </div>
            <div
              className="font-display text-3xl"
              style={{ color }}
              data-testid="hotspot-target-name"
            >
              {target.name}
            </div>
          </motion.div>

          <div className="relative h-[420px] rounded-3xl overflow-hidden border border-white/10 grid-overlay">
            <Suspense fallback={<div className="w-full h-full" />}>
              <Viewer controls />
            </Suspense>

            {/* Hotspots — UNLABELED until tap, then reveal correct/wrong */}
            <div className="absolute inset-0 pointer-events-none">
              {pool.map((s) => {
                const isAnswer = tapped === s.id;
                const isTarget = target.id === s.id;
                const revealed = tapped !== null;
                return (
                  <button
                    key={s.id}
                    onClick={() => onTap(s.id)}
                    data-testid={`hotspot-quiz-${s.id}`}
                    style={{ left: `${s.pos[0] * 100}%`, top: `${s.pos[1] * 100}%` }}
                    className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
                  >
                    <span
                      className={`block w-4 h-4 rounded-full border-2 transition-all ${
                        revealed && isTarget
                          ? "bg-[#4ADE80] border-[#4ADE80] shadow-[0_0_22px_#4ADE80] scale-150"
                          : revealed && isAnswer
                          ? "bg-[#EF4444] border-[#EF4444] shadow-[0_0_22px_#EF4444] scale-150"
                          : "bg-white/20 border-white/60 hover:scale-150 hover:border-white"
                      }`}
                    />
                    {revealed && (isTarget || isAnswer) && (
                      <span
                        className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 rounded-md text-[11px] backdrop-blur-md border border-white/10 bg-black/55"
                      >
                        {s.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {tapped !== null && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-2xl border ${
                  tapped === target.id
                    ? "bg-[#4ADE80]/10 border-[#4ADE80]/50"
                    : "bg-[#EF4444]/10 border-[#EF4444]/50"
                }`}
              >
                <div className="text-sm font-medium mb-1 flex items-center gap-2">
                  {tapped === target.id ? (
                    <>
                      <CheckCircle2 size={16} className="text-[#4ADE80]" /> Correct!
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-[#EF4444]" /> Not quite.
                    </>
                  )}
                </div>
                <p className="text-xs text-white/70">{target.function}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end mt-5">
            <button
              onClick={next}
              disabled={tapped === null}
              data-testid="hotspot-next"
              className="px-6 py-3 rounded-full bg-[#7C4DFF] hover:bg-[#6538E6] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium shadow-[0_0_18px_rgba(124,77,255,0.4)]"
            >
              {idx + 1 < questions.length ? "Next" : "Finish"}
            </button>
          </div>
        </>
      )}

      {finished && result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <Trophy size={36} className="mx-auto mb-4 text-[#F59E0B]" />
          <h3 className="font-display text-3xl mb-2">
            {result.score} / {result.total}
          </h3>
          <p className="text-white/65 mb-6">
            {result.anonymous
              ? "Sign in to save XP."
              : `+${result.earned_xp} XP earned`}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 text-sm inline-flex items-center gap-2"
            >
              <RefreshCw size={14} /> Try again
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-[#7C4DFF] hover:bg-[#6538E6] text-white text-sm"
              >
                Done
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
