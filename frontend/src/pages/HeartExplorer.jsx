import React, { Suspense, lazy, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HEART_STRUCTURES,
  HEART_LAYERS,
  HEART_TOURS,
} from "../data/anatomy";
import { useApp } from "../context/AppContext";
import { Play, Pause, RotateCcw, X, Layers } from "lucide-react";

const HeartViewer = lazy(() =>
  import("../components/Anatomy3D").then((m) => ({ default: m.HeartViewer }))
);

export default function HeartExplorer() {
  const { persona } = useApp();
  const [active, setActive] = useState(null); // structure id
  const [layer, setLayer] = useState("muscular");
  const [pulse, setPulse] = useState(true);
  const [tour, setTour] = useState(null); // tour id
  const [tourStep, setTourStep] = useState(0);

  const structures = HEART_STRUCTURES.filter((s) => s.layer === layer);
  const currentStructure = HEART_STRUCTURES.find((s) => s.id === active);
  const currentTour = HEART_TOURS.find((t) => t.id === tour);
  const currentTourStep = currentTour?.steps?.[tourStep];
  const focusedId = currentTourStep?.focus || active;
  const focused = HEART_STRUCTURES.find((s) => s.id === focusedId);

  const narration = focused
    ? focused.narration[persona || "medical_student"]
    : null;

  const startTour = (id) => {
    setTour(id);
    setTourStep(0);
    const first = HEART_TOURS.find((t) => t.id === id)?.steps?.[0]?.focus;
    if (first) setActive(first);
  };

  const stopTour = () => {
    setTour(null);
    setTourStep(0);
  };

  const advanceTour = () => {
    if (!currentTour) return;
    if (tourStep + 1 < currentTour.steps.length) {
      const next = tourStep + 1;
      setTourStep(next);
      setActive(currentTour.steps[next].focus);
    } else {
      stopTour();
    }
  };

  return (
    <div className="space-y-5" data-testid="heart-explorer">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-[#FF5E7D] mb-2">
            Cardiology Atlas
          </div>
          <h1 className="font-display font-light text-4xl lg:text-5xl tracking-tight">
            Heart Explorer
          </h1>
          <p className="text-white/60 text-sm mt-2 max-w-lg">
            Rotate, zoom and peel back the layers of the human heart. Click any
            structure or launch a guided tour.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="glass-light rounded-full p-1 flex items-center gap-1">
            {HEART_LAYERS.map((l) => (
              <button
                key={l.id}
                data-testid={`layer-${l.id}`}
                onClick={() => setLayer(l.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  layer === l.id
                    ? "bg-[#7C4DFF] text-white shadow-[0_0_15px_rgba(124,77,255,0.4)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPulse((v) => !v)}
            data-testid="toggle-pulse"
            className="px-4 py-2 rounded-full glass-interactive text-xs font-medium inline-flex items-center gap-2"
          >
            {pulse ? <Pause size={14} /> : <Play size={14} />}
            {pulse ? "Pause beat" : "Resume beat"}
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* 3D viewport */}
        <div className="lg:col-span-2 relative h-[480px] lg:h-[620px] rounded-3xl glass overflow-hidden grid-overlay">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center text-white/40">
                Rendering heart…
              </div>
            }
          >
            <HeartViewer pulse={pulse} />
          </Suspense>

          {/* Hotspot overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {structures.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActive(s.id);
                  stopTour();
                }}
                data-testid={`hotspot-${s.id}`}
                style={{ left: `${s.pos[0] * 100}%`, top: `${s.pos[1] * 100}%` }}
                className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 group ${
                  focusedId === s.id ? "z-10" : ""
                }`}
              >
                <span
                  className={`block w-3 h-3 rounded-full transition-all ${
                    focusedId === s.id
                      ? "bg-[#FF5E7D] shadow-[0_0_22px_#FF5E7D] scale-150"
                      : "bg-white/60 group-hover:bg-[#FF5E7D] group-hover:shadow-[0_0_18px_#FF5E7D] group-hover:scale-125"
                  }`}
                />
                <span
                  className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 rounded-md text-[11px] backdrop-blur-md border border-white/10 bg-black/40 transition-opacity ${
                    focusedId === s.id
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {s.name}
                </span>
              </button>
            ))}
          </div>

          {/* Tour banner */}
          {currentTour && (
            <div className="absolute bottom-5 left-5 right-5 glass rounded-2xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#00D4FF] mb-1">
                  {currentTour.title} · Step {tourStep + 1}/{currentTour.steps.length}
                </div>
                <div className="text-sm text-white/85 truncate">
                  {currentTourStep?.caption}
                </div>
              </div>
              <button
                onClick={advanceTour}
                data-testid="tour-next"
                className="px-4 py-2 rounded-full bg-[#7C4DFF] text-white text-sm font-medium hover:bg-[#6538E6] transition-all"
              >
                {tourStep + 1 < currentTour.steps.length ? "Next" : "Finish"}
              </button>
              <button
                onClick={stopTour}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          <AnimatePresence mode="wait">
            {focused ? (
              <motion.div
                key={focused.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="glass rounded-3xl p-6"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="text-[10px] tracking-[0.3em] uppercase text-[#FF5E7D] mb-1">
                      Structure
                    </div>
                    <h2 className="font-display text-2xl">{focused.name}</h2>
                  </div>
                  <button
                    onClick={() => {
                      setActive(null);
                      stopTour();
                    }}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10"
                    aria-label="close"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[10px] tracking-[0.3em] uppercase text-[#00D4FF]">
                      Narration · {persona?.replace("_", " ") || "medical student"}
                    </div>
                    <NarratorButton text={narration} label="Listen" />
                  </div>
                  <p className="text-sm leading-relaxed text-white/85">
                    {narration}
                  </p>
                </div>

                <InfoBlock label="Function" body={focused.function} />
                <InfoBlock label="Physiology" body={focused.physiology} />
                <InfoBlock label="Pathology" body={focused.pathology} />
                <InfoBlock label="Clinical" body={focused.clinical} />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-3xl p-6 text-center text-white/55"
              >
                <Layers className="mx-auto mb-3" strokeWidth={1.4} />
                Tap any glowing marker on the heart to learn more.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Guided tours */}
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg">Guided Tours</h3>
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">
                Cinematic
              </span>
            </div>
            <div className="space-y-2">
              {HEART_TOURS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => startTour(t.id)}
                  data-testid={`tour-${t.id}`}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${
                    tour === t.id
                      ? "bg-[#7C4DFF]/15 border-[#7C4DFF]/60"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{t.title}</div>
                    <span className="text-[10px] text-white/50">{t.duration}</span>
                  </div>
                </button>
              ))}
            </div>
            {tour && (
              <button
                onClick={stopTour}
                className="mt-3 text-xs text-white/55 hover:text-white inline-flex items-center gap-1"
              >
                <RotateCcw size={12} /> Reset tour
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoBlock({ label, body }) {
  if (!body) return null;
  return (
    <div className="mb-3">
      <div className="text-[10px] tracking-[0.3em] uppercase text-white/45 mb-1">
        {label}
      </div>
      <p className="text-sm text-white/80 leading-relaxed">{body}</p>
    </div>
  );
}
