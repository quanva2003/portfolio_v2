"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { getPointerPosition } from "@/lib/webgl/pointer";
import { pointerLerp } from "@/lib/webgl/tokens";

/*
 * uMouse/uTime are mutated via refs inside useFrame (which fires on every
 * gsap.ticker-driven advance() tick, per the single-RAF contract) — never via
 * React state. A useState-driven uniform would re-render this whole subtree
 * 60+ times/sec, the standard R3F performance footgun (eng review Phase 4,
 * issue 7).
 */
const DisplacementMaterialImpl = shaderMaterial(
  {
    uMouse: new THREE.Vector2(0, 0),
    uTime: 0,
    uColor: new THREE.Color("#101114"),
  },
  /* glsl vertex */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl fragment */ `
    uniform vec2 uMouse;
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      // vUv*2-1 centers the plane's own uv space so it lines up with uMouse,
      // which arrives in the same centered NDC-ish space (see useFrame below).
      vec2 centered = vUv * 2.0 - 1.0;
      float dist = distance(centered, uMouse);
      float glow = smoothstep(0.4, 0.0, dist) * 0.15;
      gl_FragColor = vec4(uColor + glow, 1.0);
    }
  `,
);

extend({ DisplacementMaterial: DisplacementMaterialImpl });

declare module "@react-three/fiber" {
  interface ThreeElements {
    displacementMaterial: ThreeElements["shaderMaterial"] & {
      uMouse?: THREE.Vector2;
      uTime?: number;
      uColor?: THREE.Color | string;
    };
  }
}

type DisplacementMaterial = InstanceType<typeof DisplacementMaterialImpl>;

export default function DisplacementPlane() {
  const viewport = useThree((state) => state.viewport);
  const materialRef = useRef<DisplacementMaterial>(null);
  const smoothed = useMemo(() => new THREE.Vector2(0, 0), []);
  const target = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;

    const pointer = getPointerPosition();
    target.set(
      (pointer.x / window.innerWidth) * 2 - 1,
      -((pointer.y / window.innerHeight) * 2 - 1),
    );
    smoothed.lerp(target, pointerLerp);

    material.uMouse = smoothed;
    material.uTime = state.clock.elapsedTime;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <displacementMaterial ref={materialRef} />
    </mesh>
  );
}
