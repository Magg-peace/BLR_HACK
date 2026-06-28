import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Backpack, Stethoscope, BriefcaseMedical, ArrowRight, LogIn } from "lucide-react";
import Particles from "../components/Particles";
import { useApp, API } from "../context/AppContext";

const OPTIONS = [
  {
    id: "school_student",
    label: "School Student",
    sub: "Stories, analogies, simple language",
    icon: Backpack,
    accent: "#00D4FF",
    sample: "“The heart is a powerful pump that keeps blood traveling everywhere you go.”",
  },
  {
    id: "medical_student",
    label: "Medical Student",
    sub: "Anatomy, physiology, pathology",
    icon: Stethoscope,
    accent: "#7C4DFF",
    sample: "“The LV generates systemic arterial pressure through concentric myocardial contraction.”",
  },
  {
    id: "doctor",
    label: "Doctor",
    sub: "Clinical insights, decision making",
    icon: BriefcaseMedical,
    accent: "#FF5E7D",
    sample: "“Severe AS with mean gradient >40 mmHg — discuss TAVR vs SAVR per STS risk.”",
  },
];

export default function SelectPersona() {
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, setPersona } = useApp();

  const handleContinue = async () => {
    if (!selected) return;

    if (!user) {
      // Save locally so they have it after auth
      localStorage.setItem("anatomia_pending_persona", selected);
      // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
      const redirectUrl = window.location.origin + "/auth/callback";
      window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(
        redirectUrl
      )}`;
      return;
    }

    setSubmitting(true);
    await setPersona(selected);
    setSubmitting(false);
    navigate("/app", { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111F] text-white flex flex-col">
      <div className="aurora-bg" />
      <Particles count={28} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-16 flex-1 w-full flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] mb-4">
            Step 1 of 2
          </div>
          <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-4">
            Who are you, <span className="text-gradient">explorer?</span>
          </h1>
          <p className="text-white/65 max-w-xl mx-auto">
            Your selection shapes every explanation, quiz and narration. You can
            change it anytime from the dashboard.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {OPTIONS.map((opt, i) => {
            const isSelected = selected === opt.id;
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => setSelected(opt.id)}
                data-testid={`persona-${opt.id}`}
                className={`text-left p-7 rounded-3xl glass-interactive relative overflow-hidden group ${
                  isSelected
                    ? "!bg-white/12 !border-white/35"
                    : ""
                }`}
                style={isSelected ? { boxShadow: `0 0 0 1px ${opt.accent}, 0 0 35px ${opt.accent}44` } : undefined}
              >
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-25 group-hover:opacity-55 transition-opacity"
                  style={{ background: opt.accent }}
                />
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: `${opt.accent}1f`,
                    border: `1px solid ${opt.accent}55`,
                  }}
                >
                  <opt.icon size={24} strokeWidth={1.6} color={opt.accent} />
                </div>
                <h3 className="font-display text-2xl mb-1">{opt.label}</h3>
                <p className="text-white/55 text-sm mb-5">{opt.sub}</p>
                <div
                  className="text-sm leading-relaxed italic text-white/70 border-l-2 pl-4 py-1"
                  style={{ borderColor: opt.accent }}
                >
                  {opt.sample}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={() => navigate("/")}
            className="text-white/55 hover:text-white text-sm transition-colors"
          >
            ← Back
          </button>
          <button
            disabled={!selected || submitting}
            onClick={handleContinue}
            data-testid="persona-continue"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#7C4DFF] hover:bg-[#6538E6] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium shadow-[0_0_30px_rgba(124,77,255,0.5)] transition-all"
          >
            {user ? (
              <>
                Continue
                <ArrowRight size={18} />
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign in with Google
              </>
            )}
          </button>
        </div>

        {!user && (
          <p className="text-center text-xs text-white/40 mt-6 max-w-md mx-auto">
            We use Google sign-in to save your progress, persona, and AI tutor
            conversations across devices.
          </p>
        )}
      </div>
    </div>
  );
}
