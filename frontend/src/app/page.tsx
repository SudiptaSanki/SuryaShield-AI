"use client";

import dynamic from "next/dynamic";

// Three.js components MUST be loaded client-side only — they crash during SSR
const Scene = dynamic(() => import("@/components/three/SunScene"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-solar-orange to-corona-gold animate-pulse shadow-[0_0_60px_rgba(255,107,53,0.6)]" />
    </div>
  )
});

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col lg:flex-row items-center justify-center p-8 lg:p-16 overflow-hidden">
        
        {/* Text Content */}
        <div className="z-10 flex-1 max-w-2xl mt-12 lg:mt-0 order-2 lg:order-1">
          <div className="inline-block px-4 py-1.5 rounded-full border border-plasma-blue/30 bg-plasma-blue/10 text-plasma-blue text-sm font-semibold tracking-wide mb-6">
            ADITYA-L1 MISSION DATA INTEGRATION
          </div>
          <h1 className="font-orbitron text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-solar-orange via-corona-gold to-plasma-blue mb-6">
            Predicting the Sun&apos;s storms before they strike.
          </h1>
          <p className="text-lg md:text-xl text-star-white/70 mb-10 leading-relaxed max-w-xl">
            SuryaShield AI converts raw X-ray observations into intelligent, real-time early warnings for solar flares. Protecting critical infrastructure on Earth and in space.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/dashboard" className="px-8 py-4 bg-plasma-blue hover:bg-plasma-blue/80 text-space-dark font-bold rounded-lg text-center transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)]">
              Enter Live Dashboard
            </a>
            <a href="/forecast" className="px-8 py-4 bg-transparent border border-star-white/20 hover:border-solar-orange hover:text-solar-orange rounded-lg text-center font-medium transition-all">
              View AI Forecast
            </a>
          </div>
        </div>

        {/* 3D Sun Canvas */}
        <div className="w-full h-[400px] lg:h-[600px] flex-1 order-1 lg:order-2 relative z-0">
          <Scene />
          
          {/* Decorative orbit rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] border border-white/5 rounded-full -z-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] lg:w-[700px] lg:h-[700px] border border-white/5 rounded-full -z-10 border-dashed"></div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-8 bg-black/50 border-t border-white/10 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-orbitron text-3xl font-bold text-plasma-blue mb-6">About SuryaShield AI</h2>
          <div className="text-star-white/80 text-lg leading-relaxed space-y-4">
            <p>
              Solar flares are sudden bursts of energy released from the Sun that can disrupt satellites, GPS, radio communication, power grids, and space missions. Existing monitoring systems often require experts to interpret large volumes of solar X-ray data, and timely forecasting remains challenging.
            </p>
            <p>
              SURYASHIELD AI solves this problem by combining Soft X-ray (SoLEXS) and Hard X-ray (HEL1OS) observations from Aditya-L1 to provide AI-powered real-time nowcasting and short-term forecasting of solar flares. The platform transforms complex scientific data into clear, actionable insights for researchers, students, and space-weather analysts.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 px-8 bg-space-deep/80 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Multi-Modal Fusion" 
              desc="Combines SoLEXS (Soft X-ray) and HEL1OS (Hard X-ray) data for unparalleled precursor detection."
            />
            <FeatureCard 
              title="CNN-LSTM Engine" 
              desc="Deep learning architecture extracts temporal features and long-range dependencies from flux curves."
            />
            <FeatureCard 
              title="Actionable Alerts" 
              desc="Provides 5 to 30-minute lead times with confidence scores and impact assessment for critical tech."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="glass-panel p-8 rounded-2xl hover:border-plasma-blue/50 transition-colors group">
      <h3 className="font-orbitron text-xl font-bold text-corona-gold mb-3 group-hover:text-solar-orange transition-colors">{title}</h3>
      <p className="text-star-white/60 leading-relaxed">{desc}</p>
    </div>
  );
}
