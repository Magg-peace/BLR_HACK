import React, { useMemo } from "react";

/**
 * Pure-CSS ambient particle field. Lightweight, GPU-friendly.
 * No external dependencies.
 */
export default function Particles({ count = 30, className = "" }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        size: 2 + Math.random() * 5,
        left: Math.random() * 100,
        bottom: -Math.random() * 60,
        duration: 14 + Math.random() * 22,
        delay: Math.random() * 18,
        hue: Math.random() > 0.5 ? "rgba(0,212,255,0.85)" : "rgba(124,77,255,0.85)",
      })),
    [count]
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, ${p.hue}, transparent 70%)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
