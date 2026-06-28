import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import HeartDiseaseOverlay from "./HeartDiseaseOverlay";
import { CameraFlythrough } from "./CameraFlythrough";

/* =========================================================
   ANATOMICAL HEART  — composite mesh
   ========================================================= */

const HEART_TISSUE = (color = "#c01a2e", emissive = "#5a0010") =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.42,
    metalness: 0.08,
    clearcoat: 0.85,
    clearcoatRoughness: 0.35,
    sheen: 0.6,
    sheenColor: new THREE.Color("#ff6677"),
    sheenRoughness: 0.5,
    emissive: new THREE.Color(emissive),
    emissiveIntensity: 0.22,
    transmission: 0.04,
    thickness: 0.6,
  });

const VESSEL = (color, emissive = "#1a0000", em = 0.15) =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.32,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.18,
    sheen: 0.4,
    sheenColor: new THREE.Color(color),
    emissive: new THREE.Color(emissive),
    emissiveIntensity: em,
  });

function AnatomicalHeart({ pulse = true }) {
  const group = useRef();
  const heartMat = useMemo(() => HEART_TISSUE("#b71c1c", "#3b0008"), []);
  const muscleMat = useMemo(() => HEART_TISSUE("#a01825", "#28000a"), []);
  const aortaMat = useMemo(() => VESSEL("#e6c4a8", "#2a1208", 0.05), []);
  const arteryMat = useMemo(() => VESSEL("#c81d2c", "#3a0008", 0.18), []);
  const veinMat = useMemo(() => VESSEL("#1d4cc8", "#04122a", 0.18), []);
  const fatMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#e9c47a",
        roughness: 0.7,
        metalness: 0.0,
        sheen: 0.5,
        sheenColor: new THREE.Color("#fff2c2"),
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    if (pulse) {
      // Biological-ish heartbeat: sharp systole, slow diastole
      const beat =
        1 +
        Math.max(0, Math.sin(t * 4.5)) * 0.04 +
        Math.max(0, Math.sin(t * 4.5 - 0.3)) * 0.025;
      group.current.scale.set(beat, beat, beat);
    }
    group.current.rotation.y = t * 0.18;
  });

  // Curved aorta path
  const aortaCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.55, 0.08),
      new THREE.Vector3(0.05, 0.95, 0.05),
      new THREE.Vector3(-0.05, 1.25, 0.0),
      new THREE.Vector3(-0.55, 1.35, -0.05),
      new THREE.Vector3(-0.95, 1.05, -0.1),
    ]);
  }, []);

  const pulmonaryCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 0.5, 0.1),
      new THREE.Vector3(-0.3, 0.95, 0.15),
      new THREE.Vector3(-0.55, 1.15, 0.05),
    ]);
  }, []);

  // Coronary arteries — winding small tubes
  const coronaryLeft = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 30; i++) {
      const a = i / 29;
      pts.push(
        new THREE.Vector3(
          0.55 * Math.cos(a * Math.PI * 2.2 + 0.4) - 0.4,
          0.35 - a * 0.95,
          0.6 * Math.sin(a * Math.PI * 2.2 + 0.4)
        )
      );
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  const coronaryRight = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 30; i++) {
      const a = i / 29;
      pts.push(
        new THREE.Vector3(
          0.45 + 0.35 * Math.cos(-a * Math.PI * 2 + 1.0) * (1 - a * 0.3),
          0.3 - a * 0.85,
          0.45 * Math.sin(-a * Math.PI * 2 + 1.0)
        )
      );
    }
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  return (
    <group ref={group} position={[0, -0.2, 0]}>
      {/* Pericardium / outer subtle glow shell */}
      <mesh scale={[1.05, 1.1, 1.05]}>
        <sphereGeometry args={[1.05, 48, 48]} />
        <meshBasicMaterial color="#ff3355" transparent opacity={0.04} />
      </mesh>

      {/* LEFT VENTRICLE — large posterior-left cone */}
      <mesh position={[-0.32, -0.35, 0]} rotation={[0, 0, -0.12]} material={muscleMat}>
        <sphereGeometry args={[0.7, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.95]} />
      </mesh>
      {/* Apex bulge */}
      <mesh position={[-0.18, -0.92, 0.05]} material={muscleMat}>
        <sphereGeometry args={[0.32, 48, 48]} />
      </mesh>

      {/* RIGHT VENTRICLE — anterior, slightly smaller, crescent */}
      <mesh position={[0.38, -0.28, 0.15]} rotation={[0, 0, 0.12]} material={heartMat}>
        <sphereGeometry args={[0.6, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.9]} />
      </mesh>

      {/* SEPTUM — central wall (visible from inside cut) */}
      <mesh position={[0.04, -0.3, 0]} material={muscleMat}>
        <boxGeometry args={[0.05, 0.9, 0.55]} />
      </mesh>

      {/* LEFT ATRIUM — bulge top-left */}
      <mesh position={[-0.32, 0.4, -0.05]} material={heartMat}>
        <sphereGeometry args={[0.42, 48, 48]} />
      </mesh>

      {/* RIGHT ATRIUM — bulge top-right */}
      <mesh position={[0.48, 0.42, 0.08]} material={heartMat}>
        <sphereGeometry args={[0.45, 48, 48]} />
      </mesh>

      {/* Auricle (left) — small flap */}
      <mesh position={[-0.55, 0.5, 0.18]} rotation={[0, 0.3, 0.4]} material={heartMat}>
        <sphereGeometry args={[0.18, 32, 32]} />
      </mesh>
      {/* Auricle (right) */}
      <mesh position={[0.72, 0.5, 0.2]} rotation={[0, -0.3, -0.4]} material={heartMat}>
        <sphereGeometry args={[0.18, 32, 32]} />
      </mesh>

      {/* Coronary fat — yellow tissue band */}
      <mesh position={[0.05, 0.1, 0.1]} rotation={[0, 0, 0.05]} material={fatMat}>
        <torusGeometry args={[0.75, 0.06, 16, 64]} />
      </mesh>

      {/* AORTA — arching tube */}
      <mesh>
        <tubeGeometry args={[aortaCurve, 64, 0.18, 24, false]} />
        <primitive object={aortaMat} attach="material" />
      </mesh>
      {/* Aortic branches */}
      <mesh position={[-0.6, 1.35, -0.05]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
        <primitive object={aortaMat} attach="material" />
      </mesh>
      <mesh position={[-0.45, 1.4, -0.05]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.07, 0.07, 0.35, 16]} />
        <primitive object={aortaMat} attach="material" />
      </mesh>
      <mesh position={[-0.3, 1.45, -0.05]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.07, 0.07, 0.35, 16]} />
        <primitive object={aortaMat} attach="material" />
      </mesh>

      {/* PULMONARY ARTERY */}
      <mesh>
        <tubeGeometry args={[pulmonaryCurve, 32, 0.14, 20, false]} />
        <primitive object={arteryMat} attach="material" />
      </mesh>

      {/* SUPERIOR VENA CAVA */}
      <mesh position={[0.55, 0.95, 0.1]}>
        <cylinderGeometry args={[0.16, 0.18, 0.7, 24]} />
        <primitive object={veinMat} attach="material" />
      </mesh>

      {/* INFERIOR VENA CAVA */}
      <mesh position={[0.5, -0.05, 0.15]} rotation={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.18, 0.2, 0.5, 24]} />
        <primitive object={veinMat} attach="material" />
      </mesh>

      {/* PULMONARY VEINS — small entering left atrium */}
      {[[-0.05, 0.55, -0.4], [-0.55, 0.55, -0.4], [-0.55, 0.35, -0.4], [-0.05, 0.35, -0.4]].map(
        (p, i) => (
          <mesh key={i} position={p} rotation={[Math.PI / 2.3, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.32, 12]} />
            <primitive object={veinMat} attach="material" />
          </mesh>
        )
      )}

      {/* CORONARY ARTERIES — winding on surface */}
      <mesh>
        <tubeGeometry args={[coronaryLeft, 80, 0.025, 8, false]} />
        <primitive object={arteryMat} attach="material" />
      </mesh>
      <mesh>
        <tubeGeometry args={[coronaryRight, 80, 0.025, 8, false]} />
        <primitive object={arteryMat} attach="material" />
      </mesh>
    </group>
  );
}

/* =========================================================
   ANATOMICAL BRAIN — cerebrum hemispheres + cerebellum + brainstem
   ========================================================= */

function BrainHemisphere({ side = 1, color = "#e2bdb4", emissive = "#3a1a1c" }) {
  // Create a gyri-suggestive shape by displacing an icosahedron
  const geom = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 32);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const len = v.length();
      // gyri-like noise based on spherical coordinates
      const theta = Math.atan2(v.z, v.x);
      const phi = Math.acos(v.y / len);
      const wrinkle =
        Math.sin(theta * 12) * 0.04 +
        Math.sin(phi * 14 + theta * 4) * 0.06 +
        Math.sin(theta * 22 + phi * 8) * 0.03 +
        Math.cos(phi * 9 - theta * 5) * 0.04;
      v.multiplyScalar(1 + wrinkle);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.55,
        metalness: 0.05,
        clearcoat: 0.5,
        clearcoatRoughness: 0.4,
        sheen: 0.7,
        sheenColor: new THREE.Color("#ffd0c8"),
        emissive: new THREE.Color(emissive),
        emissiveIntensity: 0.18,
        flatShading: false,
      }),
    [color, emissive]
  );

  return (
    <mesh
      geometry={geom}
      material={mat}
      position={[side * 0.78, 0.05, 0]}
      scale={[0.9, 1.0, 1.18]}
    />
  );
}

function AnatomicalBrain() {
  const group = useRef();
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.getElapsedTime() * 0.22;
  });

  const cerebellumMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#b8847a",
        roughness: 0.6,
        sheen: 0.6,
        sheenColor: new THREE.Color("#ffaa9a"),
        emissive: new THREE.Color("#2a0808"),
        emissiveIntensity: 0.18,
      }),
    []
  );
  const stemMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#d8aea4",
        roughness: 0.5,
        clearcoat: 0.4,
        emissive: new THREE.Color("#2a1010"),
        emissiveIntensity: 0.18,
      }),
    []
  );

  // Cerebellum: ridged sphere (foliated)
  const cerebellumGeom = useMemo(() => {
    const g = new THREE.SphereGeometry(0.5, 48, 48);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const len = v.length();
      const rings = Math.sin(v.y * 22) * 0.025 + Math.sin(v.x * 14) * 0.012;
      v.multiplyScalar(1 + rings);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group ref={group}>
      {/* Longitudinal fissure split: two hemispheres */}
      <BrainHemisphere side={-1} />
      <BrainHemisphere side={1} />

      {/* Longitudinal fissure (dark gap) */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.08, 1.8, 1.6]} />
        <meshBasicMaterial color="#1a0a14" />
      </mesh>

      {/* Corpus callosum hint */}
      <mesh position={[0, -0.05, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.18, 0.18, 1.2]} />
        <meshPhysicalMaterial
          color="#f0d0c8"
          roughness={0.4}
          emissive="#3a1818"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Cerebellum */}
      <mesh
        geometry={cerebellumGeom}
        material={cerebellumMat}
        position={[0, -0.45, -0.85]}
        scale={[1, 0.65, 0.9]}
      />

      {/* Brainstem */}
      <mesh material={stemMat} position={[0, -0.85, -0.5]} rotation={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.13, 0.6, 24]} />
      </mesh>
      {/* Medulla bulge */}
      <mesh material={stemMat} position={[0, -1.1, -0.42]}>
        <sphereGeometry args={[0.16, 24, 24]} />
      </mesh>
    </group>
  );
}

/* =========================================================
   POST-PROCESSING WRAPPER
   ========================================================= */

function CinematicFX({ subtle = false }) {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={subtle ? 0.45 : 0.9}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.4}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.2} darkness={0.7} />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.0008, 0.0008]}
      />
    </EffectComposer>
  );
}

/* =========================================================
   PUBLIC COMPONENTS
   ========================================================= */

// Export inline meshes so XR canvas can use them
export const AnatomicalHeartInline = AnatomicalHeart;
export const AnatomicalBrainInline = AnatomicalBrain;

export function Hero3D({ variant = "both" }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      style={{ background: "transparent" }}
      shadows
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 5, 5]} intensity={1.6} color="#FF8FA0" />
      <pointLight position={[-5, -3, 4]} intensity={1.3} color="#9D7BFF" />
      <directionalLight position={[0, 5, 5]} intensity={0.8} color="#ffffff" />
      <spotLight position={[0, 8, 0]} angle={0.5} penumbra={1} intensity={0.6} color="#ffe0d8" />

      {variant !== "brain" && (
        <Float speed={1.3} floatIntensity={1.0} rotationIntensity={0.3}>
          <group position={[variant === "both" ? -1.8 : 0, 0, 0]} scale={variant === "both" ? 1.0 : 1.4}>
            <AnatomicalHeart />
          </group>
        </Float>
      )}
      {variant !== "heart" && (
        <Float speed={0.9} floatIntensity={0.9} rotationIntensity={0.25}>
          <group position={[variant === "both" ? 1.9 : 0, 0.05, 0]} scale={variant === "both" ? 1.0 : 1.5}>
            <AnatomicalBrain />
          </group>
        </Float>
      )}

      <CinematicFX />
    </Canvas>
  );
}

export function HeartViewer({
  pulse = true,
  controls = true,
  disease = null,
  severity = 0,
  flythrough = null,   // {waypoints, stepIdx, active}
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 42 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      shadows
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={1.6} color="#FF8FA0" />
      <pointLight position={[-4, -2, 3]} intensity={1.3} color="#9D7BFF" />
      <directionalLight position={[0, 5, 5]} intensity={0.7} />
      <spotLight position={[0, 6, 2]} angle={0.4} penumbra={1} intensity={0.5} color="#fff" />
      <Float
        speed={flythrough?.active ? 0 : 1.0}
        floatIntensity={flythrough?.active ? 0 : 0.45}
        rotationIntensity={flythrough?.active ? 0 : 0.2}
      >
        <group scale={1.35}>
          <AnatomicalHeart pulse={pulse} />
          {disease && <HeartDiseaseOverlay disease={disease} severity={severity} />}
        </group>
      </Float>
      {controls && !flythrough?.active && (
        <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={0.5} />
      )}
      {flythrough?.active && flythrough.waypoints && (
        <CameraFlythrough
          waypoints={flythrough.waypoints}
          stepIdx={flythrough.stepIdx}
          active={flythrough.active}
        />
      )}
      <CinematicFX />
    </Canvas>
  );
}

export function BrainViewer({ controls = true, flythrough = null }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 42 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      shadows
    >
      <ambientLight intensity={0.45} />
      <pointLight position={[4, 4, 4]} intensity={1.5} color="#C0A6FF" />
      <pointLight position={[-4, -2, 3]} intensity={1.2} color="#ffb6a8" />
      <directionalLight position={[0, 5, 5]} intensity={0.7} />
      <Float
        speed={flythrough?.active ? 0 : 0.85}
        floatIntensity={flythrough?.active ? 0 : 0.45}
        rotationIntensity={flythrough?.active ? 0 : 0.18}
      >
        <group scale={1.35}>
          <AnatomicalBrain />
        </group>
      </Float>
      {controls && !flythrough?.active && (
        <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={0.45} />
      )}
      {flythrough?.active && flythrough.waypoints && (
        <CameraFlythrough
          waypoints={flythrough.waypoints}
          stepIdx={flythrough.stepIdx}
          active={flythrough.active}
        />
      )}
      <CinematicFX />
    </Canvas>
  );
}
