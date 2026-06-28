import React, { Suspense, lazy, useState } from "react";
import { HEART_DISEASES, BRAIN_DISEASES } from "../data/diseases";
import { GitCompare, Heart, Brain } from "lucide-react";

const HeartViewer = lazy(() =>
  import("../components/Anatomy3D").then((m) => ({ default: m.HeartViewer }))
);
const BrainViewer = lazy(() =>
  import("../components/Anatomy3D").then((m) => ({ default: m.BrainViewer }))
);

export default function Compare() {
  const [organ, setOrgan] = useState("heart");
  const list = organ === "heart" ? HEART_DISEASES : BRAIN_DISEASES;
  const [diseaseId, setDiseaseId] = useState(list[0].id);
  const disease = list.find((d) => d.id === diseaseId) || list[0];
  const Viewer = organ === "heart" ? HeartViewer : BrainViewer;

  return (
    <div className="space-y-5" data-testid="compare-mode">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] mb-2">
            Side-by-side
          </div>
          <h1 className="font-display font-light text-4xl lg:text-5xl tracking-tight">
            Compare Mode
          </h1>
          <p className="text-white/60 text-sm mt-2 max-w-lg">
            Healthy anatomy vs disease — synchronized views, highlighted lesions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="glass-light rounded-full p-1 flex items-center gap-1">
            <button
              onClick={() => {
                setOrgan("heart");
                setDiseaseId(HEART_DISEASES[0].id);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
                organ === "heart"
                  ? "bg-[#FF5E7D] text-white shadow-[0_0_15px_rgba(255,94,125,0.4)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Heart size={14} /> Heart
            </button>
            <button
              onClick={() => {
                setOrgan("brain");
                setDiseaseId(BRAIN_DISEASES[0].id);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
                organ === "brain"
                  ? "bg-[#7C4DFF] text-white shadow-[0_0_15px_rgba(124,77,255,0.4)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Brain size={14} /> Brain
            </button>
          </div>
          <select
            value={diseaseId}
            onChange={(e) => setDiseaseId(e.target.value)}
            data-testid="compare-disease"
            className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-white/30"
          >
            {list.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#07111F]">
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-5">
        <CompareCard label="Healthy" color="#4ADE80">
          <Suspense fallback={<Loading />}>
            <Viewer controls />
          </Suspense>
        </CompareCard>

        <CompareCard label={disease.name} color="#EF4444" damaged>
          <Suspense fallback={<Loading />}>
            <Viewer controls />
          </Suspense>
        </CompareCard>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#00D4FF] mb-2">
          Key differences
        </div>
        <h3 className="font-display text-2xl mb-3">{disease.name}</h3>
        <p className="text-sm text-white/75 leading-relaxed mb-4">
          {disease.summary}
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <Mini label="Symptoms" items={disease.symptoms} color="#00D4FF" />
          <Mini label="Treatments" items={disease.treatments} color="#4ADE80" />
          <Mini label="Risk factors" items={disease.risk_factors} color="#FF5E7D" />
        </div>
      </div>
    </div>
  );
}

function CompareCard({ label, color, damaged, children }) {
  return (
    <div className="relative h-[460px] rounded-3xl glass overflow-hidden grid-overlay">
      {children}
      {damaged && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 55%, ${color}55 0%, transparent 60%)`,
          }}
        />
      )}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <span
          className="px-3 py-1.5 rounded-full text-xs font-medium border"
          style={{
            color,
            borderColor: color + "88",
            background: color + "1f",
          }}
        >
          {label}
        </span>
        <GitCompare size={16} className="text-white/40" />
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="w-full h-full flex items-center justify-center text-white/40">
      Rendering…
    </div>
  );
}

function Mini({ label, items, color }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div
        className="text-[10px] tracking-[0.3em] uppercase mb-2"
        style={{ color }}
      >
        {label}
      </div>
      <ul className="text-sm text-white/80 space-y-1">
        {items.map((i) => (
          <li key={i}>· {i}</li>
        ))}
      </ul>
    </div>
  );
}
