import React, { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Heart,
  Brain,
  Activity,
  GraduationCap,
  Sparkles,
  Eye,
  Layers3,
  Compass,
} from "lucide-react";
import Particles from "../components/Particles";

const Hero3D = lazy(() =>
  import("../components/Anatomy3D").then((m) => ({ default: m.Hero3D }))
);

const FEATURES = [
  {
    icon: Heart,
    title: "Interactive Anatomy",
    body: "Rotate, dissect and isolate every chamber of the heart and lobe of the brain — in real time.",
    accent: "#FF5E7D",
  },
  {
    icon: Activity,
    title: "Disease Simulator",
    body: "Watch pathology unfold step-by-step, from a fatty streak to a full myocardial infarction.",
    accent: "#7C4DFF",
  },
  {
    icon: Compass,
    title: "Guided Tours",
    body: "Cinematic camera fly-throughs of the cardiac cycle, neural signal, memory formation and more.",
    accent: "#00D4FF",
  },
  {
    icon: GraduationCap,
    title: "Adaptive AI Tutor",
    body: "A Gemini-powered tutor that speaks your language — student, medical student, or doctor.",
    accent: "#4ADE80",
  },
  {
    icon: Eye,
    title: "AR / VR Ready",
    body: "Architecture primed for WebXR — bring anatomy into your room or step inside the body.",
    accent: "#F59E0B",
  },
  {
    icon: Layers3,
    title: "Layer System",
    body: "Skeletal, muscular, vascular, nervous — peel back the body, layer by layer.",
    accent: "#FF5E7D",
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111F] text-white">
      <div className="aurora-bg" />
      <Particles count={36} />

      {/* Nav */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7C4DFF] to-[#00D4FF] flex items-center justify-center shadow-[0_0_30px_rgba(124,77,255,0.55)]">
            <Sparkles size={22} strokeWidth={1.6} />
          </div>
          <div>
            <div className="font-display text-xl leading-none">Anatomia AI</div>
            <div className="text-[10px] tracking-[0.3em] text-[#00D4FF] uppercase mt-1">
              Heart & Brain Atlas
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#vision" className="hover:text-white transition-colors">
            Vision
          </a>
          <a href="#preview" className="hover:text-white transition-colors">
            Preview
          </a>
        </nav>

        <Link
          to="/select-persona"
          data-testid="nav-cta"
          className="px-5 py-2.5 rounded-full bg-white/8 border border-white/15 hover:bg-white/15 transition-all text-sm font-medium backdrop-blur-md"
        >
          Begin Exploration
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-10 pb-24 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-xs tracking-widest uppercase text-[#00D4FF] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
            Powered by Gemini · Real-time 3D
          </div>
          <h1 className="font-display font-light text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.02] mb-6">
            Explore the
            <br />
            <span className="text-gradient">Human Body</span>
            <br />
            Like Never Before.
          </h1>
          <p className="text-lg text-white/70 max-w-xl leading-relaxed mb-10">
            Immersive AI-powered exploration of the Heart and Brain.
            Cinematic 3D, adaptive narration, and a tutor that knows
            whether you're 12 or a cardiologist.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/select-persona"
              data-testid="hero-cta-explore"
              className="group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#7C4DFF] hover:bg-[#6538E6] text-white font-medium shadow-[0_0_30px_rgba(124,77,255,0.5)] hover:shadow-[0_0_45px_rgba(124,77,255,0.75)] transition-all"
            >
              Start Exploring
              <ArrowRight
                size={18}
                strokeWidth={2}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/85 transition-all"
            >
              See what's inside
            </a>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            {[
              { k: "60+", v: "Structures" },
              { k: "10", v: "Diseases" },
              { k: "6", v: "Guided Tours" },
            ].map((s) => (
              <div key={s.v}>
                <div className="font-display text-3xl font-light text-white">
                  {s.k}
                </div>
                <div className="text-xs uppercase tracking-widest text-white/50 mt-1">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="relative h-[460px] lg:h-[560px] rounded-3xl glass overflow-hidden"
        >
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center text-white/40">
                Initializing 3D atlas…
              </div>
            }
          >
            <Hero3D variant="both" />
          </Suspense>
          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-xs text-white/60">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5E7D] heartbeat" />
              Heart · 72 bpm
            </span>
            <span className="flex items-center gap-2">
              Brain · 12 Hz alpha
              <span className="w-2 h-2 rounded-full bg-[#7C4DFF] animate-pulse" />
            </span>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-20"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] mb-3">
              The Platform
            </div>
            <h2 className="font-display font-light text-4xl lg:text-5xl tracking-tight max-w-2xl">
              A medical atlas reimagined for the AI generation.
            </h2>
          </div>
          <p className="text-white/65 max-w-md text-base leading-relaxed">
            Every feature designed to adapt — from the way structures are
            described to how diseases are visualized, the experience reshapes
            itself for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.07 }}
              className="glass-interactive rounded-3xl p-7 group relative overflow-hidden"
            >
              <div
                className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity"
                style={{ background: f.accent }}
              />
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: `${f.accent}22`,
                  boxShadow: `0 0 24px ${f.accent}33`,
                  border: `1px solid ${f.accent}55`,
                }}
              >
                <f.icon size={20} strokeWidth={1.6} color={f.accent} />
              </div>
              <h3 className="font-display text-xl mb-2">{f.title}</h3>
              <p className="text-white/65 text-sm leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Adaptive band */}
      <section
        id="vision"
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-20"
      >
        <div className="glass rounded-3xl p-10 lg:p-14 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] mb-3">
              Adaptive Intelligence
            </div>
            <h2 className="font-display font-light text-3xl lg:text-4xl tracking-tight">
              One platform.
              <br />
              Three minds.
            </h2>
            <p className="text-white/65 text-sm mt-5 leading-relaxed">
              The same heart structure, described three different ways —
              tailored to who you are and what you need to learn.
            </p>
          </div>

          <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4">
            {[
              {
                tag: "School Student",
                quote:
                  "“The left ventricle acts like a powerful pump that sends blood throughout the body.”",
                color: "#00D4FF",
              },
              {
                tag: "Medical Student",
                quote:
                  "“The LV generates systemic arterial pressure through concentric myocardial contraction.”",
                color: "#7C4DFF",
              },
              {
                tag: "Doctor",
                quote:
                  "“LVEF and GLS guide HF prognosis; consider ARNI + SGLT2i + MRA in HFrEF.”",
                color: "#FF5E7D",
              },
            ].map((p) => (
              <div
                key={p.tag}
                className="rounded-2xl p-5 bg-white/5 border border-white/10 flex flex-col gap-3"
              >
                <span
                  className="inline-flex w-fit text-[10px] tracking-[0.25em] uppercase px-3 py-1 rounded-full"
                  style={{
                    background: `${p.color}22`,
                    color: p.color,
                    border: `1px solid ${p.color}55`,
                  }}
                >
                  {p.tag}
                </span>
                <p className="text-sm text-white/80 leading-relaxed">{p.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="preview"
        className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10 py-20 text-center"
      >
        <h2 className="font-display font-light text-4xl lg:text-6xl tracking-tight leading-tight mb-6">
          Ready to step
          <br />
          <span className="text-gradient">inside the body?</span>
        </h2>
        <p className="text-white/65 max-w-xl mx-auto mb-10">
          Sign in, choose your persona, and begin exploring the most intricate
          machines in the universe — your heart and your brain.
        </p>
        <Link
          to="/select-persona"
          data-testid="footer-cta"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#7C4DFF] hover:bg-[#6538E6] text-white font-medium shadow-[0_0_30px_rgba(124,77,255,0.5)] transition-all"
        >
          Begin Exploration
          <ArrowRight size={18} strokeWidth={2} />
        </Link>
      </section>

      <footer className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-10 border-t border-white/5 mt-12 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-white/50">
        <span>© {new Date().getFullYear()} Anatomia AI · Built for learners.</span>
        <span className="font-mono">v0.1.0 · experimental</span>
      </footer>
    </div>
  );
}
