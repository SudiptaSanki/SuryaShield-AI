"use client";

import { useState, useEffect, useRef } from 'react';

// For local dev, assume backend runs on 8000
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/live';

export type FlareClass = 'A' | 'B' | 'C' | 'M' | 'X';

export interface Alert {
  id: string;
  timestamp: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  predicted_class: FlareClass;
  lead_time_minutes: number;
  message: string;
  recommended_action: string;
}

export interface SolarData {
  timestamp: string;
  flux: {
    solexs: number;
    helios: number;
  };
  forecast: {
    predicted_class: FlareClass;
    probabilities: {
      "5_min": number;
      "15_min": number;
      "30_min": number;
    };
    confidence_score: number;
    attention_weights: number[];
  };
  risk: {
    score: number;
    level: string;
  };
  alert: Alert | null;
  solar_wind: {
    speed: number;
    density: number;
    bt: number;
    bz: number;
  };
  ai_scale: number;
}

export function useWebSocket() {
  const [dataHistory, setDataHistory] = useState<SolarData[]>([]);
  const [latestData, setLatestData] = useState<SolarData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    const connect = () => {
      if (!mountedRef.current) return;

      try {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          retryCountRef.current = 0; // Reset on successful connect
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'LIVE_DATA') {
              const data: SolarData = payload;
              setLatestData(data);
              setDataHistory(prev => {
                const newHistory = [...prev, data];
                if (newHistory.length > 60) {
                  return newHistory.slice(newHistory.length - 60);
                }
                return newHistory;
              });
            }
          } catch {
            // Silently ignore malformed messages
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (mountedRef.current) {
            const delay = Math.min(3000 * Math.pow(1.5, retryCountRef.current), 15000);
            retryCountRef.current++;
            setTimeout(connect, delay);
          }
        };

        ws.onerror = () => {
          // Don't log to console.error — it triggers the Next.js dev overlay.
          // The onclose handler will fire next and trigger a reconnect.
          ws.close();
        };

        wsRef.current = ws;
      } catch {
        // WebSocket constructor can throw if URL is invalid
        if (mountedRef.current) {
          setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      mountedRef.current = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { latestData, dataHistory, isConnected };
}
