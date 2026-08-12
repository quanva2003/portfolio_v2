"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { getPointerPosition } from "@/lib/webgl/pointer";
import { particleField, pointerLerp } from "@/lib/webgl/tokens";

/*
 * Same ref-driven update pattern as DisplacementPlane (eng review Phase 4,
 * issue 7): uMouse/uVelocity/uTime are mutated inside useFrame, never via
 * React state.
 */
const ParticleMaterialImpl = shaderMaterial(
  {
    uMouse: new THREE.Vector2(0, 0),
    uVelocity: new THREE.Vector2(0, 0),
    uTime: 0,
    uSize: particleField.size,
    uColor: new THREE.Color("#9ba0a8"),
  },
  /* glsl vertex */ `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uVelocity;
    uniform float uSize;
    attribute float aSeed;

    void main() {
      // gentle ambient drift, phase-offset per particle so the field doesn't pulse in unison
      vec3 drifted = position;
      drifted.x += sin(uTime * 0.3 + aSeed * 6.2831) * 0.15;
      drifted.y += cos(uTime * 0.25 + aSeed * 6.2831) * 0.15;

      // push away from the cursor, falling off with distance, scaled by pointer velocity —
      // a fast swipe visibly scatters nearby particles, a still cursor barely moves them
      float dist = distance(drifted.xy, uMouse);
      float falloff = smoothstep(1.2, 0.0, dist);
      drifted.xy += uVelocity * falloff * 6.0;

      vec4 mvPosition = modelViewMatrix * vec4(drifted, 1.0);
      gl_PointSize = uSize * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  /* glsl fragment */ `
    uniform vec3 uColor;
    void main() {
      float dist = distance(gl_PointCoord, vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = smoothstep(0.5, 0.0, dist) * 0.6;
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
);

extend({ ParticleMaterial: ParticleMaterialImpl });

declare module "@react-three/fiber" {
  interface ThreeElements {
    particleMaterial: ThreeElements["shaderMaterial"] & {
      uMouse?: THREE.Vector2;
      uVelocity?: THREE.Vector2;
      uTime?: number;
      uSize?: number;
      uColor?: THREE.Color | string;
    };
  }
}

type ParticleMaterial = InstanceType<typeof ParticleMaterialImpl>;

export default function ParticleField() {
  const viewport = useThree((state) => state.viewport);
  const materialRef = useRef<ParticleMaterial>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(particleField.count * 3);
    const seeds = new Float32Array(particleField.count);
    for (let i = 0; i < particleField.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * viewport.width;
      positions[i * 3 + 1] = (Math.random() - 0.5) * viewport.height;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      seeds[i] = Math.random();
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return geom;
  }, [viewport.width, viewport.height]);

  const smoothed = useMemo(() => new THREE.Vector2(0, 0), []);
  const target = useMemo(() => new THREE.Vector2(0, 0), []);
  const previous = useMemo(() => new THREE.Vector2(0, 0), []);
  const velocity = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;

    const pointer = getPointerPosition();
    target.set(
      ((pointer.x / window.innerWidth) * 2 - 1) * (viewport.width / 2),
      -((pointer.y / window.innerHeight) * 2 - 1) * (viewport.height / 2),
    );
    smoothed.lerp(target, pointerLerp);

    velocity.subVectors(smoothed, previous).multiplyScalar(particleField.velocityInfluence);
    previous.copy(smoothed);

    material.uMouse = smoothed;
    material.uVelocity = velocity;
    material.uTime = state.clock.elapsedTime;
  });

  return (
    <points geometry={geometry}>
      <particleMaterial ref={materialRef} transparent depthWrite={false} />
    </points>
  );
}
