import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [persona, setPersona] = useState(
    () => localStorage.getItem("anatomia_persona") || null
  );
  const [loading, setLoading] = useState(true);
  const [narrationOn, setNarrationOn] = useState(true);

  const checkAuth = useCallback(async () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    try {
      const res = await axios.get(`${API}/auth/me`);
      setUser(res.data);
      if (res.data.persona) {
        setPersona(res.data.persona);
        localStorage.setItem("anatomia_persona", res.data.persona);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const updatePersona = async (p) => {
    setPersona(p);
    localStorage.setItem("anatomia_persona", p);
    if (user) {
      try {
        await axios.post(`${API}/user/persona`, { persona: p });
      } catch (e) {
        console.warn("persona save failed", e);
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
    } catch {}
    setUser(null);
    setPersona(null);
    localStorage.removeItem("anatomia_persona");
    window.location.href = "/";
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        persona,
        setPersona: updatePersona,
        loading,
        checkAuth,
        logout,
        narrationOn,
        setNarrationOn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
