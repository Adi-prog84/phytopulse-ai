import React, { useState, useEffect } from 'react';
import {
  Activity,
  Droplets,
  Thermometer,
  CloudRain,
  Radio,
  Clock,
  RefreshCw,
  Gauge,
  TrendingUp,
  Cpu
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { useFarm } from '../context/FarmContext';
import { sensorAPI } from '../services/api';

export default function LiveSensors() {
  const { farm, sensorData, refreshAll } = useFarm();
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await sensorAPI.getHistory(farm.id, 25);
      if (res.success && res.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('Error fetching sensor history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 3500);
    return () => clearInterval(interval);
  }, [farm.id]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    await fetchHistory();
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Activity className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Live Sensor Telemetry Bus
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time digital sampling from field microcontroller bus (ESP32-S3 virtual pipeline).
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Updated:</span>
            <span className="text-white font-mono">{sensorData.timestamp ? new Date(sensorData.timestamp).toLocaleTimeString() : 'Just now'}</span>
          </div>

          <button
            onClick={handleManualRefresh}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Poll</span>
          </button>
        </div>
      </div>

      {/* 4 Sensor Cards with Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Soil Moisture */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Soil Moisture</span>
            <Droplets className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mb-1 font-mono">
            {sensorData.soil_moisture}%
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-emerald-400 font-semibold">{sensorData.moisture_status}</span>
            <span className="text-slate-400">Cutoff: {sensorData.moisture_threshold}%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                sensorData.soil_moisture < 20 ? 'bg-rose-500' :
                sensorData.soil_moisture < 35 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, sensorData.soil_moisture))}%` }}
            ></div>
          </div>
        </div>

        {/* Temperature */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Temperature</span>
            <Thermometer className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mb-1 font-mono">
            {sensorData.temperature}°C
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-sky-400 font-semibold">{sensorData.temperature_status}</span>
            <span className="text-slate-400">DHT22 Ambient</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-sky-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (sensorData.temperature / 45) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Humidity */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Relative Humidity</span>
            <Activity className="w-5 h-5 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mb-1 font-mono">
            {sensorData.humidity}%
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-teal-400 font-semibold">{sensorData.humidity_status}</span>
            <span className="text-slate-400">Optimal Range</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, sensorData.humidity))}%` }}
            ></div>
          </div>
        </div>

        {/* Rain Sensor */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Precipitation</span>
            <CloudRain className={`w-5 h-5 ${sensorData.rainfall_detected ? 'text-sky-400 animate-bounce' : 'text-slate-500'}`} />
          </div>
          <div className="text-2xl font-extrabold text-white mb-1">
            {sensorData.rainfall_detected ? 'Rain Detected' : 'No Rain'}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className={`font-semibold ${sensorData.rainfall_detected ? 'text-sky-400' : 'text-slate-400'}`}>
              {sensorData.rainfall_detected ? 'Override Active' : 'Normal Standby'}
            </span>
            <span className="text-slate-400">LM393 Array</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${sensorData.rainfall_detected ? 'bg-sky-400 w-full' : 'bg-slate-700 w-0'}`}
            ></div>
          </div>
        </div>
      </div>

      {/* Real-time Charts */}
      <div className="space-y-6">
        {/* Soil Moisture Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Soil Moisture Stream (%)</h3>
              <p className="text-xs text-slate-400">Capacitive dielectric sensor readings over time</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-emerald-400 font-semibold">• Live Moisture</span>
              <span className="text-amber-400 font-semibold">--- Trigger Threshold (35%)</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="liveMoistGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time_formatted" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="soil_moisture" stroke="#10b981" strokeWidth={2.5} fill="url(#liveMoistGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Climate Dual Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Temperature & Humidity Dynamics</h3>
              <p className="text-xs text-slate-400">Ambient temperature (°C) vs relative humidity (%)</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-sky-400 font-semibold">• Temperature (°C)</span>
              <span className="text-teal-400 font-semibold">• Humidity (%)</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="time_formatted" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[10, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="temperature" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="humidity" stroke="#14b8a6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
