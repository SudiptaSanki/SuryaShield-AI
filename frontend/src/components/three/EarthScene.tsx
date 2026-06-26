"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import EarthModel from "@/components/three/EarthModel";

function FallbackGlobe() {
  return (
    <mesh>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial color="#1a6dff" />
    </mesh>
  );
}

export default function EarthScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 7.5], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Low ambient so the shader controls lighting */}
      <ambientLight intensity={0.05} />

      {/* Subtle fill light from the other side so night side has a faint glow */}
      <directionalLight position={[-8, 2, -4]} intensity={0.08} color="#3a6fff" />

      {/* Star field */}
      <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={0.5} />

      {/* 3D Earth with proper NASA texture + custom shader */}
      <Suspense fallback={<FallbackGlobe />}>
        <EarthModel scale={1.1} />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
