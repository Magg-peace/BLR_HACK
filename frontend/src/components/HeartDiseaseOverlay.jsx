import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Animated disease overlay rendered as part of the heart 3D scene.
 * - severity: 0..1 — controls how much plaque is grown
 * - disease id maps to a specific anatomical effect
 *
 * Effects:
 *   "cad" / "mi" → plaque nodes growing along the coronary arteries (red glow + occlusion ring)
 *   "heart-failure" → ventricular wall thickening glow (purple haze)
 *   "arrhythmia" → erratic spark pulses across conduction zone
 *   "valve-disease" → glowing rings on mitral/aortic valves
 */
export default function HeartDiseaseOverlay({ disease = "cad", severity = 0.5 }) {
  const group = useRef();

  // Pulse used by some effects
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    if (disease === "arrhythmia") {
      group.current.children.forEach((c, i) => {
        c.scale.setScalar(0.7 + (Math.sin(t * (4 + i * 1.2)) * 0.5 + 0.5) * 0.8 * severity);
      });
    } else {
      // gentle breathing pulse
      const s = 1 + Math.sin(t * 1.4) * 0.04 * severity;
      group.current.scale.setScalar(s);
    }
  });

  if (disease === "cad" || disease === "mi") {
    return <CoronaryPlaque severity={severity} ref={group} key={disease} mode={disease} />;
  }
  if (disease === "heart-failure") {
    return <VentricleHaze severity={severity} ref={group} key={disease} />;
  }
  if (disease === "arrhythmia") {
    return <ArrhythmiaSparks severity={severity} ref={group} key={disease} />;
  }
  if (disease === "valve-disease") {
    return <ValveRings severity={severity} ref={group} key={disease} />;
  }
  return null;
}

/* ---------------- CAD / MI: coronary plaque nodes ---------------- */
const CoronaryPlaque = React.forwardRef(({ severity, mode }, ref) => {
  // Hand-placed nodes along the surface of the heart geometry
  const nodes = useMemo(
    () => [
      [-0.45, 0.25, 0.65, 0.13],
      [-0.55, -0.05, 0.6, 0.12],
      [-0.40, -0.35, 0.6, 0.11],
      [-0.25, -0.55, 0.55, 0.10],
      [0.35, 0.30, 0.55, 0.12],
      [0.50, 0.05, 0.55, 0.11],
      [0.30, -0.30, 0.55, 0.10],
      [0.10, -0.55, 0.55, 0.09],
    ],
    []
  );

  // How many appear based on severity (0..1)
  const visibleCount = Math.max(1, Math.round(nodes.length * severity));

  // Color: amber → red as severity climbs; brighter red for MI
  const baseColor = new THREE.Color(mode === "mi" ? "#ff2a2a" : "#ff6b1a");
  const hotColor = new THREE.Color(mode === "mi" ? "#ff0000" : "#ff3030");

  return (
    <group ref={ref} position={[0, -0.2, 0]}>
      {nodes.slice(0, visibleCount).map((n, i) => {
        const grow = (i + 1) / visibleCount; // bigger toward end
        const color = baseColor.clone().lerp(hotColor, severity);
        const size = n[3] * (0.6 + severity * 1.2) * (0.7 + grow * 0.5);
        return (
          <mesh key={i} position={[n[0], n[1], n[2]]}>
            <sphereGeometry args={[size, 20, 20]} />
            <meshPhysicalMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8 + severity * 1.2}
              roughness={0.4}
            />
            {/* Heat halo for MI */}
            {mode === "mi" && severity > 0.5 && (
              <pointLight color="#ff3030" intensity={1.5 * severity} distance={0.8} />
            )}
          </mesh>
        );
      })}

      {/* For MI severity > 0.7, add a dark necrosis patch on LV apex */}
      {mode === "mi" && severity > 0.7 && (
        <mesh position={[-0.18, -0.92, 0.05]} scale={1.05 + severity * 0.15}>
          <sphereGeometry args={[0.34, 32, 32]} />
          <meshPhysicalMaterial
            color="#2a0508"
            emissive="#3a0000"
            emissiveIntensity={0.4}
            roughness={1}
          />
        </mesh>
      )}
    </group>
  );
});

/* ---------------- Heart Failure: purple ventricular haze ---------------- */
const VentricleHaze = React.forwardRef(({ severity }, ref) => {
  return (
    <group ref={ref} position={[0, -0.5, 0]}>
      <mesh scale={[1, 1.3, 1]}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial
          color={"#9333ea"}
          transparent
          opacity={0.18 * severity + 0.08}
        />
      </mesh>
      {/* edema rings */}
      {[0.8, 1.05, 1.3].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.4 + i * 0.15, 0]}>
          <torusGeometry args={[r, 0.02 + severity * 0.04, 8, 64]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.4 + severity * 0.4} />
        </mesh>
      ))}
    </group>
  );
});

/* ---------------- Arrhythmia: scattered sparks across conduction zone ------ */
const ArrhythmiaSparks = React.forwardRef(({ severity }, ref) => {
  const sparks = useMemo(() => {
    const arr = [];
    const n = 10 + Math.floor(severity * 16);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      arr.push([Math.cos(a) * 0.75, -0.1 + Math.sin(i * 1.3) * 0.6, Math.sin(a) * 0.5]);
    }
    return arr;
  }, [severity]);

  return (
    <group ref={ref}>
      {sparks.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={"#fde047"} />
        </mesh>
      ))}
    </group>
  );
});

/* ---------------- Valve Disease: glowing rings ---------------- */
const ValveRings = React.forwardRef(({ severity }, ref) => {
  return (
    <group ref={ref}>
      {/* Mitral */}
      <mesh position={[-0.32, 0.05, 0]} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[0.22, 0.025 + severity * 0.025, 16, 64]} />
        <meshBasicMaterial color="#FF5E7D" />
      </mesh>
      {/* Aortic */}
      <mesh position={[0.0, 0.4, 0.08]} rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[0.18, 0.022 + severity * 0.025, 16, 64]} />
        <meshBasicMaterial color="#FF5E7D" />
      </mesh>
      {/* Tricuspid */}
      <mesh position={[0.38, 0.08, 0.15]} rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[0.22, 0.02 + severity * 0.02, 16, 64]} />
        <meshBasicMaterial color="#FF5E7D" />
      </mesh>
      {/* Pulmonary */}
      <mesh position={[-0.15, 0.4, 0.1]} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[0.16, 0.02 + severity * 0.02, 16, 64]} />
        <meshBasicMaterial color="#FF5E7D" />
      </mesh>
    </group>
  );
});
