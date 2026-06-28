import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";

/**
 * Cinematic camera fly-through used during guided tours.
 * - Receives the tour's current step index + step positions.
 * - Uses GSAP to tween camera position & look-at smoothly between predefined
 *   waypoints, giving a Netflix-documentary feel.
 *
 * Usage:
 *   <Canvas>
 *     <CameraFlythrough waypoints={[...]} active={true} />
 *   </Canvas>
 *
 * waypoints: [{position: [x,y,z], lookAt: [x,y,z], duration: 2.5}, ...]
 */
export function CameraFlythrough({ waypoints = [], active = false, stepIdx = 0, onComplete }) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));
  const tweenRef = useRef(null);

  // Animate camera to the waypoint matching stepIdx whenever stepIdx or active changes
  useEffect(() => {
    if (!active || !waypoints.length) return;
    const wp = waypoints[Math.min(stepIdx, waypoints.length - 1)];
    if (!wp) return;

    if (tweenRef.current) tweenRef.current.kill();

    const camProxy = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      tx: lookTarget.current.x,
      ty: lookTarget.current.y,
      tz: lookTarget.current.z,
    };

    tweenRef.current = gsap.to(camProxy, {
      x: wp.position[0],
      y: wp.position[1],
      z: wp.position[2],
      tx: wp.lookAt[0],
      ty: wp.lookAt[1],
      tz: wp.lookAt[2],
      duration: wp.duration || 2.5,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.position.set(camProxy.x, camProxy.y, camProxy.z);
        lookTarget.current.set(camProxy.tx, camProxy.ty, camProxy.tz);
      },
      onComplete: () => {
        if (onComplete) onComplete(stepIdx);
      },
    });
    return () => tweenRef.current?.kill();
  }, [stepIdx, active, waypoints, camera, onComplete]);

  // Each frame ensure camera looks at the tween target
  useFrame(() => {
    camera.lookAt(lookTarget.current);
  });

  return null;
}

// Default fly-through paths matching tour focus structures
// (rough hand-tuned positions to feel cinematic around the heart mesh)
export const HEART_FLYTHROUGH = {
  "blood-flow": [
    { position: [3.5, 1.5, 3.5], lookAt: [0.7, 0.6, 0.2], duration: 2.5 },  // right atrium
    { position: [2.5, 0.0, 4.0], lookAt: [0.5, 0.0, 0.2], duration: 2.0 },  // tricuspid
    { position: [4.0, -1.0, 2.5], lookAt: [0.6, -0.4, 0.2], duration: 2.5 }, // right ventricle
    { position: [3.0, 1.5, 4.0], lookAt: [0.5, 0.4, 0.1], duration: 2.0 },  // pulmonary valve
    { position: [-3.5, 1.5, 3.5], lookAt: [-0.5, 0.4, -0.1], duration: 2.5 }, // left atrium
    { position: [-2.5, 0.0, 4.0], lookAt: [-0.4, 0.0, 0.0], duration: 2.0 }, // mitral
    { position: [-4.0, -0.5, 2.5], lookAt: [-0.5, -0.4, 0.0], duration: 2.5 }, // left ventricle
  ],
  "conduction": [
    { position: [3.0, 1.5, 4.0], lookAt: [0.6, 0.4, 0.1], duration: 2.5 },
    { position: [1.5, 0.0, 4.5], lookAt: [0.3, 0.0, 0.0], duration: 2.5 },
    { position: [-3.0, -0.5, 4.0], lookAt: [-0.4, -0.3, 0.0], duration: 2.5 },
  ],
  "cardiac-cycle": [
    { position: [-3.5, 1.5, 3.5], lookAt: [-0.5, 0.4, 0.0], duration: 2.5 },
    { position: [3.0, 1.5, 3.5], lookAt: [0.5, 0.4, 0.0], duration: 2.5 },
    { position: [-4.0, -0.5, 3.0], lookAt: [-0.5, -0.4, 0.0], duration: 2.5 },
    { position: [0.0, 2.5, 4.0], lookAt: [0.0, 1.0, 0.0], duration: 2.5 },
  ],
};

export const BRAIN_FLYTHROUGH = {
  "memory": [
    { position: [3.5, 0.5, 2.5], lookAt: [-0.5, 0.0, 0.0], duration: 2.5 },
    { position: [0.0, -1.0, 4.5], lookAt: [0.0, -0.3, 0.0], duration: 2.5 },
    { position: [-1.5, 1.5, 4.0], lookAt: [-0.4, 0.3, 0.0], duration: 2.5 },
    { position: [-3.5, 1.5, 2.5], lookAt: [-0.6, 0.3, 0.0], duration: 2.5 },
  ],
  "neural-signal": [
    { position: [1.5, 2.5, 3.5], lookAt: [0.1, 0.3, 0.0], duration: 2.5 },
    { position: [0.0, 0.0, 4.5], lookAt: [0.0, 0.0, 0.0], duration: 2.5 },
    { position: [-3.5, 1.5, 2.5], lookAt: [-0.5, 0.3, 0.0], duration: 2.5 },
  ],
  "motor-control": [
    { position: [-3.5, 1.5, 2.5], lookAt: [-0.5, 0.3, 0.0], duration: 2.5 },
    { position: [0.0, -2.5, 3.5], lookAt: [0.0, -0.6, -0.4], duration: 2.5 },
    { position: [2.5, -1.0, 3.5], lookAt: [0.4, -0.4, -0.5], duration: 2.5 },
  ],
  "speech": [
    { position: [3.5, 0.5, 2.5], lookAt: [-0.5, 0.0, 0.0], duration: 2.5 },
    { position: [1.5, 2.0, 3.5], lookAt: [0.1, 0.3, 0.0], duration: 2.5 },
    { position: [-3.5, 1.5, 2.5], lookAt: [-0.5, 0.3, 0.0], duration: 2.5 },
  ],
  "emotion": [
    { position: [3.5, 0.5, 2.5], lookAt: [-0.5, 0.0, 0.0], duration: 2.5 },
    { position: [0.0, 0.0, 4.0], lookAt: [-0.2, 0.0, 0.0], duration: 2.5 },
    { position: [0.0, -2.5, 3.5], lookAt: [0.0, -0.6, -0.4], duration: 2.5 },
  ],
};
