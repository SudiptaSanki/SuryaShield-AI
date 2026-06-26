"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Database, Calendar, X, TrendingUp, Clock, Zap, RefreshCw, Satellite, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface FlareEvent {
  id: string;
  date: string;
  class: string;
  beginClass: string;
  endClass: string;
  peakTime: string;
  duration: string;
  impact: string;
  peakFlux: string;
  riseTime: string;
  decayTime: string;
  satellite: string;
  associatedCME: string;
  description: string;
}

type ImpactFilter = "ALL" | "X" | "M" | "C" | "B";

export default function HistoryPage() {
  const [events, setEvents] = useState<FlareEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [classFilter, setClassFilter] = useState<ImpactFilter>("ALL");
  const [selectedFlare, setSelectedFlare] = useState<FlareEvent | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/v1/history/flares?days=7`);
      if (!resp.ok) throw new Error(`Server responded with ${resp.status}`);
      const data = await resp.json();
      setEvents(data.events || []);
      setFetchedAt(data.fetched_at || null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(f => {
      const matchesSearch =
        searchQuery === "" ||
        f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.impact.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDate = dateFilter === "" || f.date === dateFilter;
      const matchesClass = classFilter === "ALL" || f.class.startsWith(classFilter);

      return matchesSearch && matchesDate && matchesClass;
    });
  }, [events, searchQuery, dateFilter, classFilter]);

  const xCount = events.filter(f => f.class.startsWith("X")).length;
  const mCount = events.filter(f => f.class.startsWith("M")).length;
  const cCount = events.filter(f => f.class.startsWith("C")).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-orbitron text-3xl font-bold text-star-white flex items-center gap-3">
            <Database className="text-plasma-blue" /> Historical Analysis
          </h1>
          <p className="text-star-white/60 mt-1">
            Live flare event log from{" "}
            <span className="text-plasma-blue font-mono">NOAA GOES-18 XRS</span> — last 7 days
          </p>
          {fetchedAt && (
            <p className="text-star-white/40 text-xs mt-1 font-mono">
              Data fetched at {new Date(fetchedAt).toUTCString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-plasma-blue/10 border border-plasma-blue/30 text-plasma-blue hover:bg-plasma-blue/20 transition-all text-sm disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel rounded-xl p-4 text-center">
          <div className="text-2xl font-mono font-bold text-star-white">{events.length}</div>
          <div className="text-xs text-star-white/50 uppercase tracking-wider mt-1">Total Events (7d)</div>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center cursor-pointer hover:border-red-500/30 transition-colors" onClick={() => setClassFilter(classFilter === "X" ? "ALL" : "X")}>
          <div className="text-2xl font-mono font-bold text-flare-red">{xCount}</div>
          <div className="text-xs text-star-white/50 uppercase tracking-wider mt-1">X-Class Flares</div>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center cursor-pointer hover:border-orange-500/30 transition-colors" onClick={() => setClassFilter(classFilter === "M" ? "ALL" : "M")}>
          <div className="text-2xl font-mono font-bold text-solar-orange">{mCount}</div>
          <div className="text-xs text-star-white/50 uppercase tracking-wider mt-1">M-Class Flares</div>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center cursor-pointer hover:border-yellow-500/30 transition-colors" onClick={() => setClassFilter(classFilter === "C" ? "ALL" : "C")}>
          <div className="text-2xl font-mono font-bold text-corona-gold">{cCount}</div>
          <div className="text-xs text-star-white/50 uppercase tracking-wider mt-1">C-Class Flares</div>
        </div>
      </div>

      {/* Source Badge */}
      <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 w-fit">
        <Satellite size={14} className="text-green-400" />
        <span className="text-green-400 text-xs font-mono">LIVE DATA SOURCE: NOAA/SWPC GOES-18 XRS (Real-Time)</span>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" />
      </div>

      <div className="glass-panel p-6 rounded-2xl mb-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-star-white/40" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Class, or Impact level..."
              className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-star-white placeholder:text-star-white/30 focus:outline-none focus:border-plasma-blue transition-colors"
            />
          </div>
          <div className="relative w-full md:w-52">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-star-white/40" size={20} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-star-white focus:outline-none focus:border-plasma-blue transition-colors"
              style={{ colorScheme: "dark" }}
            />
          </div>
          {/* Class Quick Filter */}
          <div className="flex flex-wrap gap-2">
            {(["ALL", "X", "M", "C", "B"] as ImpactFilter[]).map((c) => (
              <button
                key={c}
                onClick={() => setClassFilter(c)}
                className={`px-3 py-2 rounded-lg text-sm font-mono font-bold border transition-all ${
                  classFilter === c
                    ? c === "X" ? "bg-red-500/20 border-red-500/50 text-red-400"
                    : c === "M" ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                    : c === "C" ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                    : "bg-plasma-blue/20 border-plasma-blue/50 text-plasma-blue"
                    : "bg-white/5 border-white/10 text-star-white/60 hover:border-white/20"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {(searchQuery || dateFilter) && (
            <button
              onClick={() => { setSearchQuery(""); setDateFilter(""); }}
              className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-star-white/70 hover:text-flare-red hover:border-flare-red/30 transition-colors"
            >
              <X size={16} /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        {error ? (
          <div className="flex items-center gap-3 text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <AlertTriangle size={20} />
            <div>
              <p className="font-medium">Failed to load real-time data</p>
              <p className="text-sm text-orange-400/70">{error} — Is the backend running on port 8000?</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-2 border-plasma-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-star-white/50 text-sm">Fetching NOAA real-time flare data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-star-white/60 text-sm">
                  <th className="py-3 px-4 font-medium">Event ID</th>
                  <th className="py-3 px-4 font-medium">Date (UTC)</th>
                  <th className="py-3 px-4 font-medium">Max Class</th>
                  <th className="py-3 px-4 font-medium">Peak Time</th>
                  <th className="py-3 px-4 font-medium">Duration</th>
                  <th className="py-3 px-4 font-medium">Peak Flux</th>
                  <th className="py-3 px-4 font-medium">Impact</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-star-white/40">
                      {events.length === 0
                        ? "No flare events recorded in the last 7 days."
                        : "No events match your filters. Try changing your search or class filter."}
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((flare, idx) => (
                    <motion.tr
                      key={flare.id + idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4 text-plasma-blue font-mono text-sm">{flare.id}</td>
                      <td className="py-4 px-4 text-star-white/80 font-mono text-sm">{flare.date}</td>
                      <td className="py-4 px-4 font-orbitron font-bold">
                        <span className={
                          flare.class.startsWith("X") ? "text-flare-red" :
                          flare.class.startsWith("M") ? "text-solar-orange" :
                          "text-corona-gold"
                        }>
                          {flare.class}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-star-white/80 font-mono text-sm">{flare.peakTime}</td>
                      <td className="py-4 px-4 text-star-white/80 text-sm">{flare.duration}</td>
                      <td className="py-4 px-4 text-star-white/70 font-mono text-xs">{flare.peakFlux}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          flare.impact === "Extreme" ? "bg-red-500/20 text-red-400" :
                          flare.impact === "High" ? "bg-orange-500/20 text-orange-400" :
                          flare.impact === "Moderate" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {flare.impact}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedFlare(flare)}
                          className="text-sm text-plasma-blue hover:text-white transition-colors border border-plasma-blue/30 hover:border-plasma-blue px-3 py-1 rounded-md"
                        >
                          View Data
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedFlare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedFlare(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="glass-panel rounded-2xl p-8 max-w-2xl w-full border border-plasma-blue/20 shadow-[0_0_60px_rgba(0,212,255,0.15)] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-xs text-plasma-blue font-mono tracking-wider mb-1">{selectedFlare.id}</div>
                  <h2 className="font-orbitron text-2xl font-bold text-star-white flex items-center gap-3">
                    <span className={
                      selectedFlare.class.startsWith("X") ? "text-flare-red" :
                      selectedFlare.class.startsWith("M") ? "text-solar-orange" :
                      "text-corona-gold"
                    }>
                      {selectedFlare.class}
                    </span>
                    Solar Flare
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedFlare(null)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-star-white/70 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-star-white/80 leading-relaxed mb-6">{selectedFlare.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <DetailItem icon={<Calendar size={16} />} label="Date" value={selectedFlare.date} />
                <DetailItem icon={<Clock size={16} />} label="Peak Time" value={selectedFlare.peakTime} />
                <DetailItem icon={<Zap size={16} />} label="Peak Flux" value={selectedFlare.peakFlux} />
                <DetailItem icon={<TrendingUp size={16} />} label="Duration" value={selectedFlare.duration} />
                <DetailItem icon={<TrendingUp size={16} />} label="Rise Time" value={selectedFlare.riseTime} />
                <DetailItem icon={<TrendingUp size={16} />} label="Decay Time" value={selectedFlare.decayTime} />
                <DetailItem icon={<Zap size={16} />} label="Begin Class" value={selectedFlare.beginClass} />
                <DetailItem icon={<Satellite size={16} />} label="Satellite" value={selectedFlare.satellite} />
              </div>

              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-star-white/40">Impact Level:</span>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    selectedFlare.impact === "Extreme" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                    selectedFlare.impact === "High" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                    selectedFlare.impact === "Moderate" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                    "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}>
                    {selectedFlare.impact}
                  </span>
                </div>
                <a
                  href="https://www.swpc.noaa.gov/products/goes-x-ray-flux"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-plasma-blue/70 hover:text-plasma-blue underline transition-colors"
                >
                  View on NOAA SWPC ↗
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-black/30 border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-star-white/50 text-xs mb-1">{icon} {label}</div>
      <div className="text-star-white font-mono text-sm">{value}</div>
    </div>
  );
}
