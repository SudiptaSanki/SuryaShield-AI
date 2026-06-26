"use client";

import dynamic from "next/dynamic";
import { Orbit } from "lucide-react";

const Scene = dynamic(() => import("@/components/three/SunScene"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-solar-orange to-corona-gold animate-pulse shadow-[0_0_60px_rgba(255,107,53,0.6)]" />
    </div>
  )
});

export default function SunPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div className="mb-6">
        <h1 className="font-orbitron text-3xl font-bold text-star-white flex items-center gap-3">
          <Orbit className="text-corona-gold" /> Interactive 3D Sun Model
        </h1>
        <p className="text-star-white/60 mt-1">
          Shader-powered visualization built with Three.js &amp; React Three Fiber
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-solar-orange via-corona-gold to-flare-red"></div>
        
        {/* 3D Sun Canvas */}
        <div className="w-full h-[60vh] sm:h-[70vh] lg:h-[75vh] relative">
          <Scene />
          
          {/* Decorative orbit rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] lg:w-[500px] lg:h-[500px] border border-white/5 rounded-full -z-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] sm:w-[500px] sm:h-[500px] lg:w-[700px] lg:h-[700px] border border-white/5 rounded-full -z-10 border-dashed"></div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="font-orbitron text-sm font-bold text-corona-gold mb-2">Corona Shader</h3>
          <p className="text-star-white/60 text-sm">Custom GLSL vertex + fragment shaders simulate the Sun&apos;s outer atmosphere with animated noise displacement.</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="font-orbitron text-sm font-bold text-solar-orange mb-2">Real-time Animation</h3>
          <p className="text-star-white/60 text-sm">The surface undulates in real-time using Perlin noise, simulating convective plasma motion on the photosphere.</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="font-orbitron text-sm font-bold text-plasma-blue mb-2">Interactive Controls</h3>
          <p className="text-star-white/60 text-sm">Click and drag to rotate. Scroll to zoom in and out. The model responds to your mouse movement for exploration.</p>
        </div>
      </div>
    </div>
  );
}
