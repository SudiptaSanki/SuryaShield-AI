"use client";

import { useWebSocket } from "@/hooks/useWebSocket";
import LiveIndicator from "@/components/dashboard/LiveIndicator";
import SolarStats from "@/components/dashboard/SolarStats";
import XRayFluxChart from "@/components/charts/XRayFluxChart";
import RiskMeter from "@/components/dashboard/RiskMeter";
import FlareAlert from "@/components/dashboard/FlareAlert";
import { Activity } from "lucide-react";

export default function DashboardPage() {
  const { latestData, dataHistory, isConnected } = useWebSocket();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-orbitron text-3xl font-bold text-star-white flex items-center gap-3">
            <Activity className="text-plasma-blue" /> Live Solar Dashboard
          </h1>
          <p className="text-star-white/60 mt-1">
            Real-time telemetry powered by{" "}
            <a href="https://www.swpc.noaa.gov/" target="_blank" rel="noopener noreferrer" className="text-plasma-blue/80 hover:text-plasma-blue underline transition-colors">
              NOAA Space Weather Prediction Center (SWPC)
            </a>
          </p>
        </div>
        <LiveIndicator isConnected={isConnected} />
      </div>

      {latestData?.alert && (
        <div className="mb-8">
          <FlareAlert alert={latestData.alert} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3 glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-plasma-blue to-solar-orange"></div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-orbitron text-lg font-semibold text-star-white">X-Ray Flux Monitor</h2>
            <a href="https://www.swpc.noaa.gov/products/goes-x-ray-flux" target="_blank" rel="noopener noreferrer" className="text-xs text-star-white/40 hover:text-plasma-blue transition-colors flex items-center gap-1">
              Source: GOES-18 Satellite ↗
            </a>
          </div>
          <div className="h-[400px] flex-1">
            <XRayFluxChart data={dataHistory} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center">
          <h2 className="font-orbitron text-lg font-semibold text-star-white mb-6 w-full text-left">Current Risk</h2>
          <RiskMeter score={latestData?.risk?.score || 0} level={latestData?.risk?.level || "LOW"} />
        </div>
      </div>

      <SolarStats latestData={latestData} history={dataHistory} />
    </div>
  );
}
