"use client";

import { SolarData } from "@/hooks/useWebSocket";
import { TrendingUp, Zap, Thermometer, ShieldAlert } from "lucide-react";

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
