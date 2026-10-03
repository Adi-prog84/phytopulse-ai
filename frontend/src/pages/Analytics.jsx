import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Droplets,
  Thermometer,
  Sprout,
  Activity,
  Zap,
  TrendingDown,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { useFarm } from '../context/FarmContext';
import { analyticsAPI } from '../services/api';

export default function Analytics() {
  const { farm } = useFarm();
  const [timeRange, setTimeRange] = useState('7d');
  const [summary, setSummary] = useState({
    avg_soil_moisture: 51.4,
    avg_temperature: 27.2,
    avg_humidity: 65.5,
    avg_plant_health: 91.0,
    total_irrigation_events: 14,
    estimated_water_usage_liters: 350,
    estimated_water_saved_liters: 1225,
    total_alerts: 8,
  });

  const [moistureData, setMoistureData] = useState([]);
  const [environmentData, setEnvironmentData] = useState([]);
  const [plantHealthData, setPlantHealthData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [sumRes, moistRes, envRes, phRes] = await Promise.all([
          analyticsAPI.getSummary(farm.id, timeRange),
          analyticsAPI.getSoilMoistureTrend(farm.id, timeRange),
          analyticsAPI.getEnvironmentTrend(farm.id, timeRange),
          analyticsAPI.getPlantHealthTrend(farm.id),
        ]);

        if (sumRes.success && sumRes.data) setSummary(sumRes.data);
        if (moistRes.success && moistRes.data) setMoistureData(moistRes.data);
        if (envRes.success && envRes.data) setEnvironmentData(envRes.data);
        if (phRes.success && phRes.data) setPlantHealthData(phRes.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [farm.id, timeRange]);

  return (
    <div className="space-y-6">
      {/* Title & Range Filter */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Agronomic Analytics & Water Efficiency
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical environmental patterns, water conservation metrics, and AI health trajectories.
          </p>
        </div>

        {/* Time Filters: Today, 7 Days, 30 Days */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <Calendar className="w-4 h-4 text-slate-500 ml-2" />
          {[
            { label: 'Today', value: 'today' },
            { label: '7 Days', value: '7d' },
            { label: '30 Days', value: '30d' },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTimeRange(t.value)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                timeRange === t.value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Avg Moisture"
          value={`${summary.avg_soil_moisture}`}
          unit="%"
          status="Optimal Mean"
          statusType="success"
          icon={Droplets}
        />
        <MetricCard
          title="Avg Temp"
          value={`${summary.avg_temperature}`}
          unit="°C"
          status="Climate Mean"
          statusType="info"
          icon={Thermometer}
        />
        <MetricCard
          title="Avg Health"
          value={`${summary.avg_plant_health}`}
          unit="%"
          status="Canopy Health"
          statusType="success"
          icon={Sprout}
        />
        <MetricCard
          title="Irrigations"
          value={`${summary.total_irrigation_events}`}
          unit="cycles"
          status="Automated"
          statusType="neutral"
          icon={Zap}
        />
        <MetricCard
          title="Water Used"
          value={`${summary.estimated_water_usage_liters}`}
          unit="L"
          status="Micro-Drip"
          statusType="neutral"
          icon={Droplets}
        />
        <MetricCard
          title="Water Saved"
          value={`${summary.estimated_water_saved_liters}`}
          unit="L"
          status="vs Flood Irrig."
          statusType="success"
          icon={TrendingDown}
        />
      </div>

      {/* Grid of 4 Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Soil Moisture Trend */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Soil Moisture Trend Over Time</h3>
              <p className="text-xs text-slate-400">Mean root-zone dielectric hydration levels</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-semibold">Mean: {summary.avg_soil_moisture}%</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moistureData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="moistTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="soil_moisture" stroke="#10b981" strokeWidth={2} fill="url(#moistTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Microclimate: Temp & Humidity */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Climate Trajectory (Temp & Humidity)</h3>
              <p className="text-xs text-slate-400">Atmospheric microclimate parameters</p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-sky-400 font-semibold">• Temp</span>
              <span className="text-teal-400 font-semibold">• Humidity</span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={environmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[10, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="temperature" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="humidity" stroke="#14b8a6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Plant Health AI Scores */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Canopy Health AI Trajectory</h3>
              <p className="text-xs text-slate-400">Sequential vision model pathology scores (0-100%)</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-semibold">Current: 92%</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={plantHealthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="phTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="health_score" stroke="#14b8a6" strokeWidth={2} fill="url(#phTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Water Savings Comparison */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Water Conservation Impact (Liters)</h3>
              <p className="text-xs text-slate-400">PhytoPulse AI Precision Drip vs Conventional Flood</p>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
              78% Conservation Ratio
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Conventional Flood', liters: 1575 },
                  { name: 'PhytoPulse AI Precision', liters: summary.estimated_water_usage_liters || 350 },
                  { name: 'Conserved Water', liters: summary.estimated_water_saved_liters || 1225 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="liters" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
