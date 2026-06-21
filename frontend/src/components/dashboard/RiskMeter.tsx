"use client";

import { motion } from "framer-motion";

export default function RiskMeter({ score, level }: { score: number, level: string }) {
  // Map level to color
  let colorClass = "from-aurora-green to-green-500";
  let textColorClass = "text-aurora-green";
  
  if (level === "MODERATE") {
    colorClass = "from-yellow-400 to-yellow-600";
    textColorClass = "text-yellow-400";
  } else if (level === "HIGH") {
    colorClass = "from-solar-orange to-orange-600";
    textColorClass = "text-solar-orange";
  } else if (level === "EXTREME") {
    colorClass = "from-flare-red to-red-700";
    textColorClass = "text-flare-red";
  }

  // Calculate arc dash offset based on score (0-100)
  // SVG circle length for r=40 is ~251
  const circumference = 251.2;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Background track */}
        <svg className="w-full h-full transform -rotate-90 absolute">
          <circle 
            cx="96" cy="96" r="40" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="8" 
            fill="none" 
          />
        </svg>
        
        {/* Animated value arc */}
        <svg className="w-full h-full transform -rotate-90 absolute z-10">
          <motion.circle 
            cx="96" cy="96" r="40" 
            stroke="currentColor" 
            strokeWidth="8" 
            fill="none" 
            className={textColorClass}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text */}
        <div className="text-center z-20 flex flex-col items-center mt-2">
          <span className="text-4xl font-mono font-bold text-star-white">{Math.round(score)}</span>
        </div>
      </div>
      
      <div className={`mt-2 font-orbitron font-bold tracking-wider text-xl ${textColorClass}`}>
        {level}
      </div>
    </div>
  );
}
