import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, RefreshCw, ArrowRight, GripVertical, Trophy } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { API, useApp } from "../context/AppContext";

/**
 * Drag-and-drop pathway quizzes.
 * Player drags structures into the correct sequence.
 */
const PATHWAYS = [
  {
    id: "blood-flow",
    title: "Build the Blood Flow Pathway",
    subtitle: "Drag each structure into the order blood travels through the heart.",
    organ: "heart",
    items: [
      "Right Atrium",
      "Tricuspid Valve",
      "Right Ventricle",
      "Pulmonary Valve",
      "Lungs",
      "Left Atrium",
      "Mitral Valve",
      "Left Ventricle",
      "Aorta",
    ],
  },
  {
    id: "neural-signal",
    title: "Build the Motor Signal Pathway",
    subtitle: "Order the structures a motor command passes through.",
    organ: "brain",
    items: [
      "Motor Cortex",
      "Internal Capsule",
      "Brain Stem",
      "Spinal Cord",
      "Peripheral Nerve",
      "Muscle",
    ],
  },
];

// Fisher-Yates shuffle
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function PathwayQuiz({ pathwayId = "blood-flow", onClose }) {
  const pathway = useMemo(
    () => PATHWAYS.find((p) => p.id === pathwayId) || PATHWAYS[0],
    [pathwayId]
  );
  const { setUser } = useApp();

  const [items, setItems] = useState(() => shuffle(pathway.items));
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const reset = () => {
    setItems(shuffle(pathway.items));
    setSubmitted(false);
    setResult(null);
  };

  const onDragStart = (i) => () => setDragIdx(i);
  const onDragOver = (i) => (e) => {
    e.preventDefault();
    setOverIdx(i);
  };
  const onDrop = (i) => (e) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const copy = [...items];
    const [moved] = copy.splice(dragIdx, 1);
    copy.splice(i, 0, moved);
    setItems(copy);
    setDragIdx(null);
    setOverIdx(null);
  };

  const submit = async () => {
    const correct = items.filter((it, i) => it === pathway.items[i]).length;
    const total = pathway.items.length;
    setSubmitted(true);
    setResult({ correct, total });
    try {
      const res = await axios.post(`${API}/quiz/submit`, {
        quiz_id: `pathway-${pathway.id}`,
        score: correct,
        total,
      });
      setUser?.((u) =>
        u ? { ...u, xp: res.data.xp, streak: res.data.streak, badges: res.data.all_badges } : u
      );
      if (res.data.new_badges?.length) toast.success(`New badge unlocked! +${res.data.earned_xp} XP`);
      else toast.success(`+${res.data.earned_xp} XP earned`);
    } catch {
      // anonymous user is fine
    }
  };

  return (
    <div className="glass rounded-3xl p-7" data-testid="pathway-quiz">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#00D4FF] mb-2">
            Drag & Drop Quiz
          </div>
          <h3 className="font-display text-2xl">{pathway.title}</h3>
          <p className="text-sm text-white/60 mt-1">{pathway.subtitle}</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase border border-white/15 bg-white/5 text-white/70">
          {pathway.items.length} steps
        </span>
      </div>

      <ol className="space-y-2" data-testid="pathway-list">
        {items.map((it, i) => {
          const correct = submitted && it === pathway.items[i];
          const wrong = submitted && it !== pathway.items[i];
          return (
            <li
              key={it}
              draggable={!submitted}
              onDragStart={onDragStart(i)}
              onDragOver={onDragOver(i)}
              onDrop={onDrop(i)}
              onDragEnd={() => {
                setDragIdx(null);
                setOverIdx(null);
              }}
              data-testid={`pathway-item-${i}`}
              data-state={submitted ? (correct ? "correct" : "incorrect") : "pending"}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                correct
                  ? "bg-[#4ADE80]/10 border-[#4ADE80]/50"
                  : wrong
                  ? "bg-[#EF4444]/10 border-[#EF4444]/50"
                  : overIdx === i
                  ? "bg-white/10 border-[#7C4DFF]/60"
                  : "bg-white/5 border-white/10"
              } ${submitted ? "cursor-default" : "cursor-grab active:cursor-grabbing hover:bg-white/10"}`}
            >
              <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono text-white/65">
                {i + 1}
              </span>
              <GripVertical size={14} className="text-white/35" />
              <span className="flex-1 text-sm font-medium">{it}</span>
              {correct && <Check size={16} className="text-[#4ADE80]" />}
              {wrong && (
                <span className="text-[11px] text-[#EF4444]/90 font-mono">
                  → was: {pathway.items[i]}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
        {result && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Trophy size={16} className="text-[#F59E0B]" />
            <span className="text-sm">
              <span className="font-display text-xl text-[#F59E0B]">
                {result.correct}
              </span>
              <span className="text-white/55"> / {result.total} positions correct</span>
            </span>
          </motion.div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {submitted ? (
            <>
              <button
                onClick={reset}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 text-sm inline-flex items-center gap-2"
              >
                <RefreshCw size={14} /> Try again
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-full bg-[#7C4DFF] hover:bg-[#6538E6] text-white text-sm font-medium inline-flex items-center gap-2"
                >
                  Done <ArrowRight size={14} />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={submit}
              data-testid="pathway-submit"
              className="px-5 py-2.5 rounded-full bg-[#7C4DFF] hover:bg-[#6538E6] text-white text-sm font-medium shadow-[0_0_18px_rgba(124,77,255,0.4)]"
            >
              Check pathway
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { PATHWAYS };
