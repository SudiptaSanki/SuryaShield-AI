"use client";

import { Shield, Plane, Satellite, Radio, Zap, Globe } from "lucide-react";

export default function ImpactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div className="mb-8">
        <h1 className="font-orbitron text-3xl font-bold text-star-white flex items-center gap-3">
          <Shield className="text-plasma-blue" /> Impact Assessment Center
        </h1>
        <p className="text-star-white/60 mt-1">Understanding the effects of solar flares on modern infrastructure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ImpactCard 
          icon={<Satellite size={32} />}
          title="Satellites & Spacecraft"
          desc="High-energy particles can damage solar panels, fry electronics, and cause orbital decay due to atmospheric expansion."
          risk="High Risk at X-Class"
          color="text-plasma-blue"
        />
        <ImpactCard 
          icon={<Plane size={32} />}
          title="Aviation"
          desc="Radiation exposure risk for high-altitude, polar-route flights. Loss of HF radio communications with air traffic control."
          risk="Moderate Risk at M-Class"
          color="text-yellow-400"
        />
        <ImpactCard 
          icon={<Zap size={32} />}
          title="Power Grids"
          desc="Geomagnetically induced currents (GICs) can overload transformers, potentially causing widespread blackouts."
          risk="Extreme Risk at X-Class"
          color="text-flare-red"
        />
        <ImpactCard 
          icon={<Radio size={32} />}
          title="HF Radio Comms"
          desc="X-ray ionization of the D-layer absorbs high-frequency radio waves, causing total radio blackouts on the sunlit side of Earth."
          risk="High Risk at M/X-Class"
          color="text-solar-orange"
        />
        <ImpactCard 
          icon={<Globe size={32} />}
          title="GPS & Navigation"
          desc="Ionospheric disturbances cause signal scintillation, leading to positioning errors in GPS and GNSS systems."
          risk="Moderate Risk at M-Class"
          color="text-corona-gold"
        />
      </div>

      <div className="mt-12 glass-panel p-8 rounded-2xl">
        <h2 className="font-orbitron text-xl font-bold text-star-white mb-6">Severity Matrix</h2>
        <div className="grid grid-cols-5 gap-2 text-center text-sm font-medium">
          <div className="bg-black/40 p-3 rounded text-star-white/50 border border-white/5">A-Class<br/><span className="text-xs font-normal">Background</span></div>
          <div className="bg-black/40 p-3 rounded text-star-white/50 border border-white/5">B-Class<br/><span className="text-xs font-normal">Minor</span></div>
          <div className="bg-orange-900/20 p-3 rounded text-orange-200 border border-orange-500/20">C-Class<br/><span className="text-xs font-normal">Noticeable</span></div>
          <div className="bg-red-900/30 p-3 rounded text-red-200 border border-red-500/30">M-Class<br/><span className="text-xs font-normal">Moderate/High</span></div>
          <div className="bg-red-600/30 p-3 rounded text-red-100 border border-red-500/50">X-Class<br/><span className="text-xs font-normal">Extreme</span></div>
        </div>
      </div>
    </div>
  );
}

function ImpactCard({ icon, title, desc, risk, color }: { icon: React.ReactNode, title: string, desc: string, risk: string, color: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors group">
      <div className={`mb-4 ${color} transform group-hover:scale-110 transition-transform origin-left`}>{icon}</div>
      <h3 className="font-orbitron text-lg font-bold text-star-white mb-2">{title}</h3>
      <p className="text-star-white/70 text-sm leading-relaxed mb-4">{desc}</p>
      <div className="inline-block px-3 py-1 bg-black/40 border border-white/10 rounded text-xs font-medium text-star-white/80">
        {risk}
      </div>
    </div>
  );
}
