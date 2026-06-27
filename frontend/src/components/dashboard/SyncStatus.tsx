"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Satellite } from "lucide-react";

interface SyncStatusProps {
  isLive: boolean;
  label?: string;
}

/**
 * Shows a ticking timer while the backend is waking up,
 * then switches to a green "LIVE" badge when real data arrives.
 */
export default function SyncStatus({ isLive, label = "Syncing with NOAA satellite" }: SyncStatusProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isLive) return; // stop counting once live
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  if (isLive) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-mono animate-in fade-in duration-500">
        <CheckCircle2 size={13} />
        <span>LIVE — Real-time data active</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-plasma-blue/10 border border-plasma-blue/25 text-plasma-blue text-xs font-mono">
      <Loader2 size={13} className="animate-spin" />
      <span>{label}...</span>
      <span className="text-star-white/50 tabular-nums">{timeStr}</span>
    </div>
  );
}
