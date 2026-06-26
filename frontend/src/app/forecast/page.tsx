"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Orbit, Zap, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import SunScene from "@/components/three/SunScene";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface HourlyForecast {
  hour: number;
  predicted_flux: string;
  flare_probability_percent: number;
  class_risk: string;
}

interface LLMForecast {
  summary: string;
  hourly_forecast: HourlyForecast[];
}

export default function ForecastPage() {
  const [forecast, setForecast] = useState<LLMForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/v1/forecast/12hr`);
      if (!resp.ok) throw new Error("Failed to fetch LLM forecast");
      const data = await resp.json();
      setForecast(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 min-h-screen flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="font-orbitron text-3xl font-bold text-star-white flex items-center gap-3">
            <BrainCircuit className="text-plasma-blue" /> Solar Forecast Center
          </h1>
          <p className="text-star-white/60 mt-1">12-Hour Predictive Modeling via Groq LLM & Gemini</p>
        </div>
        <button
          onClick={fetchForecast}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-plasma-blue/10 border border-plasma-blue/30 text-plasma-blue hover:bg-plasma-blue/20 transition-all text-sm disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Generating..." : "Refresh Forecast"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Column: 3D Sun & Summary */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl relative overflow-hidden h-[400px] border border-plasma-blue/20 glow-panel">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
              <Orbit size={14} className="text-plasma-blue" />
              <span className="text-xs font-mono text-star-white">Aditya-L1 View</span>
            </div>
            <SunScene />
          </div>

          <div className="glass-panel p-6 rounded-2xl flex-1">
            <h2 className="font-orbitron text-lg font-semibold text-star-white mb-4 flex items-center gap-2">
              <Zap className="text-corona-gold" size={20} /> AI Synthesis Report
            </h2>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-flare-red">
                <AlertTriangle size={16} />
                <span className="text-sm">Backend unreachable. Start the backend server.</span>
              </div>
            ) : (
              <div>
                <p className="text-star-white/80 leading-relaxed text-sm">
                  {forecast?.summary}
                </p>
                {forecast?.summary?.includes("unavailable") && (
                  <div className="mt-4 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-400/80">Live AI analysis requires valid API keys. Add them to <code className="font-mono">.env</code> and restart the backend.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic 12-Hour Bar Chart */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col">
          <h2 className="font-orbitron text-lg font-semibold text-star-white mb-2 flex items-center gap-2">
            <TrendingUp className="text-aurora-green" size={20} /> 12-Hour Probability Matrix
          </h2>
          <p className="text-sm text-star-white/50 mb-8">Hourly flare probability (%) and predicted maximum severity class.</p>

          <div className="flex-1 flex flex-col justify-end min-h-[400px] relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-plasma-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center text-flare-red/60 text-sm font-mono">
                [ API OFFLINE - FALLBACK FAILED ]
              </div>
            ) : (
              <div className="flex items-end justify-between h-full gap-2 px-2">
                {forecast?.hourly_forecast.map((hourData, i) => {
                  const prob = hourData.flare_probability_percent;
                  const isHigh = prob > 50;
                  const isMed = prob > 20 && prob <= 50;
                  
                  const barColor = isHigh ? 'bg-flare-red' : isMed ? 'bg-solar-orange' : 'bg-plasma-blue';
                  const glowColor = isHigh ? 'rgba(255,45,85,0.3)' : isMed ? 'rgba(255,107,53,0.3)' : 'rgba(0,212,255,0.3)';

                  return (
                    <div key={i} className="flex flex-col items-center flex-1 group">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-black/80 border border-white/10 rounded p-2 text-center absolute -mt-16 pointer-events-none z-20 w-32 shadow-xl">
                        <div className="text-xs text-star-white/70">Risk Class</div>
                        <div className={`font-orbitron font-bold text-lg ${isHigh ? 'text-flare-red' : isMed ? 'text-solar-orange' : 'text-aurora-green'}`}>
                          {hourData.class_risk}-Class
                        </div>
                        <div className="text-[10px] text-star-white/40 mt-1 font-mono">{hourData.predicted_flux} W/m²</div>
                      </div>

                      {/* Bar */}
                      <div className="w-full relative flex justify-center h-[300px] items-end">
                        <motion.div 
                          className={`w-full max-w-[40px] rounded-t-md ${barColor} relative overflow-hidden`}
                          style={{ boxShadow: `0 0 15px ${glowColor}` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${prob}%` }}
                          transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </motion.div>
                      </div>

                      {/* Percentage */}
                      <div className="text-xs font-mono font-bold text-star-white mt-3 mb-1">
                        {prob}%
                      </div>
                      
                      {/* Hour Label */}
                      <div className="text-[10px] text-star-white/40 font-mono">
                        +{hourData.hour}h
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
