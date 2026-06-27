/**
 * baselineData.ts
 * ──────────────────────────────────────────────────────────────────────
 * Realistic fallback data so all pages render instantly before the
 * backend (Render free tier) wakes up from cold-start.
 *
 * This data is based on actual NOAA patterns and gives users a working
 * UI within milliseconds of visiting the page.
 * ──────────────────────────────────────────────────────────────────────
 */

import type { SolarData } from "@/hooks/useWebSocket";

// ─── Dashboard: Seed data for charts & metrics ──────────────────────

function generateBaselineSolarData(count: number): SolarData[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const t = now - (count - i) * 2000;
    const noise = Math.sin(i * 0.3) * 0.2;
    const flux = 2.5e-7 + noise * 1e-7;
    return {
      timestamp: new Date(t).toISOString(),
      flux: {
        solexs: flux,
        helios: flux * 1.1,
      },
      forecast: {
        predicted_class: "C" as const,
        probabilities: {
          "5_min": 12 + Math.round(noise * 5),
          "15_min": 8 + Math.round(noise * 3),
          "30_min": 5 + Math.round(noise * 2),
        },
        confidence_score: 0.82 + noise * 0.05,
        attention_weights: [0.3, 0.25, 0.2, 0.15, 0.1],
      },
      risk: {
        score: 25 + Math.round(noise * 10),
        level: "LOW",
      },
      alert: null,
      solar_wind: {
        speed: 380 + Math.round(noise * 40),
        density: 4.2 + noise * 1.5,
        bt: 5.1 + noise * 2,
        bz: -1.2 + noise * 3,
      },
      ai_scale: 3 + Math.round(noise * 2),
    };
  });
}

export const BASELINE_DASHBOARD_DATA = generateBaselineSolarData(30);

// ─── Forecast: 12-hour AI prediction baseline ───────────────────────

export const BASELINE_FORECAST = {
  summary:
    "Space weather is currently near-baseline with quiet-to-unsettled geomagnetic conditions expected over the next 12 hours. " +
    "Background solar X-ray flux remains at B/C-class levels. Minor C-class flare activity is possible from Active Region 3842. " +
    "No significant proton events or geomagnetic storms are anticipated.",
  hourly_forecast: [
    { hour: 1, predicted_flux: "1.2e-6", flare_probability_percent: 12, class_risk: "C" },
    { hour: 2, predicted_flux: "1.1e-6", flare_probability_percent: 14, class_risk: "C" },
    { hour: 3, predicted_flux: "1.3e-6", flare_probability_percent: 18, class_risk: "C" },
    { hour: 4, predicted_flux: "1.5e-6", flare_probability_percent: 22, class_risk: "C" },
    { hour: 5, predicted_flux: "2.0e-6", flare_probability_percent: 28, class_risk: "M" },
    { hour: 6, predicted_flux: "2.3e-6", flare_probability_percent: 35, class_risk: "M" },
    { hour: 7, predicted_flux: "1.8e-6", flare_probability_percent: 25, class_risk: "C" },
    { hour: 8, predicted_flux: "1.4e-6", flare_probability_percent: 19, class_risk: "C" },
    { hour: 9, predicted_flux: "1.2e-6", flare_probability_percent: 15, class_risk: "C" },
    { hour: 10, predicted_flux: "1.1e-6", flare_probability_percent: 11, class_risk: "B" },
    { hour: 11, predicted_flux: "1.0e-6", flare_probability_percent: 9, class_risk: "B" },
    { hour: 12, predicted_flux: "1.1e-6", flare_probability_percent: 10, class_risk: "B" },
  ],
};

// ─── History: Recent flare events (realistic recent data) ───────────

function recentDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export const BASELINE_HISTORY = {
  events: [
    {
      id: `FL-${recentDate(0).replace(/-/g, "")}-C21`,
      date: recentDate(0),
      class: "C2.1",
      beginClass: "B8.4",
      endClass: "C1.0",
      peakTime: "06:42 UTC",
      duration: "18 min",
      impact: "Low",
      peakFlux: "2.10e-06 W/m²",
      riseTime: "7 min",
      decayTime: "11 min",
      satellite: "GOES-18",
      associatedCME: "No",
      description: "Minor C2.1 X-ray enhancement detected from Active Region 3842. Background flux levels returned to B-class within 20 minutes.",
    },
    {
      id: `FL-${recentDate(1).replace(/-/g, "")}-C34`,
      date: recentDate(1),
      class: "C3.4",
      beginClass: "B9.2",
      endClass: "C1.5",
      peakTime: "14:18 UTC",
      duration: "24 min",
      impact: "Low",
      peakFlux: "3.40e-06 W/m²",
      riseTime: "9 min",
      decayTime: "15 min",
      satellite: "GOES-18",
      associatedCME: "No",
      description: "Moderate C3.4 flare originating from AR 3842. Peak flux reached C3-level with gradual decay. No coronal mass ejection associated.",
    },
    {
      id: `FL-${recentDate(2).replace(/-/g, "")}-M11`,
      date: recentDate(2),
      class: "M1.1",
      beginClass: "C4.2",
      endClass: "C2.8",
      peakTime: "21:05 UTC",
      duration: "38 min",
      impact: "Moderate",
      peakFlux: "1.10e-05 W/m²",
      riseTime: "12 min",
      decayTime: "26 min",
      satellite: "GOES-18",
      associatedCME: "Possible",
      description: "M1.1 class flare with impulsive rise phase. Minor R1 radio blackout observed on daylit hemisphere. Associated CME being analyzed.",
    },
    {
      id: `FL-${recentDate(3).replace(/-/g, "")}-C15`,
      date: recentDate(3),
      class: "C1.5",
      beginClass: "B7.8",
      endClass: "B9.1",
      peakTime: "03:22 UTC",
      duration: "15 min",
      impact: "Low",
      peakFlux: "1.50e-06 W/m²",
      riseTime: "5 min",
      decayTime: "10 min",
      satellite: "GOES-18",
      associatedCME: "No",
      description: "Brief C1.5 enhancement. Consistent with background coronal activity. No significant impacts reported.",
    },
    {
      id: `FL-${recentDate(4).replace(/-/g, "")}-C42`,
      date: recentDate(4),
      class: "C4.2",
      beginClass: "C1.1",
      endClass: "C1.8",
      peakTime: "17:51 UTC",
      duration: "28 min",
      impact: "Low",
      peakFlux: "4.20e-06 W/m²",
      riseTime: "10 min",
      decayTime: "18 min",
      satellite: "GOES-18",
      associatedCME: "No",
      description: "C4.2 flare from AR 3840. Moderate X-ray enhancement with extended decay phase. No geomagnetic impacts expected.",
    },
    {
      id: `FL-${recentDate(5).replace(/-/g, "")}-C28`,
      date: recentDate(5),
      class: "C2.8",
      beginClass: "B9.5",
      endClass: "C1.2",
      peakTime: "09:33 UTC",
      duration: "20 min",
      impact: "Low",
      peakFlux: "2.80e-06 W/m²",
      riseTime: "8 min",
      decayTime: "12 min",
      satellite: "GOES-18",
      associatedCME: "No",
      description: "Routine C2.8 flare activity. Background conditions remain nominal.",
    },
  ],
  fetched_at: new Date().toISOString(),
};
