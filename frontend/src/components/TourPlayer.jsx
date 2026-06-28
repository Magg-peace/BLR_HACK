import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, X, Volume2 } from "lucide-react";
import NarratorButton from "./NarratorButton";

/**
 * Dynamic Tour Player.
 * Plays a tour of {steps: [{focus, caption, duration, fact}, ...]}.
 * - Auto-advance every `step.duration` ms (default 7s)
 * - Highlights `focus` structure id via onFocus callback
 * - Plays narration with NarratorButton (auto-on)
 * - Animated progress bar
 * - Renders an animated particle stream when path provided
 */
export default function TourPlayer({
  tour,
  persona,
  onFocus,
  onClose,
  hotspotPositions = {},      // { id: [x%, y%] }
}) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const step = tour.steps[idx];
  const duration = step?.duration || 7000;

  useEffect(() => {
    if (step && onFocus) onFocus(step.focus);
    setElapsed(0);
  }, [idx, step, onFocus]);

  useEffect(() => {
    if (!playing) {
      clearInterval(timerRef.current);
      return;
    }
    const tick = 100;
    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + tick;
        if (next >= duration) {
          // advance or stop
          if (idx + 1 < tour.steps.length) setIdx((i) => i + 1);
          else setPlaying(false);
          return 0;
        }
        return next;
      });
    }, tick);
    return () => clearInterval(timerRef.current);
  }, [playing, duration, idx, tour.steps.length]);

  const restart = () => {
    setIdx(0);
    setElapsed(0);
    setPlaying(true);
  };

  const goNext = () => {
    if (idx + 1 < tour.steps.length) setIdx(idx + 1);
    else setPlaying(false);
  };
  const goPrev = () => idx > 0 && setIdx(idx - 1);

  // Build a path through hotspots for animated particle stream (memoized so refs are stable)
  const pathPoints = React.useMemo(
    () =>
      tour.steps
        .map((s) => hotspotPositions[s.focus])
        .filter(Boolean),
    [tour, hotspotPositions]
  );

  return (
    <>
      {/* Particle stream overlay */}
      {pathPoints.length >= 2 && (
        <ParticleStream points={pathPoints} active={playing} />
      )}

      {/* Player banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-5 left-5 right-5 glass rounded-2xl p-4 z-20"
        data-testid="tour-player"
      >
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#00D4FF]">
                {tour.title} · {idx + 1}/{tour.steps.length}
              </span>
              {step?.fact && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C4DFF]/15 border border-[#7C4DFF]/40 text-[#9D7BFF]">
                  Did you know?
                </span>
              )}
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-sm text-white/90 leading-snug"
              >
                {step?.caption}
              </motion.p>
            </AnimatePresence>
            {step?.fact && (
              <p className="text-xs text-white/55 mt-1 italic">{step.fact}</p>
            )}

            {/* Progress */}
            <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#7C4DFF] to-[#00D4FF]"
                animate={{ width: `${(elapsed / duration) * 100}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <NarratorButton text={step?.caption} persona={persona} auto label="Listen" />
            <button onClick={goPrev} disabled={idx === 0}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30">
              <SkipBack size={14} />
            </button>
            <button
              onClick={() => (idx >= tour.steps.length - 1 && !playing ? restart() : setPlaying((p) => !p))}
              data-testid="tour-toggle"
              className="p-2.5 rounded-full bg-[#7C4DFF] hover:bg-[#6538E6] text-white"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={goNext}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
              data-testid="tour-next">
              <SkipForward size={14} />
            </button>
            <button onClick={onClose}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10">
              <X size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/**
 * Animated stream of small particles flowing along the polyline defined by `points`.
 * points: [[xPct, yPct], ...]  in [0,1]
 */
function ParticleStream({ points, active = true }) {
  const N_PARTICLES = 18;
  const particles = Array.from({ length: N_PARTICLES });
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Connecting path glow */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points.map(([x, y]) => `${x * 100},${y * 100}`).join(" ")}
          fill="none"
          stroke="rgba(255,94,125,0.35)"
          strokeWidth="0.7"
          strokeLinejoin="round"
          strokeDasharray="2 2"
          style={{ filter: "drop-shadow(0 0 6px rgba(255,94,125,0.5))" }}
        />
      </svg>
      {active &&
        particles.map((_, i) => (
          <FlowDot key={i} delay={(i / N_PARTICLES) * 6} points={points} />
        ))}
    </div>
  );
}

function FlowDot({ delay, points }) {
  const [pos, setPos] = useState(() =>
    points && points.length > 0 ? [points[0][0], points[0][1]] : [0, 0]
  );
  useEffect(() => {
    if (!points || points.length < 2) return;
    let raf;
    let start = performance.now() + delay * 1000;
    const TOTAL_MS = 6000;
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = (now) => {
      const t = ((now - start) % TOTAL_MS) / TOTAL_MS;
      const segIdx = Math.min(
        Math.floor(t * (points.length - 1)),
        points.length - 2
      );
      const segT = t * (points.length - 1) - segIdx;
      const a = points[segIdx];
      const b = points[segIdx + 1];
      if (a && b) {
        setPos([lerp(a[0], b[0], segT), lerp(a[1], b[1], segT)]);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [delay, points]);

  return (
    <span
      style={{
        left: `${pos[0] * 100}%`,
        top: `${pos[1] * 100}%`,
        background:
          "radial-gradient(circle, rgba(255,94,125,1) 0%, rgba(255,94,125,0.5) 60%, transparent 80%)",
        boxShadow: "0 0 14px rgba(255,94,125,0.85)",
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
    />
  );
}
