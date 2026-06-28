import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { API } from "../context/AppContext";

/**
 * Cinematic narrator: tries OpenAI TTS (server endpoint), falls back to Web Speech API.
 * Persona is read from useApp context if available.
 */
export default function NarratorButton({ text, persona, label = "Narrate", className = "", auto = false }) {
  const [state, setState] = useState("idle"); // idle | loading | playing
  const audioRef = useRef(null);
  const speechSupported = typeof window !== "undefined" && !!window.speechSynthesis;

  // Stop on text change / unmount
  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    stop();
    if (auto && text) setTimeout(() => play(), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (speechSupported) window.speechSynthesis.cancel();
    setState("idle");
  };

  const playWebSpeech = () => {
    if (!speechSupported) return false;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.97;
      u.pitch = 1.0;
      u.volume = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => /en/i.test(v.lang) && /Natural|Samantha|Daniel|Google/i.test(v.name)) ||
                         voices.find((v) => /en/i.test(v.lang)) || voices[0];
      if (preferred) u.voice = preferred;
      u.onstart = () => setState("playing");
      u.onend = () => setState("idle");
      u.onerror = () => setState("idle");
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      return true;
    } catch {
      return false;
    }
  };

  const play = async () => {
    if (!text) return;
    setState("loading");
    try {
      const res = await fetch(`${API}/tts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, persona }),
      });
      if (!res.ok) throw new Error("tts failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setState("idle");
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setState("idle");
        URL.revokeObjectURL(url);
      };
      await audio.play();
      setState("playing");
    } catch (e) {
      // Fallback to web speech
      const ok = playWebSpeech();
      if (!ok) setState("idle");
    }
  };

  if (!text) return null;

  return (
    <button
      onClick={state === "idle" ? play : stop}
      disabled={state === "loading"}
      data-testid="narrator-btn"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
        state === "playing"
          ? "bg-[#00D4FF]/15 border-[#00D4FF]/50 text-[#00D4FF]"
          : state === "loading"
          ? "bg-white/5 border-white/15 text-white/55"
          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
      } ${className}`}
      aria-pressed={state === "playing"}
    >
      {state === "loading" ? (
        <Loader2 size={14} className="animate-spin" />
      ) : state === "playing" ? (
        <VolumeX size={14} />
      ) : (
        <Volume2 size={14} />
      )}
      {state === "loading" ? "Loading…" : state === "playing" ? "Stop" : label}
    </button>
  );
}
