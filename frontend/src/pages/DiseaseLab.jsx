import React, { Suspense, lazy, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HEART_DISEASES,
  BRAIN_DISEASES,
} from "../data/diseases";
import { Heart, Brain, AlertTriangle, ChevronRight, Pill, Stethoscope, ShieldAlert } from "lucide-react";

const HeartViewer = lazy(() =>
  import("../components/Anatomy3D").then((m) => ({ default: m.HeartViewer }))
);
const BrainViewer = lazy(() =>
  import("../components/Anatomy3D").then((m) => ({ default: m.BrainViewer }))
);

export default function DiseaseLab() {
  const [organ, setOrgan] = useState("heart");
  const list = organ === "heart" ? HEART_DISEASES : BRAIN_DISEASES;
  const [selectedId, setSelectedId] = useState(list[0].id);
  const [severity, setSeverity] = useState(0);

  const selected = list.find((d) => d.id === selectedId) || list[0];
  const maxStage = selected.stages.length - 1;
  const stageIndex = Math.min(Math.max(0, severity), maxStage);
  const stage = selected.stages[stageIndex];

  const severityColor = useMemo(() => {
    const ratio = stageIndex / maxStage;
    if (ratio < 0.34) return "#4ADE80";
    if (ratio < 0.67) return "#F59E0B";
    return "#EF4444";
  }, [stageIndex, maxStage]);

  const handleOrgan = (o) => {
    setOrgan(o);
    const newList = o === "heart" ? HEART_DISEASES : BRAIN_DISEASES;
    setSelectedId(newList[0].id);
    setSeverity(0);
  };

  return (
    <div className="space-y-5" data-testid="disease-lab">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-[#FF5E7D] mb-2">
            Pathology Lab
          </div>
          <h1 className="font-display font-light text-4xl lg:text-5xl tracking-tight">
            Disease Simulator
          </h1>
          <p className="text-white/60 text-sm mt-2 max-w-lg">
            Slide through the progression of cardiac and neurological disease —
            from healthy tissue to clinical emergency.
          </p>
        </div>

        <div className="glass-light rounded-full p-1 flex items-center gap-1">
          <button
            onClick={() => handleOrgan("heart")}
            data-testid="organ-heart"
            className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
              organ === "heart"
                ? "bg-[#FF5E7D] text-white shadow-[0_0_15px_rgba(255,94,125,0.4)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Heart size={14} /> Heart
          </button>
          <button
            onClick={() => handleOrgan("brain")}
            data-testid="organ-brain"
            className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
              organ === "brain"
                ? "bg-[#7C4DFF] text-white shadow-[0_0_15px_rgba(124,77,255,0.4)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Brain size={14} /> Brain
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-5">
        {/* Disease list */}
        <aside className="lg:col-span-3 glass rounded-3xl p-4 space-y-1 max-h-[640px] overflow-y-auto">
          {list.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedId(d.id);
                setSeverity(0);
              }}
              data-testid={`disease-${d.id}`}
              className={`w-full text-left p-4 rounded-2xl transition-all border ${
                d.id === selectedId
                  ? "bg-white/10 border-white/25"
                  : "border-transparent hover:bg-white/5"
              }`}
            >
              <div className="text-sm font-medium">{d.name}</div>
              <div className="text-[11px] text-white/45 line-clamp-2 mt-0.5">
                {d.summary}
              </div>
            </button>
          ))}
        </aside>

        {/* Visualization + severity slider */}
        <div className="lg:col-span-6 space-y-5">
          <div className="relative h-[420px] rounded-3xl glass overflow-hidden grid-overlay">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center text-white/40">
                  Rendering…
                </div>
              }
            >
              {organ === "heart" ? <HeartViewer controls={true} /> : <BrainViewer controls={true} />}
            </Suspense>
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-500"
              style={{
                background: `radial-gradient(circle at 50% 55%, ${severityColor}33 0%, transparent 55%)`,
                opacity: 0.4 + (stageIndex / maxStage) * 0.6,
              }}
            />
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs">
              <span className="px-3 py-1.5 rounded-full glass-light">
                {selected.name}
              </span>
              <span
                className="px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{
                  color: severityColor,
                  borderColor: severityColor + "88",
                  background: severityColor + "1f",
                }}
              >
                {stage.label}
              </span>
            </div>
          </div>

          {/* Severity slider */}
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-white/45 mb-1">
                  Severity
                </div>
                <div className="font-display text-xl">{stage.label}</div>
              </div>
              <div
                className="text-xs font-mono px-3 py-1 rounded-full"
                style={{
                  color: severityColor,
                  background: severityColor + "1a",
                  border: `1px solid ${severityColor}55`,
                }}
              >
                Stage {stageIndex + 1} / {selected.stages.length}
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={maxStage}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              data-testid="severity-slider"
              className="w-full accent-[#7C4DFF]"
              style={{
                background: `linear-gradient(to right, #4ADE80, #F59E0B, #EF4444)`,
                borderRadius: 9999,
                height: 8,
              }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
              {selected.stages.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSeverity(i)}
                  className={`text-[10px] tracking-wider uppercase px-2 py-2 rounded-xl border transition-all ${
                    i === stageIndex
                      ? "bg-white/10 border-white/30 text-white"
                      : "border-white/8 text-white/50 hover:text-white hover:border-white/20"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={stage.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-white/75 mt-4 leading-relaxed"
              >
                {stage.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Info panel */}
        <aside className="lg:col-span-3 space-y-4 max-h-[640px] overflow-y-auto pr-1">
          <ClinicalCard
            icon={<Stethoscope size={16} />}
            title="Symptoms"
            items={selected.symptoms}
            color="#00D4FF"
          />
          <ClinicalCard
            icon={<AlertTriangle size={16} />}
            title="Causes"
            items={selected.causes}
            color="#F59E0B"
          />
          <ClinicalCard
            icon={<ShieldAlert size={16} />}
            title="Risk factors"
            items={selected.risk_factors}
            color="#FF5E7D"
          />
          <ClinicalCard
            icon={<Pill size={16} />}
            title="Treatments"
            items={selected.treatments}
            color="#4ADE80"
          />

          <div className="glass rounded-3xl p-5">
            <div className="text-[10px] tracking-[0.3em] uppercase text-white/45 mb-2">
              Prognosis
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              {selected.prognosis}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ClinicalCard({ icon, title, items, color }) {
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: color + "22",
            color,
            border: `1px solid ${color}55`,
          }}
        >
          {icon}
        </div>
        <h4 className="font-display text-sm">{title}</h4>
      </div>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li
            key={it}
            className="flex items-start gap-2 text-sm text-white/80"
          >
            <ChevronRight
              size={14}
              className="mt-0.5 flex-shrink-0"
              style={{ color }}
            />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
