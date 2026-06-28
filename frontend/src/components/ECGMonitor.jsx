import React, { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Pause, Play, Volume2, VolumeX } from "lucide-react";

/**
 * Live ECG monitor:
 * - Animated SVG waveform (P, QRS, T) traced left → right
 * - WebAudio-synthesized lub-dub heart sounds (no external assets)
 * - Bpm slider 40–180
 */
export default function ECGMonitor({ defaultBpm = 72 }) {
  const [bpm, setBpm] = useState(defaultBpm);
  const [running, setRunning] = useState(true);
  const [sound, setSound] = useState(false);

  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const cursorRef = useRef(null);

  const audioCtxRef = useRef(null);
  const lastBeatRef = useRef(0);
  const rafRef = useRef(null);

  // ECG waveform — synthesised P/QRS/T for one cardiac cycle, sampled 200 pts
  const cycle = useMemo(() => {
    const pts = [];
    const N = 200;
    for (let i = 0; i < N; i++) {
      const t = i / N; // 0..1
      let y = 0;
      // P wave (small bump)
      y += 6 * Math.exp(-Math.pow((t - 0.12) / 0.025, 2));
      // Q dip
      y -= 4 * Math.exp(-Math.pow((t - 0.21) / 0.012, 2));
      // R spike
      y += 38 * Math.exp(-Math.pow((t - 0.235) / 0.01, 2));
      // S dip
      y -= 8 * Math.exp(-Math.pow((t - 0.27) / 0.013, 2));
      // T wave (slow bump)
      y += 9 * Math.exp(-Math.pow((t - 0.42) / 0.05, 2));
      pts.push(y);
    }
    return pts;
  }, []);

  // Play lub-dub: two short low-frequency thumps via WebAudio
  const playLubDub = () => {
    if (!sound) return;
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtxRef.current = new Ctx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const thump = (when, freqStart, freqEnd, gain = 0.6) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(freqStart, when);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), when + 0.12);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(gain, when + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 0.14);
      osc.type = "sine";
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(when);
      osc.stop(when + 0.18);
    };

    const t0 = ctx.currentTime;
    thump(t0, 90, 45, 0.55);       // S1 (lub)
    thump(t0 + 0.18, 70, 35, 0.4); // S2 (dub)
  };

  // Animate cursor and draw waveform
  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const svg = svgRef.current;
    const W = 600;
    const H = 140;
    const beatMs = 60000 / bpm;
    let cycleStart = performance.now();
    let traced = [];

    const step = (now) => {
      const elapsed = now - cycleStart;
      const phase = (elapsed % beatMs) / beatMs; // 0..1
      // Fire lub-dub at start of each cycle's R peak
      if (sound && now - lastBeatRef.current > beatMs * 0.9) {
        playLubDub();
        lastBeatRef.current = now;
      }
      // Build trace history (last 200 samples)
      const N = 200;
      const idx = Math.floor(phase * N);
      const y = H / 2 - (cycle[idx] || 0);
      traced.push(y);
      if (traced.length > N) traced.shift();

      // Update path
      const pts = traced.map((py, i) => `${(i / (N - 1)) * W},${py}`).join(" ");
      if (pathRef.current) pathRef.current.setAttribute("points", pts);
      if (cursorRef.current) {
        const cx = ((traced.length - 1) / (N - 1)) * W;
        cursorRef.current.setAttribute("cx", cx);
        cursorRef.current.setAttribute("cy", y);
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [bpm, running, sound, cycle]);

  return (
    <div className="glass rounded-3xl p-5" data-testid="ecg-monitor">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#FF5E7D]/20 border border-[#FF5E7D]/50 flex items-center justify-center">
            <Heart size={16} color="#FF5E7D" className={running ? "heartbeat" : ""} />
          </div>
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-[#FF5E7D]">
              Live ECG
            </div>
            <div className="font-display text-2xl leading-none">
              {bpm} <span className="text-xs text-white/55">bpm</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setRunning((r) => !r)}
            className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
            aria-label={running ? "Pause" : "Play"}
            data-testid="ecg-toggle-run"
          >
            {running ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={() => setSound((s) => !s)}
            className={`p-2 rounded-full border transition-all ${
              sound
                ? "bg-[#00D4FF]/20 border-[#00D4FF]/50 text-[#00D4FF]"
                : "bg-white/5 border-white/10"
            }`}
            aria-label={sound ? "Mute" : "Unmute"}
            data-testid="ecg-toggle-sound"
          >
            {sound ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
        <svg ref={svgRef} viewBox="0 0 600 140" className="w-full h-28">
          {/* Grid */}
          <defs>
            <pattern id="ecgGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,212,255,0.07)" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="ecgGlow" x1="0" x2="1">
              <stop offset="0" stopColor="#00D4FF" stopOpacity="0" />
              <stop offset="1" stopColor="#00D4FF" stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect width="600" height="140" fill="url(#ecgGrid)" />
          <line x1="0" y1="70" x2="600" y2="70" stroke="rgba(0,212,255,0.15)" strokeWidth="0.5" />
          <polyline
            ref={pathRef}
            fill="none"
            stroke="url(#ecgGlow)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(0,212,255,0.7))" }}
          />
          <circle ref={cursorRef} r="3" fill="#00D4FF" style={{ filter: "drop-shadow(0 0 6px #00D4FF)" }} />
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-[10px] tracking-[0.25em] uppercase text-white/45 w-12">Bpm</span>
        <input
          type="range"
          min={40}
          max={180}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          data-testid="ecg-bpm"
          className="flex-1 accent-[#FF5E7D]"
        />
        <span className="font-mono text-xs text-white/60 w-8 text-right">{bpm}</span>
      </div>
    </div>
  );
}
