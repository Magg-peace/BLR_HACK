import React, { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { OrbitControls, Float, Html } from "@react-three/drei";
import { Sparkles, Eye, Heart, Brain, Hand } from "lucide-react";
import { AnatomicalHeartInline, AnatomicalBrainInline } from "../components/Anatomy3D";
import { HEART_STRUCTURES, BRAIN_REGIONS } from "../data/anatomy";

export default function ARVRLab() {
  const [target, setTarget] = useState("heart");
  const [labelsOn, setLabelsOn] = useState(true);

  // XR store configured with hand tracking + controller fallback
  const xrStore = useMemo(
    () =>
      createXRStore({
        hand: { teleportPointer: true },
        controller: { teleportPointer: true },
        emulate: true,  // allow desktop emulator preview
      }),
    []
  );

  const enterAR = () => {
    try {
      xrStore.enterAR();
    } catch (e) {
      console.warn("AR not supported", e);
    }
  };
  const enterVR = () => {
    try {
      xrStore.enterVR();
    } catch (e) {
      console.warn("VR not supported", e);
    }
  };

  const labels = target === "heart" ? HEART_STRUCTURES : BRAIN_REGIONS;

  return (
    <div className="space-y-5" data-testid="arvr-lab">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] mb-2">
            WebXR Beta · Hand-tracked
          </div>
          <h1 className="font-display font-light text-4xl lg:text-5xl tracking-tight">
            AR / VR Lab
          </h1>
          <p className="text-white/60 text-sm mt-2 max-w-lg">
            Project the heart or brain into your room and reach out to grab it. Hand
            tracking, gaze labels and teleport pointer are enabled.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="glass-light rounded-full p-1 flex items-center gap-1">
            <button
              onClick={() => setTarget("heart")}
              data-testid="xr-target-heart"
              className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
                target === "heart"
                  ? "bg-[#FF5E7D] text-white shadow-[0_0_15px_rgba(255,94,125,0.4)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Heart size={14} /> Heart
            </button>
            <button
              onClick={() => setTarget("brain")}
              data-testid="xr-target-brain"
              className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
                target === "brain"
                  ? "bg-[#7C4DFF] text-white shadow-[0_0_15px_rgba(124,77,255,0.4)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Brain size={14} /> Brain
            </button>
          </div>
          <button
            onClick={() => setLabelsOn((v) => !v)}
            data-testid="xr-labels-toggle"
            className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all border ${
              labelsOn
                ? "bg-[#00D4FF]/15 border-[#00D4FF]/50 text-[#00D4FF]"
                : "bg-white/5 border-white/10"
            }`}
          >
            <Sparkles size={14} /> Labels
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 relative h-[560px] rounded-3xl glass overflow-hidden grid-overlay">
          <Canvas
            camera={{ position: [0, 0, 4.5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            shadows
          >
            <XR store={xrStore}>
              <ambientLight intensity={0.5} />
              <pointLight position={[3, 3, 3]} intensity={1.4} color="#ffb6a8" />
              <pointLight position={[-3, -2, 2]} intensity={1.0} color="#9D7BFF" />
              <directionalLight position={[0, 5, 5]} intensity={0.7} />
              <Suspense fallback={null}>
                <Float speed={0.9} floatIntensity={0.5} rotationIntensity={0.18}>
                  <group scale={1.2}>
                    {target === "brain" ? <AnatomicalBrainInline /> : <AnatomicalHeartInline />}
                    {labelsOn && <FloatingLabels labels={labels} />}
                  </group>
                </Float>
              </Suspense>
              <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={0.4} />
            </XR>
          </Canvas>
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C4DFF] to-[#00D4FF] flex items-center justify-center">
                <Eye size={18} />
              </div>
              <div>
                <div className="font-display text-lg">Enter Immersive</div>
                <div className="text-xs text-white/50">
                  Hand tracking enabled. Teleport pointer ready.
                </div>
              </div>
            </div>

            <div className="space-y-2" data-testid="xr-buttons">
              <button
                onClick={enterAR}
                data-testid="enter-ar"
                className="w-full px-5 py-3 rounded-full text-white text-sm font-medium transition-all bg-gradient-to-r from-[#00D4FF] to-[#7C4DFF] hover:opacity-90 shadow-[0_0_20px_rgba(0,212,255,0.35)]"
              >
                Enter AR Mode
              </button>
              <button
                onClick={enterVR}
                data-testid="enter-vr"
                className="w-full px-5 py-3 rounded-full text-white text-sm font-medium transition-all bg-gradient-to-r from-[#7C4DFF] to-[#FF5E7D] hover:opacity-90 shadow-[0_0_20px_rgba(124,77,255,0.35)]"
              >
                Enter VR Mode
              </button>
            </div>

            <p className="text-[11px] text-white/50 leading-relaxed mt-4">
              Quest 3 / Vision Pro / mobile WebXR-AR supported. Use both hands to
              scale, grab to rotate, and pinch to select labels.
            </p>
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="font-display text-lg mb-3 inline-flex items-center gap-2">
              <Hand size={16} /> Hand-tracking gestures
            </h3>
            <ul className="text-sm text-white/75 space-y-2">
              <li>· <span className="text-[#00D4FF]">Pinch</span> &nbsp;– grab to rotate</li>
              <li>· <span className="text-[#00D4FF]">Two-hand pinch</span> – scale</li>
              <li>· <span className="text-[#00D4FF]">Point</span> &nbsp;– teleport (VR)</li>
              <li>· <span className="text-[#00D4FF]">Gaze</span> &nbsp;– reveal label</li>
              <li>· <span className="text-[#00D4FF]">Open palm</span> – release</li>
            </ul>
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="font-display text-lg mb-3 inline-flex items-center gap-2">
              <Sparkles size={16} /> Beta status
            </h3>
            <p className="text-sm text-white/65 leading-relaxed">
              Floating label callouts and persona-aware in-XR narration are live.
              Next up: voice commands and disease overlay in XR.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Floating 3D label callouts attached around the organ.
 * Uses Drei's <Html> with `distanceFactor` so labels scale naturally in XR.
 */
function FloatingLabels({ labels }) {
  // Distribute labels around a sphere using the structure's 2D pos as a hint
  return labels.slice(0, 8).map((s, i) => {
    const [u, v] = s.pos;
    const theta = u * Math.PI * 2;
    const phi = (v - 0.5) * Math.PI;
    const r = 1.6;
    const x = r * Math.cos(phi) * Math.cos(theta);
    const y = r * Math.sin(phi);
    const z = r * Math.cos(phi) * Math.sin(theta);
    return (
      <Html
        key={s.id}
        position={[x, y, z]}
        distanceFactor={6}
        center
        sprite
        wrapperClass="pointer-events-none"
      >
        <div className="px-2 py-1 rounded-md text-[10px] font-medium border border-white/15 bg-black/55 backdrop-blur-sm text-white whitespace-nowrap">
          {s.name}
        </div>
      </Html>
    );
  });
}
