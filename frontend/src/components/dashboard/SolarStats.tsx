"use client";

import { SolarData } from "@/hooks/useWebSocket";
import { TrendingUp, Zap, Thermometer, ShieldAlert, Activity, Waves, Magnet, Brain } from "lucide-react";

export default function SolarStats({ latestData, history }: { latestData: SolarData | null, history: SolarData[] }) {
  
  const currentSoft = latestData?.flux.solexs || 0;
  
  // Calculate trend
  let trendStr = "Stable";
  let trendColor = "text-star-white/60";
  if (history.length >= 2) {
    const prevSoft = history[history.length - 2].flux.solexs;
    const diff = currentSoft - prevSoft;
    if (diff > 1e-8) {
      trendStr = "Rising Quickly";
      trendColor = "text-solar-orange";
    } else if (diff > 1e-9) {
      trendStr = "Rising";
      trendColor = "text-yellow-400";
    } else if (diff < -1e-9) {
      trendStr = "Falling";
      trendColor = "text-aurora-green";
    }
  }

  const hardToSoftRatio = latestData ? (latestData.flux.helios / (latestData.flux.solexs + 1e-10)).toExponential(2) : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        icon={<Thermometer className="text-plasma-blue" />}
        title="Current Soft Flux"
        value={currentSoft.toExponential(2) + " W/m²"}
        subtext={`Trend: <span class="${trendColor}">${trendStr}</span>`}
      />
      <StatCard 
        icon={<Zap className="text-corona-gold" />}
        title="Predicted Class"
        value={latestData?.forecast.predicted_class || "A"}
        subtext={`Confidence: ${Math.round((latestData?.forecast.confidence_score || 0) * 100)}%`}
      />
      <StatCard 
        icon={<TrendingUp className="text-solar-orange" />}
        title="Spectral Hardness"
        value={hardToSoftRatio}
        subtext="HEL1OS / SoLEXS Ratio"
      />
      <StatCard 
        icon={<ShieldAlert className={latestData?.alert ? "text-flare-red animate-pulse" : "text-aurora-green"} />}
        title="Alert Status"
        value={latestData?.alert ? "ACTIVE WARNING" : "CLEAR"}
        subtext={latestData?.alert ? `Lead time: ${latestData.alert.lead_time_minutes} min` : "No threats detected"}
      />
      
      {/* New Rows for Solar Wind Data */}
      <StatCard 
        icon={<Activity className="text-plasma-blue" />}
        title="Solar Wind Speed"
        value={`${latestData?.solar_wind?.speed.toFixed(1) || "400.0"} km/s`}
        subtext={latestData?.solar_wind?.speed && latestData.solar_wind.speed > 500 ? '<span class="text-solar-orange">Elevated Speed</span>' : '<span class="text-aurora-green">Normal Flow</span>'}
      />
      <StatCard 
        icon={<Waves className="text-corona-gold" />}
        title="Proton Density"
        value={`${latestData?.solar_wind?.density.toFixed(1) || "5.0"} p/cm³`}
        subtext="Solar Wind Plasma Density"
      />
      <StatCard 
        icon={<Magnet className="text-purple-400" />}
        title="Magnetic Field"
        value={`Bt: ${latestData?.solar_wind?.bt.toFixed(1) || "5.0"} nT`}
        subtext={`Bz: ${latestData?.solar_wind?.bz.toFixed(1) || "0.0"} nT`}
      />
      <StatCard 
        icon={<Brain className="text-pink-400" />}
        title="AI Prediction Scale"
        value={`${latestData?.ai_scale?.toFixed(1) || "1.0"} / 10`}
        subtext="Composite Risk Heuristic"
      />
    </div>
  );
}

function StatCard({ icon, title, value, subtext }: { icon: React.ReactNode, title: string, value: string, subtext: string }) {
  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-white/5">{icon}</div>
        <h3 className="text-sm font-medium text-star-white/60">{title}</h3>
      </div>
      <div>
        <div className="text-2xl font-mono font-bold text-star-white mb-1">{value}</div>
        <div className="text-xs text-star-white/50" dangerouslySetInnerHTML={{ __html: subtext }}></div>
      </div>
    </div>
  );
}
