"use client";

import { useWebSocket } from "@/hooks/useWebSocket";
import { BrainCircuit, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function ForecastPage() {
  const { latestData } = useWebSocket();

  const mockHeatmap = Array.from({ length: 12 }, () => Math.random());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div className="mb-8">
        <h1 className="font-orbitron text-3xl font-bold text-star-white flex items-center gap-3">
          <BrainCircuit className="text-plasma-blue" /> AI Forecast Center
        </h1>
        <p className="text-star-white/60 mt-1">Deep Learning Predictions from CNN-LSTM Engine</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <PredictionCard 
          time="5 Minutes" 
          prob={latestData?.forecast.probabilities["5_min"] || 0} 
          delay={0}
        />
        <PredictionCard 
          time="15 Minutes" 
          prob={latestData?.forecast.probabilities["15_min"] || 0} 
          delay={0.1}
        />
        <PredictionCard 
          time="30 Minutes" 
          prob={latestData?.forecast.probabilities["30_min"] || 0} 
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="font-orbitron text-lg font-semibold text-star-white mb-4 flex items-center gap-2">
            <Zap className="text-corona-gold" size={20} /> Precursor Signal Analysis
          </h2>
          <div className="space-y-4">
            <InsightRow label="Rise Rate Anomaly" value="Detected" active={true} />
            <InsightRow label="Spectral Hardening" value="Normal" active={false} />
            <InsightRow label="X-Ray Burstiness" value="High" active={true} />
            <InsightRow label="Baseline Flux Trend" value="Stable" active={false} />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="font-orbitron text-lg font-semibold text-star-white mb-4">Model Attention Heatmap</h2>
          <p className="text-sm text-star-white/60 mb-4">Indicates which temporal segments the AI is focusing on for its prediction.</p>
          <div className="flex gap-1 h-32 items-end border-b border-l border-white/10 pb-1 pl-1">
            {mockHeatmap.map((val, i) => (
              <motion.div 
                key={i}
                className="flex-1 bg-plasma-blue rounded-t-sm"
                initial={{ height: 0 }}
                animate={{ height: `${val * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                style={{ opacity: 0.3 + val * 0.7 }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-star-white/40 mt-2">
            <span>T-60 min</span>
            <span>Current</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PredictionCard({ time, prob, delay }: { time: string, prob: number, delay: number }) {
  const percent = Math.round(prob * 100);
  let color = "text-aurora-green";
  let bgColor = "bg-aurora-green";
  
  if (percent >= 75) {
    color = "text-flare-red";
    bgColor = "bg-flare-red";
  } else if (percent >= 40) {
    color = "text-solar-orange";
    bgColor = "bg-solar-orange";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="glass-panel p-6 rounded-2xl border-t border-t-white/10 flex flex-col justify-between h-48"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-orbitron font-semibold text-star-white/80 flex items-center gap-2">
          <Clock size={16} /> {time}
        </h3>
        <span className="text-xs px-2 py-1 bg-white/5 rounded text-white/50">Probability</span>
      </div>
      
      <div>
        <div className={`text-5xl font-mono font-bold ${color} mb-3`}>
          {percent}%
        </div>
        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${bgColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function InsightRow({ label, value, active }: { label: string, value: string, active: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
      <span className="text-star-white/80">{label}</span>
      <span className={`px-3 py-1 rounded text-sm font-medium ${active ? 'bg-orange-500/20 text-solar-orange border border-orange-500/30' : 'bg-white/5 text-star-white/50'}`}>
        {value}
      </span>
    </div>
  );
}
