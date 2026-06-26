"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, BrainCircuit, BarChart2, ShieldCheck, Bell, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-6">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/landing_bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Floating L1 Text (Right) — desktop only */}
      <div className="hidden lg:block absolute right-24 top-1/3 text-right">
        <h3 className="text-4xl font-light text-white tracking-widest font-orbitron">L1</h3>
        <p className="text-[10px] text-slate-400 tracking-[0.2em] uppercase mt-1">Lagrange Point 1</p>
      </div>

      {/* Floating Solar Activity Card (Left) — desktop only */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="hidden lg:flex absolute left-16 bottom-48 glass-panel p-5 rounded-[24px] flex-col gap-2 w-64"
      >
        <h4 className="text-sm font-medium text-slate-300">Solar Activity</h4>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-bold text-white tracking-tight font-mono">LIVE</div>
            <div className="text-[10px] text-slate-400 mt-1">NOAA GOES-18 Feed</div>
          </div>
          {/* Mini sparkline SVG */}
          <div className="w-24 h-12 flex items-end overflow-hidden">
            <svg viewBox="0 0 100 50" className="w-full h-full stroke-solar-orange fill-solar-orange/20 drop-shadow-[0_0_8px_rgba(255,107,53,0.6)]">
              <path d="M0,40 Q10,35 20,40 T40,30 T60,20 T70,35 T80,10 T100,25 L100,50 L0,50 Z" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Main Center Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 text-center max-w-3xl flex flex-col items-center mt-10"
      >
        {/* Badge */}
        <div className="inline-block px-4 py-1.5 rounded-full border border-plasma-blue/30 bg-plasma-blue/10 text-plasma-blue text-sm font-semibold tracking-wide mb-6">
          POWERED BY NOAA GOES-18 SATELLITE DATA
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-[5.5rem] font-bold mb-6 tracking-tight text-white drop-shadow-2xl font-orbitron">
          Surya<span className="text-solar-orange drop-shadow-[0_0_20px_rgba(255,107,53,0.5)]">Shield</span> <span className="text-plasma-blue">AI</span>
        </h1>
        
        {/* Subtitles */}
        <p className="text-xl md:text-2xl text-slate-200 mb-6 font-medium tracking-wide">
          Solar Flare Forecasting using <br className="hidden md:block"/>Aditya-L1 Soft &amp; Hard X-ray Data
        </p>
        
        <div className="text-sm md:text-base text-slate-400 mb-12 font-light leading-relaxed max-w-lg">
          <p className="text-white mb-2 font-medium tracking-wide text-lg">Predict. Protect. Prepare.</p>
          <p>Advanced nowcasting and forecasting of solar flares using combined Soft X-ray and Hard X-ray intelligence from real-time satellite observations.</p>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-16 sm:mb-20">
          <Link href="/dashboard" className="flex items-center gap-2 bg-gradient-to-r from-solar-orange to-corona-gold hover:from-corona-gold hover:to-solar-orange text-space-dark shadow-[0_0_20px_rgba(255,107,53,0.4)] text-base font-bold px-8 py-4 rounded-[30px] transition-all duration-300 transform hover:scale-105">
            <Activity className="w-5 h-5" /> Start Nowcasting
          </Link>
          <Link href="/forecast" className="flex items-center gap-2 text-base font-bold px-8 py-4 rounded-[30px] glass-panel hover:bg-white/10 text-white transition-all duration-300">
            Explore Forecast <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </motion.div>
      
      {/* Bottom Feature Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-auto w-full max-w-6xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 px-2 sm:px-4 z-10"
      >
        <FeatureCard 
          icon={<Activity className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />}
          title="Real-time Monitoring"
          desc="NOAA GOES-18 live X-ray data analysis"
        />
        <FeatureCard 
          icon={<BrainCircuit className="text-plasma-blue w-5 h-5 sm:w-6 sm:h-6" />}
          title="AI Nowcasting"
          desc="Detect solar flares before they peak"
        />
        <FeatureCard 
          icon={<BarChart2 className="text-aurora-green w-5 h-5 sm:w-6 sm:h-6" />}
          title="Smart Forecasting"
          desc="5 to 30-minute flare probability"
        />
        <FeatureCard 
          icon={<ShieldCheck className="text-corona-gold w-5 h-5 sm:w-6 sm:h-6" />}
          title="Space Weather Impact"
          desc="Stay ahead. Protect what matters"
        />
        <FeatureCard 
          icon={<Bell className="text-flare-red w-5 h-5 sm:w-6 sm:h-6" />}
          title="Intelligent Alerts"
          desc="Real NOAA SWPC warnings you can trust"
        />
      </motion.div>

      {/* About Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="mt-16 w-full max-w-4xl z-10 glass-panel rounded-2xl p-8 sm:p-12"
      >
        <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-plasma-blue mb-6 text-center">About SuryaShield AI</h2>
        <div className="text-star-white/80 text-base sm:text-lg leading-relaxed space-y-4 text-center">
          <p>
            Solar flares are sudden bursts of energy released from the Sun that can disrupt satellites, GPS, radio communication, power grids, and space missions. Existing monitoring systems often require experts to interpret large volumes of solar X-ray data, and timely forecasting remains challenging.
          </p>
          <p>
            SURYASHIELD AI solves this problem by combining Soft X-ray (SoLEXS) and Hard X-ray (HEL1OS) observations from Aditya-L1 to provide AI-powered real-time nowcasting and short-term forecasting of solar flares. The platform transforms complex scientific data into clear, actionable insights for researchers, students, and space-weather analysts.
          </p>
        </div>
        <div className="flex justify-center gap-4 mt-8 text-xs text-star-white/40">
          <a href="https://www.swpc.noaa.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-plasma-blue transition-colors underline">NOAA SWPC ↗</a>
          <a href="https://www.isro.gov.in/Aditya_L1.html" target="_blank" rel="noopener noreferrer" className="hover:text-plasma-blue transition-colors underline">ISRO Aditya-L1 ↗</a>
          <a href="https://www.swpc.noaa.gov/products/goes-x-ray-flux" target="_blank" rel="noopener noreferrer" className="hover:text-plasma-blue transition-colors underline">GOES X-ray Flux ↗</a>
        </div>
      </motion.section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl flex items-start gap-3 sm:gap-4 hover:bg-white/10 transition-colors cursor-default">
      <div className="mt-1 drop-shadow-md shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-[12px] sm:text-[13px] font-bold text-slate-200 mb-1 leading-tight">{title}</h4>
        <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug">{desc}</p>
      </div>
    </div>
  );
}
