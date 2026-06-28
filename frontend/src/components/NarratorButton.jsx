import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

/**
 * Browser-native narrator using Web Speech API (SpeechSynthesis).
 * No external API key needed. Falls back gracefully if unsupported.
 */
export default function NarratorButton({ text, label = "Narrate", className = "" }) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const utterRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-stop when text changes
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [text]);

  if (!supported || !text) return null;

  const start = () => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.0;
    u.volume = 1.0;

    // Prefer a high-quality voice if available
    const voices = synth.getVoices();
    const preferred =
      voices.find((v) => /en[-_](US|GB|AU)/i.test(v.lang) && /Google|Microsoft|Natural|Samantha|Daniel/i.test(v.name)) ||
      voices.find((v) => /en/i.test(v.lang)) ||
      voices[0];
    if (preferred) u.voice = preferred;

    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    synth.speak(u);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <button
      onClick={speaking ? stop : start}
      data-testid="narrator-btn"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
        speaking
          ? "bg-[#00D4FF]/15 border-[#00D4FF]/50 text-[#00D4FF]"
          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
      } ${className}`}
      aria-pressed={speaking}
    >
      {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
      {speaking ? "Stop" : label}
    </button>
  );
}
