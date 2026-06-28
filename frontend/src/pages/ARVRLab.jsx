import React, { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { OrbitControls, Float } from "@react-three/drei";
import { Sparkles, Eye, Heart, Brain, Hand } from "lucide-react";
import { AnatomicalHeartInline, AnatomicalBrainInline } from "../components/Anatomy3D";

export default function ARVRLab() {
  const [target, setTarget] = useState("heart");
  const xrStore = useMemo(() => createXRStore(), []);

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

  return (
    <div className="space-y-5" data-testid="arvr-lab">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] mb-2">
            WebXR Beta
          </div>
          <h1 className="font-display font-light text-4xl lg:text-5xl tracking-tight">
            AR / VR Lab
          </h1>
          <p className="text-white/60 text-sm mt-2 max-w-lg">
            Step inside the anatomy. View the heart or brain in your room (AR)
            or walk around it in VR. Requires a WebXR-capable device.
          </p>
        </div>

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
      </header>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 relative h-[540px] rounded-3xl glass overflow-hidden grid-overlay">
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
                  Open the model on a WebXR device.
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
              Desktop Chrome/Edge with a Quest/Vision Pro headset works best.
              On phone, AR launches via WebXR-AR.
            </p>
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="font-display text-lg mb-3 inline-flex items-center gap-2">
              <Hand size={16} /> Gesture tips
            </h3>
            <ul className="text-sm text-white/75 space-y-2">
              <li>· Pinch to grab and rotate the organ</li>
              <li>· Two-hand pinch to scale</li>
              <li>· Trigger to teleport in VR</li>
              <li>· Gaze + dwell to read labels</li>
            </ul>
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="font-display text-lg mb-3 inline-flex items-center gap-2">
              <Sparkles size={16} /> Beta status
            </h3>
            <p className="text-sm text-white/65 leading-relaxed">
              AR/VR is in active beta. Full hand tracking, in-XR narration, and
              disease progression overlays are landing in the next release.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
