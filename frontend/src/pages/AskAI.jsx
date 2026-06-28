import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Send, Sparkles, Loader2, Heart, Brain } from "lucide-react";
import { API, useApp } from "../context/AppContext";

const PERSONA_PROMPTS = {
  school_student: [
    "Why does my heart beat faster when I run?",
    "What happens in the brain when I learn something new?",
    "Why do we dream?",
  ],
  medical_student: [
    "Explain the Frank-Starling mechanism.",
    "Compare ischemic vs hemorrhagic stroke pathophysiology.",
    "Describe the conduction system of the heart.",
  ],
  doctor: [
    "Latest evidence on SGLT2 inhibitors in HFpEF?",
    "Management of acute large vessel occlusion in 2026?",
    "When to choose TAVR over SAVR in low-risk patients?",
  ],
};

export default function AskAI() {
  const { persona } = useApp();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your Anatomia AI tutor. Ask me anything about the heart or brain — I'll adapt my answer to your level.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const send = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/tutor/chat`, {
        message: trimmed,
        persona,
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Sorry — I couldn't reach the tutor service. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.medical_student;

  return (
    <div className="grid lg:grid-cols-3 gap-5 h-[calc(100vh-9rem)]" data-testid="ask-ai">
      {/* Chat column */}
      <div className="lg:col-span-2 glass rounded-3xl flex flex-col overflow-hidden">
        <header className="px-6 py-4 border-b border-white/8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C4DFF] to-[#00D4FF] flex items-center justify-center shadow-[0_0_20px_rgba(124,77,255,0.4)]">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="font-display text-lg">Anatomia AI Tutor</div>
            <div className="text-xs text-white/50">
              Gemini 3 Flash · adapts to your persona
            </div>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                data-testid={`msg-${m.role}-${i}`}
                className={`max-w-[80%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[#7C4DFF] text-white rounded-br-md shadow-[0_0_18px_rgba(124,77,255,0.35)]"
                    : "bg-white/6 border border-white/10 text-white/90 rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/6 border border-white/10 rounded-3xl rounded-bl-md px-5 py-3.5 text-sm text-white/60 inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="px-4 py-4 border-t border-white/8 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            data-testid="tutor-input"
            placeholder="Ask anything about the heart or brain…"
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-[#00D4FF]/60 focus:bg-white/10 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            data-testid="tutor-send"
            className="px-5 py-3 rounded-full bg-[#7C4DFF] hover:bg-[#6538E6] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
          >
            <Send size={16} /> Send
          </button>
        </form>
      </div>

      {/* Side: prompts + persona */}
      <aside className="space-y-4">
        <div className="glass rounded-3xl p-6">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#00D4FF] mb-2">
            Persona mode
          </div>
          <div className="font-display text-xl mb-1 capitalize">
            {(persona || "medical_student").replace("_", " ")}
          </div>
          <p className="text-xs text-white/55 leading-relaxed">
            Answers adjust tone, terminology and depth to match.
          </p>
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="font-display text-lg mb-3">Try asking…</h3>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                className="w-full text-left p-3 rounded-2xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="font-display text-lg mb-3">Quick topics</h3>
          <div className="grid grid-cols-2 gap-2">
            <TopicChip icon={<Heart size={14} />} label="Cardiac cycle" onSelect={send} />
            <TopicChip icon={<Heart size={14} />} label="Heart failure" onSelect={send} />
            <TopicChip icon={<Brain size={14} />} label="Memory" onSelect={send} />
            <TopicChip icon={<Brain size={14} />} label="Stroke" onSelect={send} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function TopicChip({ icon, label, onSelect }) {
  return (
    <button
      onClick={() => onSelect(`Explain ${label} in detail.`)}
      className="text-left p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm inline-flex items-center gap-2"
    >
      {icon}
      {label}
    </button>
  );
}
