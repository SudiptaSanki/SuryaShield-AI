"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import SunModel from "@/components/three/SunModel";
import AdityaL1 from "@/components/three/AdityaL1";

export default function SunScene() {
  return (
    <Canvas 
      camera={{ position: [0, 2, 8], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
      
      {/* Space Background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* 3D Sun Model */}
      <SunModel scale={1.2} />
      
      {/* Aditya-L1 Satellite Model */}
      <AdityaL1 />
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        maxDistance={15}
        minDistance={3}
      />
    </Canvas>
  );
}
