"use client";

import { useWebSocket } from "@/hooks/useWebSocket";
import { BASELINE_DASHBOARD_DATA } from "@/data/baselineData";
import LiveIndicator from "@/components/dashboard/LiveIndicator";
import SyncStatus from "@/components/dashboard/SyncStatus";
import SolarStats from "@/components/dashboard/SolarStats";
import XRayFluxChart from "@/components/charts/XRayFluxChart";
import RiskMeter from "@/components/dashboard/RiskMeter";
import FlareAlert from "@/components/dashboard/FlareAlert";
import { Activity, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { latestData, dataHistory, isConnected } = useWebSocket();
  const [currentTime, setCurrentTime] = useState<string>("");

  // Use real data when available, otherwise show baseline
  const isLive = isConnected && dataHistory.length > 0;
  const displayHistory = isLive ? dataHistory : BASELINE_DASHBOARD_DATA;
  const displayLatest = isLive
    ? latestData
    : BASELINE_DASHBOARD_DATA[BASELINE_DASHBOARD_DATA.length - 1];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istTime = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(`${istTime} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-orbitron text-3xl font-bold text-star-white flex items-center gap-3">
            <Activity className="text-plasma-blue" /> Live Solar Dashboard
          </h1>
          <p className="text-star-white/60 mt-1 flex items-center gap-2">
            Real-time telemetry powered by{" "}
            <a href="https://www.swpc.noaa.gov/" target="_blank" rel="noopener noreferrer" className="text-plasma-blue/80 hover:text-plasma-blue underline transition-colors">
              NOAA SWPC
            </a>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <SyncStatus isLive={isLive} label="Connecting to satellite stream" />
          <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full border border-white/5">
            <Clock className="text-solar-orange" size={16} />
            <span className="text-sm font-mono text-star-white/80">{currentTime}</span>
          </div>
          <LiveIndicator isConnected={isConnected} />
        </div>
      </div>

      {displayLatest?.alert && (
        <div className="mb-8">
          <FlareAlert alert={displayLatest.alert} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3 glass-panel glow-panel rounded-2xl p-6 relative overflow-hidden flex flex-col border-t border-t-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-plasma-blue to-solar-orange opacity-80"></div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-orbitron text-lg font-semibold text-star-white">X-Ray Flux Monitor</h2>
            <a href="https://www.swpc.noaa.gov/products/goes-x-ray-flux" target="_blank" rel="noopener noreferrer" className="text-xs text-star-white/40 hover:text-plasma-blue transition-colors flex items-center gap-1">
              Source: GOES-18 Satellite ↗
            </a>
          </div>
          <div className="min-h-[300px] md:h-[400px] flex-1 w-full">
            <XRayFluxChart data={displayHistory} />
          </div>
        </div>

        <div className="glass-panel glow-panel rounded-2xl p-6 flex flex-col items-center justify-center border-t border-t-white/10 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <h2 className="font-orbitron text-lg font-semibold text-star-white mb-6 w-full text-left">Current Risk</h2>
          <RiskMeter score={displayLatest?.risk?.score || 0} level={displayLatest?.risk?.level || "LOW"} />
        </div>
      </div>

      <SolarStats latestData={displayLatest} history={displayHistory} />
    </div>
  );
}
