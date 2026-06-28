import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html } from "@react-three/drei";
import * as THREE from "three";

/* ---------- Procedural HEART mesh ---------- */
function HeartMesh({ pulse = true, color = "#FF5E7D" }) {
  const ref = useRef();

  // Build a heart-shaped curve and extrude it for a stylized but anatomical look
  const geometry = React.useMemo(() => {
    const x = 0, y = 0;
    const heartShape = new THREE.Shape();
    heartShape.moveTo(x + 0.5, y + 0.5);
    heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    heartShape.bezierCurveTo(x + 1.3, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
    heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
    const geom = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.65,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 2,
      bevelSize: 0.18,
      bevelThickness: 0.18,
    });
    geom.center();
    geom.rotateZ(Math.PI);
    return geom;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    if (pulse) {
      const beat = 1 + Math.sin(t * 5) * 0.03 + Math.sin(t * 2.5) * 0.02;
      ref.current.scale.set(beat, beat, beat);
    }
    ref.current.rotation.y = t * 0.25;
  });

  return (
    <mesh ref={ref} geometry={geometry} castShadow>
      <meshPhysicalMaterial
        color={color}
        roughness={0.35}
        metalness={0.15}
        clearcoat={0.8}
        clearcoatRoughness={0.25}
        sheen={0.4}
        sheenColor={"#ff8aa3"}
        emissive={"#ff2a5d"}
        emissiveIntensity={0.18}
      />
    </mesh>
  );
}

/* ---------- Procedural BRAIN mesh ---------- */
function BrainMesh({ color = "#7C4DFF" }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.3;
  });

  // Multiple noisy lobes give the impression of gyri
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[1.6, 6]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.4}
          metalness={0.2}
          clearcoat={0.6}
          emissive={"#5a36c9"}
          emissiveIntensity={0.25}
          flatShading
        />
      </mesh>
      {/* Subtle wrinkle bumps */}
      {Array.from({ length: 24 }).map((_, i) => {
        const phi = Math.acos(-1 + (2 * i) / 24);
        const theta = Math.sqrt(24 * Math.PI) * phi;
        const r = 1.55;
        return (
          <mesh key={i} position={[
            r * Math.cos(theta) * Math.sin(phi),
            r * Math.sin(theta) * Math.sin(phi),
            r * Math.cos(phi),
          ]}>
            <sphereGeometry args={[0.22, 24, 24]} />
            <meshPhysicalMaterial
              color={"#9776ff"}
              roughness={0.6}
              metalness={0.1}
              emissive={"#7C4DFF"}
              emissiveIntensity={0.15}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ---------- Public components ---------- */

export function Hero3D({ variant = "both" }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color={"#00D4FF"} />
      <pointLight position={[-5, -3, 4]} intensity={1.0} color={"#FF5E7D"} />
      <directionalLight position={[0, 5, 5]} intensity={0.6} />

      {variant !== "brain" && (
        <Float speed={1.4} floatIntensity={1.2} rotationIntensity={0.4}>
          <group position={[variant === "both" ? -1.8 : 0, 0, 0]} scale={variant === "both" ? 1.05 : 1.4}>
            <HeartMesh />
          </group>
        </Float>
      )}
      {variant !== "heart" && (
        <Float speed={1.0} floatIntensity={1.0} rotationIntensity={0.3}>
          <group position={[variant === "both" ? 1.9 : 0, 0, 0]} scale={variant === "both" ? 1.0 : 1.4}>
            <BrainMesh />
          </group>
        </Float>
      )}

    </Canvas>
  );
}

export function HeartViewer({ pulse = true, controls = true }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.45} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color={"#00D4FF"} />
      <pointLight position={[-4, -2, 3]} intensity={1.0} color={"#FF5E7D"} />
      <directionalLight position={[0, 5, 5]} intensity={0.5} />
      <Float speed={1.2} floatIntensity={0.7} rotationIntensity={0.25}>
        <group scale={1.3}>
          <HeartMesh pulse={pulse} />
        </group>
      </Float>
      {controls && <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={0.6} />}
    </Canvas>
  );
}

export function BrainViewer({ controls = true }) {
  return (
    <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color={"#7C4DFF"} />
      <pointLight position={[-4, -2, 3]} intensity={0.9} color={"#00D4FF"} />
      <directionalLight position={[0, 5, 5]} intensity={0.5} />
      <Float speed={1.0} floatIntensity={0.6} rotationIntensity={0.2}>
        <group scale={1.1}>
          <BrainMesh />
        </group>
      </Float>
      {controls && <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={0.5} />}
    </Canvas>
  );
}
