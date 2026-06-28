import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API, useApp } from "../context/AppContext";

/**
 * Receives the Emergent OAuth fragment (#session_id=...).
 * Exchanges it for a session_token cookie via backend, then routes to dashboard.
 *
 * REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const processed = useRef(false);
  const { checkAuth, setPersona } = useApp();

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const run = async () => {
      const fragment = window.location.hash || "";
      const m = fragment.match(/session_id=([^&]+)/);
      if (!m) {
        navigate("/", { replace: true });
        return;
      }
      const sessionId = decodeURIComponent(m[1]);

      try {
        await axios.post(`${API}/auth/session`, { session_id: sessionId });
        await checkAuth();

        const pending = localStorage.getItem("anatomia_pending_persona");
        if (pending) {
          await setPersona(pending);
          localStorage.removeItem("anatomia_pending_persona");
        }
        // Clean URL
        window.history.replaceState({}, "", "/app");
        navigate("/app", { replace: true });
      } catch (e) {
        console.error("Auth callback failed", e);
        navigate("/", { replace: true });
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07111F] text-white/70">
      <div className="font-display text-lg animate-pulse">Signing you in…</div>
    </div>
  );
}
