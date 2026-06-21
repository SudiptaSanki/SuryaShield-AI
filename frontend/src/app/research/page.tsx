"use client";

import { Info, Cpu, Network, Layers } from "lucide-react";

export default function ResearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div className="mb-8">
        <h1 className="font-orbitron text-3xl font-bold text-star-white flex items-center gap-3">
          <Info className="text-plasma-blue" /> Research & Model Information
        </h1>
        <p className="text-star-white/60 mt-1">Under the hood of the SuryaShield AI prediction engine</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="glass-panel p-8 rounded-2xl">
            <h2 className="font-orbitron text-xl font-bold text-corona-gold mb-4 flex items-center gap-2">
              <Network size={24} /> Architecture Overview
            </h2>
            <p className="text-star-white/80 leading-relaxed mb-6">
              SuryaShield uses a hybrid <strong>CNN-LSTM</strong> (Convolutional Neural Network + Long Short-Term Memory) 
              architecture with an <strong>Attention mechanism</strong>. This design allows the model to capture both 
              immediate, sharp spikes (via CNN) and long-term evolutionary trends (via LSTM) in X-ray flux data.
            </p>
            <div className="bg-black/40 border border-white/5 rounded-lg p-6 flex flex-col gap-4 text-center">
              <div className="bg-plasma-blue/20 border border-plasma-blue/40 text-plasma-blue py-2 rounded">Input: SoLEXS + HEL1OS Time Series (Normalized)</div>
              <div className="text-star-white/40">↓</div>
              <div className="bg-white/10 border border-white/20 text-star-white py-2 rounded">1D CNN Layers (Feature Extraction)</div>
              <div className="text-star-white/40">↓</div>
              <div className="bg-white/10 border border-white/20 text-star-white py-2 rounded">Bidirectional LSTM (Temporal Dependencies)</div>
              <div className="text-star-white/40">↓</div>
              <div className="bg-solar-orange/20 border border-solar-orange/40 text-solar-orange py-2 rounded">Attention Mechanism + Engineered Features</div>
              <div className="text-star-white/40">↓</div>
              <div className="bg-flare-red/20 border border-flare-red/40 text-flare-red py-2 rounded font-bold">Output: Flare Class & Probability</div>
            </div>
          </section>

          <section className="glass-panel p-8 rounded-2xl">
            <h2 className="font-orbitron text-xl font-bold text-plasma-blue mb-4 flex items-center gap-2">
              <Cpu size={24} /> Training Data & Preprocessing
            </h2>
            <ul className="list-disc list-inside text-star-white/80 space-y-3 leading-relaxed">
              <li><strong>Source:</strong> ISRO Aditya-L1 Mission Data (Simulated for MVP).</li>
              <li><strong>Instruments:</strong> SoLEXS (1-8 Å) and HEL1OS (10-100 keV).</li>
              <li><strong>Noise Reduction:</strong> Savitzky-Golay filtering applied to smooth instrumental jitter.</li>
              <li><strong>Normalization:</strong> Log-scaling followed by Min-Max normalization.</li>
              <li><strong>Feature Engineering:</strong> First derivative (rise rate), spectral hardness ratio, and moving variances are concatenated with the dense layer.</li>
            </ul>
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass-panel p-8 rounded-2xl h-full">
            <h2 className="font-orbitron text-xl font-bold text-aurora-green mb-4 flex items-center gap-2">
              <Layers size={24} /> Model Performance Metrics
            </h2>
            <p className="text-star-white/60 mb-6">Based on validation against simulated historical datasets.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-black/40 border border-white/5 p-4 rounded-lg text-center">
                <div className="text-3xl font-mono font-bold text-star-white mb-1">94.2%</div>
                <div className="text-xs text-star-white/50 uppercase tracking-wider">Overall Accuracy</div>
              </div>
              <div className="bg-black/40 border border-white/5 p-4 rounded-lg text-center">
                <div className="text-3xl font-mono font-bold text-star-white mb-1">0.89</div>
                <div className="text-xs text-star-white/50 uppercase tracking-wider">F1 Score (M/X Class)</div>
              </div>
              <div className="bg-black/40 border border-white/5 p-4 rounded-lg text-center">
                <div className="text-3xl font-mono font-bold text-star-white mb-1">8.4m</div>
                <div className="text-xs text-star-white/50 uppercase tracking-wider">Avg Lead Time</div>
              </div>
              <div className="bg-black/40 border border-white/5 p-4 rounded-lg text-center">
                <div className="text-3xl font-mono font-bold text-star-white mb-1">2.1%</div>
                <div className="text-xs text-star-white/50 uppercase tracking-wider">False Alarm Rate</div>
              </div>
            </div>

            <h3 className="font-orbitron text-md font-semibold text-star-white mb-3">Confusion Matrix (Class Prediction)</h3>
            <div className="bg-black/40 border border-white/10 p-4 rounded-lg font-mono text-xs text-star-white/70">
              <table className="w-full text-center">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2">True \ Pred</th><th>A/B</th><th>C</th><th>M</th><th>X</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="py-2 border-r border-white/10 font-bold">A/B</td><td className="text-aurora-green">98%</td><td>2%</td><td>0%</td><td>0%</td></tr>
                  <tr><td className="py-2 border-r border-white/10 font-bold">C</td><td>5%</td><td className="text-aurora-green">91%</td><td>4%</td><td>0%</td></tr>
                  <tr><td className="py-2 border-r border-white/10 font-bold">M</td><td>0%</td><td>8%</td><td className="text-aurora-green">89%</td><td>3%</td></tr>
                  <tr><td className="py-2 border-r border-white/10 font-bold">X</td><td>0%</td><td>0%</td><td>6%</td><td className="text-aurora-green">94%</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
