"use client";

import dynamic from 'next/dynamic';
import { SolarData } from '@/hooks/useWebSocket';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-star-white/50">Initializing telemetry...</div> });

export default function XRayFluxChart({ data }: { data: SolarData[] }) {
  if (!data || data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-star-white/50">Waiting for data stream...</div>;
  }

  const times = data.map(d => new Date(d.timestamp));
  const softFlux = data.map(d => d.flux.solexs);
  const hardFlux = data.map(d => d.flux.helios);

  return (
    <div className="w-full h-full">
      <Plot
        data={[
          {
            x: times,
            y: softFlux,
            type: 'scatter',
            mode: 'lines',
            name: 'SoLEXS (Soft)',
            line: { color: '#ff6b35', width: 2 },
            yaxis: 'y',
          },
          {
            x: times,
            y: hardFlux,
            type: 'scatter',
            mode: 'lines',
            name: 'HEL1OS (Hard)',
            line: { color: '#00d4ff', width: 2 },
            yaxis: 'y2',
          }
        ]}
        layout={{
          autosize: true,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          margin: { t: 10, r: 50, l: 60, b: 40 },
          font: { color: '#e8e6f0', family: 'Inter' },
          xaxis: {
            title: 'Time (UTC)',
            gridcolor: 'rgba(255,255,255,0.1)',
            zeroline: false,
          },
          yaxis: {
            title: 'Soft X-ray Flux (W/m²)',
            type: 'log',
            gridcolor: 'rgba(255,255,255,0.1)',
            zeroline: false,
            exponentformat: 'e',
          },
          yaxis2: {
            title: 'Hard X-ray Flux (Count)',
            type: 'log',
            overlaying: 'y',
            side: 'right',
            gridcolor: 'rgba(255,255,255,0)',
            exponentformat: 'e',
          },
          legend: {
            orientation: 'h',
            y: 1.1,
            x: 0.5,
            xanchor: 'center',
          },
          hovermode: 'x unified',
          hoverlabel: {
            bgcolor: 'rgba(10, 14, 39, 0.95)',
            bordercolor: 'rgba(0, 212, 255, 0.3)',
            font: { color: '#e8e6f0', family: 'Inter', size: 13 },
          },
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
}
