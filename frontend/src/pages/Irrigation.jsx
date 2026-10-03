import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Power,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Clock,
  ShieldCheck,
  TrendingDown,
  Layers,
  History,
  CloudRain
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { irrigationAPI } from '../services/api';

export default function Irrigation() {
  const { farm, sensorData, irrigation, showToast, refreshAll } = useFarm();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(sensorData.moisture_threshold || 35);

  const fetchHistory = async () => {
    try {
      const res = await irrigationAPI.getHistory(farm.id, 20);
      if (res.success && res.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch irrigation history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [farm.id]);

  const handleControlAction = async (action, extra = {}) => {
    setLoading(true);
    try {
      const res = await irrigationAPI.control(action, farm.id, extra);
      if (res.success) {
        showToast(res.message, 'success');
        await refreshAll();
        await fetchHistory();
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleThresholdSave = () => {
    handleControlAction('SET_THRESHOLD', { moisture_threshold: parseFloat(thresholdInput) });
  };

  return (
    <div className="space-y-6">
      {/* Title & Status Summary */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Droplets className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Smart Irrigation & Actuator Control
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous closed-loop valve and pump regulation driven by root-zone dielectric sensors and canopy stress.
          </p>
        </div>

        {/* High-Level Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleControlAction('TOGGLE_AUTO')}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
              irrigation.auto_irrigation
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>AUTO MODE: {irrigation.auto_irrigation ? 'ENABLED' : 'DISABLED'}</span>
          </button>

          {irrigation.pump_status === 'OFF' ? (
            <button
              onClick={() => handleControlAction('TURN_PUMP_ON')}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition flex items-center space-x-1.5 shadow-md shadow-amber-600/30"
            >
              <Power className="w-4 h-4" />
              <span>TURN PUMP ON</span>
            </button>
          ) : (
            <button
              onClick={() => handleControlAction('TURN_PUMP_OFF')}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center space-x-1.5 shadow-md shadow-rose-600/30 animate-pulse"
            >
              <Power className="w-4 h-4" />
              <span>TURN PUMP OFF</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Status Card & Water Animation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pump Visualizer Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Actuator Status</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              irrigation.pump_status === 'ON'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {irrigation.pump_status === 'ON' ? 'RUNNING' : 'STANDBY'}
            </span>
          </div>

          <div className="my-6 text-center">
            <div className={`relative inline-flex items-center justify-center w-28 h-28 rounded-full border-4 transition-all duration-300 ${
              irrigation.pump_status === 'ON'
                ? 'border-amber-500 bg-amber-500/10 shadow-2xl shadow-amber-500/40 animate-pulse'
                : 'border-slate-700 bg-slate-800/40 text-slate-500'
            }`}>
              <Power className={`w-12 h-12 ${irrigation.pump_status === 'ON' ? 'text-amber-400 animate-spin' : 'text-slate-600'}`} />
            </div>

            <div className="mt-4">
              <span className="text-2xl font-extrabold text-white">
                PUMP {irrigation.pump_status}
              </span>
              <p className="text-xs text-slate-400 mt-1">
                {irrigation.pump_status === 'ON'
                  ? 'Delivering ~25 L/min micro-irrigation manifold'
                  : 'Solenoid valve closed • Zero power draw'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>Water Saved (Autonomous Lock):</span>
            <span className="text-emerald-400 font-bold">~680 Liters</span>
          </div>
        </div>

        {/* AI Decision Breakdown */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Autonomous Decision Engine Diagnostics</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                Rule Set v2.4 Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Decision</span>
                <span className={`text-base font-bold ${
                  irrigation.decision === 'IRRIGATE' ? 'text-amber-400' :
                  irrigation.decision === 'PREVENT' ? 'text-sky-400' : 'text-emerald-400'
                }`}>{irrigation.decision}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Priority</span>
                <span className={`text-base font-bold ${
                  irrigation.priority === 'HIGH' ? 'text-rose-400' :
                  irrigation.priority === 'NORMAL' ? 'text-amber-400' : 'text-slate-300'
                }`}>{irrigation.priority}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Recommended</span>
                <span className="text-base font-bold text-white">
                  {irrigation.recommended_duration || 0} min
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Rain Override</span>
                <span className={`text-base font-bold ${sensorData.rainfall_detected ? 'text-sky-400' : 'text-slate-400'}`}>
                  {sensorData.rainfall_detected ? 'YES (Lock)' : 'NO'}
                </span>
              </div>
            </div>

            {/* Decision Reason Explanation Box */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-300">Rationale Formulation:</span>
              </div>
              <p className="text-slate-200 text-sm font-medium leading-relaxed">
                "{irrigation.reason}"
              </p>
            </div>
          </div>

          {/* Moisture Threshold Configuration Slider */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <span className="text-slate-400 whitespace-nowrap">Moisture Threshold:</span>
              <input
                type="range"
                min="15"
                max="60"
                step="1"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                className="w-36 accent-emerald-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-emerald-400 text-sm">{thresholdInput}%</span>
            </div>

            <button
              onClick={handleThresholdSave}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
            >
              Update Threshold
            </button>
          </div>
        </div>
      </div>

      {/* Historical Irrigation Events Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Irrigation Actuation History (MySQL Ledger)</h3>
          </div>
          <span className="text-xs text-slate-400">
            Total Logged Events: {history.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Pump Status</th>
                <th className="py-3 px-4">Soil Moisture</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Water Est.</th>
                <th className="py-3 px-4">Trigger Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-500">
                    No past irrigation events recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ev.decision === 'IRRIGATE' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        ev.decision === 'PREVENT' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {ev.decision}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {ev.pump_status}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      {ev.soil_moisture}%
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {ev.duration} min
                    </td>
                    <td className="py-3 px-4 text-emerald-300 font-mono">
                      ~{ev.water_used_liters || ev.duration * 25} L
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={ev.reason}>
                      {ev.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
