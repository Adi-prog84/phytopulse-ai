import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Droplets,
  Thermometer,
  CloudRain,
  Activity,
  Power,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  ReferenceLine
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { useFarm } from '../context/FarmContext';
import { sensorAPI, plantHealthAPI, alertAPI } from '../services/api';

export default function Dashboard() {
  const { farm, sensorData, irrigation, applyScenario } = useFarm();
  const [history, setHistory] = useState([]);
  const [latestHealth, setLatestHealth] = useState({
    health_score: 92,
    health_status: 'Healthy',
    stress_level: 'Low',
    confidence: 91.5,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [histRes, healthRes, alertRes] = await Promise.all([
          sensorAPI.getHistory(farm.id, 15),
          plantHealthAPI.getHistory(farm.id, 1),
          alertAPI.getAlerts(farm.id, { limit: 4 }),
        ]);

        if (histRes.success && histRes.data) {
          setHistory(histRes.data);
        }
        if (healthRes.success && healthRes.data?.length > 0) {
          setLatestHealth(healthRes.data[0]);
        }
        if (alertRes.success && alertRes.data) {
          setRecentAlerts(alertRes.data.alerts);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 4000);
    return () => clearInterval(interval);
  }, [farm.id]);

  return (
    <div className="space-y-6">
      {/* Welcome & Scenario Quick Bar */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              PhytoPulse AI Control Center
            </h2>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Autonomous
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time closed-loop agricultural intelligence for <span className="text-slate-200 font-semibold">{farm.farm_name}</span> ({farm.crop_type})
          </p>
        </div>

        {/* Quick Demo Scenarios Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Quick Scenarios:</span>
          <button
            onClick={() => applyScenario('healthy')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/40 text-xs text-slate-200 hover:text-emerald-300 font-medium transition"
          >
            🌱 Healthy
          </button>
          <button
            onClick={() => applyScenario('dry_soil')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-950/80 border border-amber-500/40 text-xs text-amber-300 font-medium transition"
          >
            🏜️ Dry Soil (Pump ON)
          </button>
          <button
            onClick={() => applyScenario('rain_detected')}
            className="px-2.5 py-1.5 rounded-lg bg-sky-950/40 hover:bg-sky-950/80 border border-sky-500/40 text-xs text-sky-300 font-medium transition"
          >
            🌧️ Rain Detected
          </button>
          <Link
            to="/simulator"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold transition flex items-center space-x-1 shadow-md shadow-emerald-600/20"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>All 5 Scenarios</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards (6 Core Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Plant Health */}
        <MetricCard
          title="Plant Health"
          value={`${latestHealth.health_score || 92}%`}
          status={latestHealth.health_status || 'Healthy'}
          statusType={
            (latestHealth.health_score || 92) > 85 ? 'success' :
            (latestHealth.health_score || 92) > 65 ? 'warning' : 'danger'
          }
          icon={Sprout}
          trend={`${latestHealth.confidence || 91.5}% Conf.`}
          trendDirection="up"
        />

        {/* Soil Moisture */}
        <MetricCard
          title="Soil Moisture"
          value={`${sensorData.soil_moisture}`}
          unit="%"
          status={sensorData.moisture_status}
          statusType={
            sensorData.soil_moisture < 20 ? 'danger' :
            sensorData.soil_moisture < 35 ? 'warning' : 'success'
          }
          icon={Droplets}
          trend={`Threshold: ${sensorData.moisture_threshold}%`}
          trendDirection={sensorData.soil_moisture < 35 ? 'down' : 'up'}
        />

        {/* Temperature */}
        <MetricCard
          title="Temperature"
          value={`${sensorData.temperature}`}
          unit="°C"
          status={sensorData.temperature_status}
          statusType={sensorData.temperature >= 38 ? 'danger' : sensorData.temperature >= 32 ? 'warning' : 'info'}
          icon={Thermometer}
          trend="Ambient"
        />

        {/* Humidity */}
        <MetricCard
          title="Humidity"
          value={`${sensorData.humidity}`}
          unit="%"
          status={sensorData.humidity_status}
          statusType={sensorData.humidity >= 80 ? 'info' : 'success'}
          icon={Activity}
          trend="Relative"
        />

        {/* Rain Detection */}
        <MetricCard
          title="Rainfall"
          value={sensorData.rainfall_detected ? 'Detected' : 'No Rain'}
          status={sensorData.rainfall_detected ? 'Rain Override Active' : 'Clear Sky'}
          statusType={sensorData.rainfall_detected ? 'info' : 'success'}
          icon={CloudRain}
          trend={sensorData.rainfall_detected ? 'Precipitation' : 'Dry'}
        />

        {/* Irrigation Pump */}
        <MetricCard
          title="Pump Status"
          value={irrigation.pump_status}
          status={irrigation.pump_status === 'ON' ? 'Actively Irrigating' : 'Standby'}
          statusType={irrigation.pump_status === 'ON' ? 'warning' : 'neutral'}
          icon={Power}
          trend={irrigation.auto_irrigation ? 'Auto Mode' : 'Manual'}
          trendDirection={irrigation.pump_status === 'ON' ? 'up' : 'neutral'}
        />
      </div>

      {/* SENSE -> ANALYZE -> DECIDE -> ACT Architecture Pipeline Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Autonomous Intelligence Loop: Sense → Analyze → Decide → Act
            </h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30">
            Latency: &lt; 85ms
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* 1. SENSE */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 relative">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-2">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                1. SENSE
              </span>
              <span className="text-[10px] text-slate-500 font-mono">IoT Telemetry</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1 font-mono">
              <div>Moisture: <span className="text-white font-bold">{sensorData.soil_moisture}%</span></div>
              <div>Climate: <span className="text-white">{sensorData.temperature}°C / {sensorData.humidity}%</span></div>
              <div>Rain: <span className={sensorData.rainfall_detected ? 'text-sky-400 font-bold' : 'text-slate-400'}>
                {sensorData.rainfall_detected ? 'DETECTED' : 'None'}
              </span></div>
            </div>
          </div>

          {/* 2. ANALYZE */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 relative">
            <div className="flex items-center justify-between text-xs text-teal-400 font-bold mb-2">
              <span>2. ANALYZE</span>
              <span className="text-[10px] text-slate-500 font-mono">Canopy AI</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1 font-mono">
              <div>Score: <span className="text-white font-bold">{latestHealth.health_score || 92}%</span></div>
              <div>Stress Level: <span className={`font-semibold ${
                latestHealth.stress_level === 'High' || latestHealth.stress_level === 'Critical' ? 'text-rose-400' :
                latestHealth.stress_level === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
              }`}>{latestHealth.stress_level || 'Low'}</span></div>
              <div className="truncate text-slate-400">{latestHealth.detected_issue || 'Optimal Turgor'}</div>
            </div>
          </div>

          {/* 3. DECIDE */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 relative">
            <div className="flex items-center justify-between text-xs text-sky-400 font-bold mb-2">
              <span>3. DECIDE</span>
              <span className="text-[10px] text-slate-500 font-mono">Inference Engine</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1 font-mono">
              <div>Action: <span className={`font-bold ${
                irrigation.decision === 'IRRIGATE' ? 'text-amber-400' :
                irrigation.decision === 'PREVENT' ? 'text-sky-400' : 'text-emerald-400'
              }`}>{irrigation.decision}</span></div>
              <div>Priority: <span className="text-white">{irrigation.priority}</span></div>
              <div className="truncate text-slate-400 text-[11px]" title={irrigation.reason}>
                {irrigation.reason}
              </div>
            </div>
          </div>

          {/* 4. ACT */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 relative">
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-2">
              <span>4. ACT</span>
              <span className="text-[10px] text-slate-500 font-mono">Relay & Pump</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1 font-mono">
              <div>Pump: <span className={`font-bold ${
                irrigation.pump_status === 'ON' ? 'text-amber-400 animate-pulse' : 'text-slate-400'
              }`}>{irrigation.pump_status}</span></div>
              <div>Duration: <span className="text-white">{irrigation.recommended_duration || 0} mins</span></div>
              <div>Water Saved: <span className="text-emerald-400 font-bold">~680 L</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Live Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Soil Moisture Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Live Soil Moisture Dynamic</h3>
                <p className="text-xs text-slate-400">Continuous capacitive sensor telemetry with threshold line</p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span>Moisture (%)</span>
                </span>
                <span className="flex items-center space-x-1 text-amber-400 font-medium">
                  <span className="w-2.5 h-0.5 bg-amber-400"></span>
                  <span>Threshold (35%)</span>
                </span>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time_formatted" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="soil_moisture" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#moistureGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Temperature & Humidity Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Microclimate Profile</h3>
                <p className="text-xs text-slate-400">Ambient temperature (°C) and relative humidity (%)</p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1 text-sky-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                  <span>Temp (°C)</span>
                </span>
                <span className="flex items-center space-x-1 text-teal-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                  <span>Humidity (%)</span>
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time_formatted" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[10, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="temperature" stroke="#38bdf8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="humidity" stroke="#14b8a6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Irrigation Decision Engine & Alerts */}
        <div className="space-y-6">
          {/* Decision Engine Summary Box */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Power className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Irrigation Engine</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                irrigation.pump_status === 'ON' ? 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse' :
                'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                PUMP {irrigation.pump_status}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Decision Logic:</span>
                <p className="text-slate-200 font-medium leading-relaxed">
                  {irrigation.reason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Priority Level</span>
                  <span className={`font-bold ${
                    irrigation.priority === 'HIGH' ? 'text-rose-400' :
                    irrigation.priority === 'NORMAL' ? 'text-amber-400' : 'text-slate-300'
                  }`}>{irrigation.priority}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Recommended Run</span>
                  <span className="font-bold text-white">{irrigation.recommended_duration || 0} minutes</span>
                </div>
              </div>

              <Link
                to="/irrigation"
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition text-xs border border-slate-700 mt-2"
              >
                <span>Full Irrigation Controls</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Recent Alerts Feed */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Live Alert Log</h3>
              </div>
              <Link to="/alerts" className="text-xs text-emerald-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentAlerts.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No critical alerts reported.
                </div>
              ) : (
                recentAlerts.map(alert => (
                  <div key={alert.id} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        alert.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        alert.severity === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-sky-950 text-sky-300 border border-sky-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-snug">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
