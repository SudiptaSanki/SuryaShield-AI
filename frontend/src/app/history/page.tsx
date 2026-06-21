"use client";

import { useState, useMemo } from "react";
import { Search, Database, Calendar, X, TrendingUp, Clock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_HISTORY = [
  {
    id: "FL-2023-112A", date: "2023-12-14", class: "X2.8", peakTime: "17:02 UTC",
    duration: "45 min", impact: "High",
    peakFlux: "2.8e-4 W/m²", riseTime: "12 min", decayTime: "33 min",
    location: "S22W07", associatedCME: "Yes (Halo CME)",
    description: "Major X2.8 flare from Active Region AR3514. Caused R3 radio blackout on sunlit side of Earth. Associated halo CME reached Earth in 36 hours, triggering G3 geomagnetic storm."
  },
  {
    id: "FL-2024-045C", date: "2024-02-22", class: "X6.3", peakTime: "22:34 UTC",
    duration: "62 min", impact: "Extreme",
    peakFlux: "6.3e-4 W/m²", riseTime: "8 min", decayTime: "54 min",
    location: "N15E25", associatedCME: "Yes (Partial Halo)",
    description: "Extreme X6.3 flare — the strongest of Solar Cycle 25 at the time. Caused R3-R4 radio blackout. HF radio communication disrupted across the Pacific for over 1 hour."
  },
  {
    id: "FL-2024-188B", date: "2024-05-10", class: "X5.8", peakTime: "01:23 UTC",
    duration: "55 min", impact: "Extreme",
    peakFlux: "5.8e-4 W/m²", riseTime: "10 min", decayTime: "45 min",
    location: "S17W90", associatedCME: "Yes (Halo CME)",
    description: "Part of the historic May 2024 solar storm sequence. Multiple X-class flares in 48 hours produced the strongest geomagnetic storm since 2003. Aurora visible at unusually low latitudes."
  },
  {
    id: "FL-2024-201A", date: "2024-06-08", class: "M9.7", peakTime: "14:15 UTC",
    duration: "30 min", impact: "Moderate",
    peakFlux: "9.7e-5 W/m²", riseTime: "6 min", decayTime: "24 min",
    location: "N12W45", associatedCME: "No",
    description: "Strong M-class flare with rapid rise phase. Brief R2 radio blackout. No associated CME detected. Minor GPS positioning degradation reported in equatorial regions."
  },
  {
    id: "FL-2024-210D", date: "2024-08-14", class: "X1.1", peakTime: "06:40 UTC",
    duration: "38 min", impact: "High",
    peakFlux: "1.1e-4 W/m²", riseTime: "14 min", decayTime: "24 min",
    location: "S08E68", associatedCME: "Yes (Partial Halo)",
    description: "Moderate X-class flare from a newly emerging active region. R3 radio blackout detected. Associated CME was Earth-directed but arrived with weakened impact."
  },
  {
    id: "FL-2024-295A", date: "2024-10-01", class: "X7.1", peakTime: "03:12 UTC",
    duration: "70 min", impact: "Extreme",
    peakFlux: "7.1e-4 W/m²", riseTime: "9 min", decayTime: "61 min",
    location: "N20W30", associatedCME: "Yes (Full Halo CME)",
    description: "Exceptional X7.1 event from AR3842. Triggered G4 geomagnetic storm. Power grid operators in Scandinavia and Canada activated protective protocols. Airline polar routes diverted."
  },
  {
    id: "FL-2025-032B", date: "2025-02-01", class: "M4.2", peakTime: "09:55 UTC",
    duration: "22 min", impact: "Moderate",
    peakFlux: "4.2e-5 W/m²", riseTime: "5 min", decayTime: "17 min",
    location: "S05W12", associatedCME: "No",
    description: "Moderate M4.2 flare. Brief R1-R2 radio blackout over the Indian Ocean region. No significant geomagnetic activity followed."
  },
  {
    id: "FL-2025-110C", date: "2025-04-20", class: "X3.4", peakTime: "19:48 UTC",
    duration: "48 min", impact: "High",
    peakFlux: "3.4e-4 W/m²", riseTime: "11 min", decayTime: "37 min",
    location: "N08W55", associatedCME: "Yes (Partial Halo)",
    description: "Strong X3.4 flare detected by Aditya-L1 SoLEXS and HEL1OS instruments. SuryaShield AI issued a 12-minute advance warning. R3 radio blackout confirmed."
  },
];

interface FlareEvent {
  id: string; date: string; class: string; peakTime: string;
  duration: string; impact: string; peakFlux: string;
  riseTime: string; decayTime: string; location: string;
  associatedCME: string; description: string;
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedFlare, setSelectedFlare] = useState<FlareEvent | null>(null);

  const filteredHistory = useMemo(() => {
    return MOCK_HISTORY.filter(flare => {
      const matchesSearch = searchQuery === "" ||
        flare.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flare.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flare.impact.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDate = dateFilter === "" || flare.date === dateFilter;

      return matchesSearch && matchesDate;
    });
  }, [searchQuery, dateFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div className="mb-8">
        <h1 className="font-orbitron text-3xl font-bold text-star-white flex items-center gap-3">
          <Database className="text-plasma-blue" /> Historical Analysis
        </h1>
        <p className="text-star-white/60 mt-1">Database of previous solar flare events and their signatures</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel rounded-xl p-4 text-center">
          <div className="text-2xl font-mono font-bold text-star-white">{MOCK_HISTORY.length}</div>
          <div className="text-xs text-star-white/50 uppercase tracking-wider mt-1">Total Events</div>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center">
          <div className="text-2xl font-mono font-bold text-flare-red">{MOCK_HISTORY.filter(f => f.class.startsWith('X')).length}</div>
          <div className="text-xs text-star-white/50 uppercase tracking-wider mt-1">X-Class Flares</div>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center">
          <div className="text-2xl font-mono font-bold text-solar-orange">{MOCK_HISTORY.filter(f => f.class.startsWith('M')).length}</div>
          <div className="text-xs text-star-white/50 uppercase tracking-wider mt-1">M-Class Flares</div>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center">
          <div className="text-2xl font-mono font-bold text-star-white">{filteredHistory.length}</div>
          <div className="text-xs text-star-white/50 uppercase tracking-wider mt-1">Matching Results</div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-star-white/40" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Class, or Impact (e.g., X5.8, Extreme)"
              className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-star-white placeholder:text-star-white/30 focus:outline-none focus:border-plasma-blue transition-colors"
            />
          </div>
          <div className="relative w-full md:w-64">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-star-white/40" size={20} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-star-white focus:outline-none focus:border-plasma-blue transition-colors"
              style={{ colorScheme: 'dark' }}
            />
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-star-white/60 text-sm">
                <th className="py-3 px-4 font-medium">Event ID</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Class</th>
                <th className="py-3 px-4 font-medium">Peak Time</th>
                <th className="py-3 px-4 font-medium">Duration</th>
                <th className="py-3 px-4 font-medium">Recorded Impact</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-star-white/40">
                    No flare events match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((flare, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 text-plasma-blue font-mono text-sm">{flare.id}</td>
                    <td className="py-4 px-4 text-star-white/80">{flare.date}</td>
                    <td className="py-4 px-4 font-orbitron font-bold">
                      <span className={flare.class.startsWith('X') ? 'text-flare-red' : 'text-solar-orange'}>
                        {flare.class}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-star-white/80">{flare.peakTime}</td>
                    <td className="py-4 px-4 text-star-white/80">{flare.duration}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        flare.impact === 'Extreme' ? 'bg-red-500/20 text-red-400' :
                        flare.impact === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                    <span className={selectedFlare.class.startsWith('X') ? 'text-flare-red' : 'text-solar-orange'}>
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
                <DetailItem icon={<Zap size={16} />} label="Location" value={selectedFlare.location} />
                <DetailItem icon={<Zap size={16} />} label="Associated CME" value={selectedFlare.associatedCME} />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-star-white/40">Impact Level:</span>
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedFlare.impact === 'Extreme' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  selectedFlare.impact === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {selectedFlare.impact}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-black/30 border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-star-white/50 text-xs mb-1">{icon} {label}</div>
      <div className="text-star-white font-mono text-sm">{value}</div>
    </div>
  );
}
