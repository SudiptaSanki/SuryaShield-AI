"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const earthVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthFragmentShader = `
  uniform sampler2D dayTexture;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec4 dayColor = texture2D(dayTexture, vUv);
    
    // Soft day/night blend – minimum 0.25 ambient so night side stays visible
    float intensity = dot(vNormal, sunDirection);
    float light = clamp(intensity, 0.25, 1.0);
    
    // Slight blue atmospheric tint on terminator
    float terminator = 1.0 - abs(intensity);
    vec3 atmosphere = vec3(0.2, 0.5, 1.0) * pow(terminator, 3.0) * 0.4;

    vec3 color = dayColor.rgb * light + atmosphere;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0) * intensity * 1.5;
  }
`;

export default function EarthModel({ scale = 1 }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Use NASA's Blue Marble texture via Three.js CDN
  const dayTexture = useTexture(
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
  );

  const earthUniforms = useMemo(
    () => ({
      dayTexture: { value: dayTexture },
      sunDirection: { value: new THREE.Vector3(1.5, 0.3, 1.0).normalize() },
    }),
    [dayTexture]
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group scale={scale}>
      {/* Earth sphere with custom day/night shader */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <shaderMaterial
          vertexShader={earthVertexShader}
          fragmentShader={earthFragmentShader}
          uniforms={earthUniforms}
        />
      </mesh>

      {/* Atmosphere glow (rendered on BackSide so it surrounds the globe) */}
      <mesh>
        <sphereGeometry args={[2.15, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
