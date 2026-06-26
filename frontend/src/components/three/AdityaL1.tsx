"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function AdityaL1({ position = [2, 0, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Orbit around the sun slowly
      const time = state.clock.getElapsedTime();
      const radius = 3.5;
      const speed = 0.2;
      groupRef.current.position.x = Math.cos(time * speed) * radius;
      groupRef.current.position.z = Math.sin(time * speed) * radius;
      // Look at the sun (0,0,0)
      groupRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={0.15}>
      {/* Main Body */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#b8b8b8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Gold Foil Layer */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[1.05, 1.05, 1.05]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.4} wireframe />
      </mesh>

      {/* Solar Panel Left */}
      <mesh position={[-1.5, 0, 0]}>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color="#1a2b4c" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Solar Panel Right */}
      <mesh position={[1.5, 0, 0]}>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color="#1a2b4c" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Instruments (pointing to the sun) */}
      <mesh position={[0, 0, 0.6]}>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}
