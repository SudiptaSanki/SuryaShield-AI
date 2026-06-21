"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Vertex shader for the sun's surface
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader for glowing fiery surface
const fragmentShader = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  // Simple noise function
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = i.x + i.y * 157.0 + 113.0 * i.z;
    return mix(
      mix(mix(fract(sin(n + 0.0) * 43758.5453123), fract(sin(n + 1.0) * 43758.5453123), f.x),
          mix(fract(sin(n + 157.0) * 43758.5453123), fract(sin(n + 158.0) * 43758.5453123), f.x), f.y),
      mix(mix(fract(sin(n + 113.0) * 43758.5453123), fract(sin(n + 114.0) * 43758.5453123), f.x),
          mix(fract(sin(n + 270.0) * 43758.5453123), fract(sin(n + 271.0) * 43758.5453123), f.x), f.y), f.z);
  }

  // Fractional Brownian Motion
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 5; ++i) {
      v += a * noise(p);
      p = p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 pos = vPosition * 2.0;
    // Animate the noise
    pos.x += time * 0.1;
    pos.y += time * 0.15;
    
    // Generate fire-like texture using fbm
    float n = fbm(pos);
    
    // Color mapping (Yellow to Deep Orange/Red)
    vec3 color1 = vec3(1.0, 0.9, 0.1); // Bright yellow
    vec3 color2 = vec3(1.0, 0.4, 0.0); // Orange
    vec3 color3 = vec3(0.6, 0.1, 0.0); // Dark red/orange
    
    vec3 finalColor = mix(color3, color2, smoothstep(0.1, 0.6, n));
    finalColor = mix(finalColor, color1, smoothstep(0.5, 0.9, n));

    // Edge glow (Fresnel effect)
    float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
    finalColor += vec3(1.0, 0.6, 0.1) * intensity * 1.5;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function SunModel({ scale = 1, flareIntensity = 0 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      uniforms.time.value = state.clock.getElapsedTime();
    }
    if (coronaRef.current) {
      // Pulse corona based on flare intensity
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05 * flareIntensity;
      coronaRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group scale={scale}>
      {/* The Sun Surface */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
      
      {/* Inner Glow (Corona) */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.3 + (flareIntensity * 0.2)}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Outer Glow */}
      <mesh>
        <sphereGeometry args={[2.6, 32, 32]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.15 + (flareIntensity * 0.1)}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Light Source */}
      <pointLight color="#ffccaa" intensity={2 + flareIntensity * 2} distance={50} />
    </group>
  );
}
