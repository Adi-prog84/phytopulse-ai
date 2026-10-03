import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function SimulationBanner() {
  const { simulation } = useFarm();

  return (
    <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-b border-emerald-500/30 px-4 py-2 text-xs md:text-sm text-slate-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
            DEMO SIMULATION MODE
          </span>
          <span className="hidden sm:inline text-slate-300 text-xs">
            Physical hardware is not connected. Sensor and actuator data are simulated.
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Scenario:</span>
            <span className="font-semibold text-emerald-300 uppercase tracking-tight">
              {simulation.scenario.replace('_', ' ')}
            </span>
          </div>

          <Link
            to="/simulator"
            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md transition shadow-sm hover:shadow-emerald-500/20"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Open Simulator</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
