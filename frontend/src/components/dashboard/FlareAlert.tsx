"use client";

import { Alert } from "@/hooks/useWebSocket";
import { AlertTriangle, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function FlareAlert({ alert }: { alert: Alert }) {
  let bgClass = "bg-red-900/40 border-red-500/50";
  let iconColor = "text-red-400";
  let titleColor = "text-red-100";

  if (alert.severity === "MODERATE") {
    bgClass = "bg-yellow-900/40 border-yellow-500/50";
    iconColor = "text-yellow-400";
    titleColor = "text-yellow-100";
  } else if (alert.severity === "HIGH") {
    bgClass = "bg-orange-900/40 border-orange-500/50";
    iconColor = "text-orange-400";
    titleColor = "text-orange-100";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl p-5 shadow-[0_0_30px_rgba(255,45,85,0.2)] ${bgClass} backdrop-blur-md relative overflow-hidden`}
    >
      {/* Animated subtle warning background */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      
      <div className="flex items-start gap-4 relative z-10">
        <div className={`p-3 rounded-full bg-black/20 ${iconColor}`}>
          <AlertTriangle size={28} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className={`text-xl font-orbitron font-bold tracking-wide ${titleColor} mb-1`}>
              {alert.severity} SPACE WEATHER WARNING
            </h3>
            {alert.lead_time_minutes > 0 && (
              <span className="font-mono text-sm bg-black/30 px-2 py-1 rounded text-white/80 border border-white/10">
                T - {alert.lead_time_minutes} MIN
              </span>
            )}
          </div>
          <p className="text-white/90 font-medium text-lg mb-3">
            {alert.message}
          </p>
          <div className="flex items-start gap-2 bg-black/20 rounded p-3 text-sm text-white/80 border border-white/5">
            <Info size={16} className="mt-0.5 opacity-70 shrink-0" />
            <p><strong>Action Required:</strong> {alert.recommended_action}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
