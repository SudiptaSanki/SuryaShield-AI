"use client";

import { useEffect, useRef, useState } from "react";
import { Plane, Satellite, Radio, Zap, Globe, Users, ExternalLink } from "lucide-react";

import EarthScene from "@/components/three/EarthScene";
/* ─────────────────────────────── Types & Data ────────────────────────────── */
interface Card {
  icon: React.ReactNode;
  title: string;
  risk: "Low Impact" | "Moderate Impact" | "High Impact";
  color: string;
  glowColor: string;
  /* anchor on the card that faces the earth center – as fraction of card size */
  anchor: "right" | "left";
}

const CARDS: Card[] = [
  { icon: <Radio size={22} />, title: "Communication", risk: "Moderate Impact", color: "text-solar-orange", glowColor: "#FF6B35", anchor: "right" },
  { icon: <Zap size={22} />, title: "Power Grid", risk: "High Impact", color: "text-flare-red", glowColor: "#FF2D55", anchor: "right" },
  { icon: <Plane size={22} />, title: "Aviation", risk: "Low Impact", color: "text-aurora-green", glowColor: "#39FF14", anchor: "right" },
  { icon: <Globe size={22} />, title: "GPS Signals", risk: "Low Impact", color: "text-plasma-blue", glowColor: "#00D4FF", anchor: "left" },
  { icon: <Satellite size={22} />, title: "Satellites", risk: "Moderate Impact", color: "text-solar-orange", glowColor: "#FF6B35", anchor: "left" },
  { icon: <Users size={22} />, title: "Astronauts", risk: "Low Impact", color: "text-aurora-green", glowColor: "#39FF14", anchor: "left" },
];

const RISK_STYLES: Record<string, string> = {
  "Low Impact": "text-aurora-green",
  "Moderate Impact": "text-solar-orange",
  "High Impact": "text-flare-red",
};

/* ─────────────────────────────── ImpactCard ─────────────────────────────── */
function ImpactCard({ card, id }: { card: Card; id: string }) {
  return (
    <div
      id={id}
      className="glass-panel p-3 rounded-xl flex items-center gap-3 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300 group w-52 md:w-56 cursor-default"
    >
      <div
        className={`p-2.5 rounded-lg bg-black/50 border border-white/5 ${card.color} flex-shrink-0 group-hover:scale-110 transition-transform`}
        style={{ boxShadow: `0 0 12px ${card.glowColor}33` }}
      >
        {card.icon}
      </div>
      <div>
        <h3 className="font-semibold text-star-white text-sm leading-tight">{card.title}</h3>
        <p className={`text-xs mt-0.5 font-medium ${RISK_STYLES[card.risk]}`}>{card.risk}</p>
      </div>
    </div>
  );
}

/* ─────────────── Glowing SVG Connector Lines ────────────────────────────── */
function ConnectorLines() {
  /* Hard-coded anchor points relative to the 900×520 SVG viewBox
     (left column cards connect right→center, right column left→center).
     Earth centre is at 450, 260. Card centres are approximate. */
  const earth = { x: 450, y: 260 };

  const leftCards = [
    { x: 215, y: 100, color: "#FF6B35" }, // Communication
    { x: 215, y: 260, color: "#FF2D55" }, // Power Grid
    { x: 215, y: 420, color: "#39FF14" }, // Aviation
  ];
  const rightCards = [
    { x: 685, y: 100, color: "#00D4FF" }, // GPS Signals
    { x: 685, y: 260, color: "#FF6B35" }, // Satellites
    { x: 685, y: 420, color: "#39FF14" }, // Astronauts
  ];

  const all = [...leftCards, ...rightCards];

  return (
    <svg
      viewBox="0 0 900 520"
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {all.map((p, i) => (
          <linearGradient key={i} id={`lg${i}`} x1={p.x < earth.x ? "0%" : "100%"} y1="50%" x2={p.x < earth.x ? "100%" : "0%"} y2="50%">
            <stop offset="0%" stopColor={p.color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={p.color} stopOpacity="0.05" />
          </linearGradient>
        ))}
      </defs>

      {all.map((p, i) => {
        /* Midpoint bezier control */
        const midX = (p.x + earth.x) / 2;
        const midY = p.y < earth.y ? p.y - 20 : p.y > earth.y ? p.y + 20 : p.y;
        const d = `M ${p.x} ${p.y} Q ${midX} ${midY} ${earth.x} ${earth.y}`;
        return (
          <g key={i}>
            {/* Glow line (blurred) */}
            <path d={d} fill="none" stroke={p.color} strokeWidth="4" opacity="0.12" />
            {/* Sharp line */}
            <path d={d} fill="none" stroke={`url(#lg${i})`} strokeWidth="1.5" opacity="0.9" />
            {/* Dot at card end */}
            <circle cx={p.x} cy={p.y} r="4" fill={p.color} opacity="0.9"
              style={{ filter: `drop-shadow(0 0 6px ${p.color})` }} />
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────── Main Page ──────────────────────────────── */
export default function ImpactPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 min-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-orbitron text-4xl font-bold text-star-white">Earth Impact</h1>
        <p className="text-star-white/60 mt-2">How solar activity affects our planet</p>
      </div>

      {/* ── Desktop: radial layout with SVG connectors ── */}
      <div className="hidden lg:block relative flex-1" style={{ minHeight: 520 }}>
        {/* SVG connector lines behind everything */}
        <ConnectorLines />

        {/* Left column cards */}
        <div className="absolute left-0 top-0 flex flex-col justify-around h-full py-4 gap-4 z-10">
          {CARDS.slice(0, 3).map((c, i) => (
            <ImpactCard key={c.title} card={c} id={`card-l${i}`} />
          ))}
        </div>

        {/* Center Earth */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-[480px] h-[480px]">
            <EarthScene />
          </div>
        </div>

        {/* Right column cards */}
        <div className="absolute right-0 top-0 flex flex-col justify-around h-full py-4 gap-4 z-10">
          {CARDS.slice(3).map((c, i) => (
            <ImpactCard key={c.title} card={c} id={`card-r${i}`} />
          ))}
        </div>
      </div>

      {/* ── Mobile layout: Earth on top, cards grid below ── */}
      <div className="lg:hidden flex flex-col items-center gap-6">
        <div className="w-[340px] h-[340px]">
          <EarthScene />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          {CARDS.map((c) => (
            <ImpactCard key={c.title} card={c} id={`card-m-${c.title}`} />
          ))}
        </div>
      </div>

      {/* ── Impact Summary ── */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl glow-panel border-t border-t-white/10 relative overflow-hidden mt-8 max-w-4xl mx-auto w-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-plasma-blue/50 to-transparent" />
        <h2 className="font-orbitron text-xl font-bold text-star-white mb-3">Current Impact Summary</h2>
        <p className="text-star-white/70 leading-relaxed text-sm">
          Solar activity is currently causing minor disturbances in high-latitude regions. Power grids may
          experience geomagnetically induced currents and communication systems could face intermittent HF
          radio disruptions. GPS positioning errors of 1–5 m possible in polar regions.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-plasma-blue/10 border border-plasma-blue/40 rounded-lg text-sm text-plasma-blue hover:bg-plasma-blue/20 hover:border-plasma-blue/70 transition-all"
          >
            <ExternalLink size={14} /> View Detailed Analysis
          </button>
          <a
            href="https://www.swpc.noaa.gov/impacts"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-black/30 border border-white/15 rounded-lg text-sm text-star-white/70 hover:text-white hover:border-white/30 transition-all"
          >
            NOAA SWPC ↗
          </a>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="glass-panel glow-panel rounded-2xl p-8 max-w-2xl w-full relative border border-plasma-blue/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-plasma-blue/60 to-transparent rounded-t-2xl" />
            <h2 className="font-orbitron text-2xl font-bold text-star-white mb-6">Detailed Impact Analysis</h2>
            <div className="space-y-4">
              {CARDS.map((c) => (
                <div key={c.title} className="flex items-start gap-4 p-3 rounded-xl bg-black/30 border border-white/5">
                  <div className={`p-2 rounded-lg bg-black/50 ${c.color} flex-shrink-0`}>{c.icon}</div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-star-white">{c.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-black/40 border border-white/10 ${RISK_STYLES[c.risk]}`}>{c.risk}</span>
                    </div>
                    <p className="text-xs text-star-white/50 mt-1">
                      {c.title === "Communication" && "High-frequency radio blackout possible on daylit side. Satellite uplinks may be affected."}
                      {c.title === "Power Grid" && "Geomagnetically induced currents (GICs) can saturate transformers. High-latitude grids most vulnerable."}
                      {c.title === "Aviation" && "HF comms may fail on polar routes. Radiation dose elevated for crews above 30,000 ft."}
                      {c.title === "GPS Signals" && "Ionospheric scintillation causes 1–5 m positioning errors, especially near the poles."}
                      {c.title === "Satellites" && "Increased drag due to atmospheric expansion; enhanced charging risk for GEO satellites."}
                      {c.title === "Astronauts" && "Crews on ISS may need to shelter from elevated proton flux during X-class events."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 px-6 py-2 bg-black/40 border border-white/20 rounded-lg text-sm text-star-white/70 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
