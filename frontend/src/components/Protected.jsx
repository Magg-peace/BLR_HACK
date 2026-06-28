import React, { Suspense, lazy, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const DashboardLayout = lazy(() => import("./DashboardLayout"));

/**
 * Wraps dashboard pages. Behavior:
 * - If not authenticated → redirect to landing ('/').
 * - If authenticated but no persona selected → redirect to /select-persona.
 */
export default function Protected({ children }) {
  const { user, persona, loading } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user && !persona) navigate("/select-persona", { replace: true });
  }, [loading, user, persona, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07111F] text-white/70">
        <div className="font-display text-lg animate-pulse">Loading Anatomia…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (!persona) return null;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#07111F] text-white/70">
          Loading…
        </div>
      }
    >
      <DashboardLayout>{children}</DashboardLayout>
    </Suspense>
  );
}
