import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  CloudRain,
  Thermometer,
  Sprout,
  Activity,
  Power,
  Zap,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { simulationAPI } from '../services/api';

export default function DemoSimulator() {
  const { farm, sensorData, irrigation, applyScenario, showToast, refreshAll } = useFarm();

  const [simStatus, setSimStatus] = useState({
    is_running: true,
    interval_seconds: 4,
  });

  const [customValues, setCustomValues] = useState({
    soil_moisture: 55,
    temperature: 27,
    humidity: 68,
    rain_detected: false,
    plant_health: 92,
  });

  const [activeScenarioName, setActiveScenarioName] = useState('healthy');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    simulationAPI.getStatus().then((res) => {
      if (res.success && res.data) {
        setSimStatus({
          is_running: res.data.is_running,
          interval_seconds: res.data.interval_seconds,
        });
        if (res.data.current_state?.scenario) {
          setActiveScenarioName(res.data.current_state.scenario);
        }
      }
    });
  }, []);

  const handleScenarioClick = async (scenarioKey) => {
    setLoading(true);
    setActiveScenarioName(scenarioKey);
    const ok = await applyScenario(scenarioKey);
    setLoading(false);
  };

  const handleStartSim = async () => {
    try {
      const res = await simulationAPI.start();
      if (res.success) {
        setSimStatus((prev) => ({ ...prev, is_running: true }));
        showToast('Background simulation started', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStopSim = async () => {
    try {
      const res = await simulationAPI.stop();
      if (res.success) {
        setSimStatus((prev) => ({ ...prev, is_running: false }));
        showToast('Background simulation paused', 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleResetSim = async () => {
    try {
      const res = await simulationAPI.reset();
      if (res.success) {
        setActiveScenarioName('healthy');
        setCustomValues({
          soil_moisture: 55,
          temperature: 27,
          humidity: 68,
          rain_detected: false,
          plant_health: 92,
        });
        showToast('Simulation reset to Healthy Field baseline', 'success');
        refreshAll();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCustomApply = async () => {
    setLoading(true);
    try {
      const res = await simulationAPI.setCustom(customValues);
      if (res.success) {
        setActiveScenarioName('custom');
        showToast('Custom telemetry values injected into Decision Engine', 'success');
        refreshAll();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const scenarios = [
    {
      key: 'healthy',
      title: '🌱 HEALTHY FIELD',
      subtitle: 'Standard optimal conditions',
      values: 'Moisture: 55% • Temp: 27°C • Humidity: 68% • Rain: No • Health: 92%',
      expected: 'Pump OFF • Status: Healthy • Autonomous standby',
      color: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/30',
      activeColor: 'ring-2 ring-emerald-500 bg-emerald-950/70 border-emerald-500',
    },
    {
      key: 'dry_soil',
      title: '🏜️ DRY SOIL',
      subtitle: 'Sub-threshold moisture trigger',
      values: 'Moisture: 15% • Temp: 31°C • Humidity: 52% • Rain: No • Health: 75%',
      expected: 'Irrigation REQUIRED • Pump ON • Priority: HIGH • Warning alert',
      color: 'border-amber-500/40 hover:border-amber-400 bg-amber-950/30',
      activeColor: 'ring-2 ring-amber-500 bg-amber-950/70 border-amber-500',
    },
    {
      key: 'rain_detected',
      title: '🌧️ RAIN DETECTED',
      subtitle: 'Water conservation safety lock',
      values: 'Moisture: 35% • Temp: 25°C • Humidity: 85% • Rain: TRUE • Health: 88%',
      expected: 'Pump OFF • Reason: "Rain detected — irrigation prevented." • Info alert',
      color: 'border-sky-500/40 hover:border-sky-400 bg-sky-950/30',
      activeColor: 'ring-2 ring-sky-500 bg-sky-950/70 border-sky-500',
    },
    {
      key: 'plant_stress',
      title: '🍂 PLANT STRESS',
      subtitle: 'Canopy AI deficit & moderate moisture loss',
      values: 'Moisture: 25% • Temp: 33°C • Humidity: 45% • Rain: No • Health: 52%',
      expected: 'Stress: HIGH • Priority: HIGH • Urgent alert & agronomic recommendation',
      color: 'border-rose-500/40 hover:border-rose-400 bg-rose-950/30',
      activeColor: 'ring-2 ring-rose-500 bg-rose-950/70 border-rose-500',
    },
    {
      key: 'extreme_heat',
      title: '🌡️ EXTREME HEAT',
      subtitle: 'Climate shock & accelerated evaporation',
      values: 'Moisture: 28% • Temp: 39°C • Humidity: 35% • Rain: No • Health: 68%',
      expected: 'Heat warning alert • Elevated irrigation priority • Anti-shock protection',
      color: 'border-orange-500/40 hover:border-orange-400 bg-orange-950/30',
      activeColor: 'ring-2 ring-orange-500 bg-orange-950/70 border-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Simulation Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <SlidersHorizontal className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                PhytoPulse AI Demo Simulator
              </h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                simStatus.is_running 
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${simStatus.is_running ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                {simStatus.is_running ? 'Simulation Active' : 'Simulation Paused'}
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 font-medium mt-2 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/20 inline-block">
              ⚠️ No physical hardware connected. Sensor and actuator data are simulated for demonstration.
            </p>
          </div>

          {/* Engine Controls: START, PAUSE, RESET */}
          <div className="flex items-center space-x-2">
            {simStatus.is_running ? (
              <button
                onClick={handleStopSim}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
              >
                <Pause className="w-4 h-4 text-amber-400" />
                <span>PAUSE SIMULATION</span>
              </button>
            ) : (
              <button
                onClick={handleStartSim}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/30"
              >
                <Play className="w-4 h-4" />
                <span>START SIMULATION</span>
              </button>
            )}

            <button
              onClick={handleResetSim}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
              title="Reset baseline values"
            >
              <RotateCcw className="w-4 h-4 text-sky-400" />
              <span>RESET</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 CANONICAL SIH DEMO SCENARIOS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Hackathon Demonstration Scenarios (Click to Trigger Live State)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Clicking a scenario immediately routes telemetry into backend MySQL & Decision Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((sc) => {
            const isActive = activeScenarioName === sc.key;
            return (
              <button
                key={sc.key}
                type="button"
                onClick={() => handleScenarioClick(sc.key)}
                disabled={loading}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                  isActive ? sc.activeColor : sc.color
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white tracking-tight">{sc.title}</span>
                  {isActive && (
                    <span className="text-[10px] uppercase font-bold bg-white text-slate-900 px-2 py-0.5 rounded-full">
                      ACTIVE STATE
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 font-medium mb-3">{sc.subtitle}</p>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-300 mb-2">
                  {sc.values}
                </div>

                <div className="text-[11px] text-slate-400 font-sans">
                  <span className="text-emerald-400 font-semibold">Expected: </span>
                  {sc.expected}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SENSE -> ANALYZE -> DECIDE -> ACT LIVE REACTION INSPECTOR */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Decision Engine Live Reaction Stream
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">Current Pump Actuator:</span>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              irrigation.pump_status === 'ON' 
                ? 'bg-amber-950 text-amber-300 border border-amber-500/50 animate-pulse'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {irrigation.pump_status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
              Input Sensor Readings
            </div>
            <div className="text-xs text-slate-200 font-mono space-y-1">
              <div>Soil Moisture: <span className="font-bold text-white">{sensorData.soil_moisture}%</span></div>
              <div>Ambient Temp: <span className="font-bold text-white">{sensorData.temperature}°C</span></div>
              <div>Relative Hum: <span className="font-bold text-white">{sensorData.humidity}%</span></div>
              <div>Rainfall Flag: <span className={sensorData.rainfall_detected ? 'text-sky-400 font-bold' : 'text-slate-400'}>
                {sensorData.rainfall_detected ? 'TRUE (Rain)' : 'FALSE (No Rain)'}
              </span></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
              Canopy & Soil Status
            </div>
            <div className="text-xs text-slate-200 font-mono space-y-1">
              <div>Moisture Status: <span className="text-emerald-400 font-bold">{sensorData.moisture_status}</span></div>
              <div>Threshold: <span className="text-amber-400">{sensorData.moisture_threshold}%</span></div>
              <div>Climate: <span className="text-white">{sensorData.temperature_status}</span></div>
              <div>Rain State: <span className="text-sky-400">{sensorData.rain_status}</span></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
              Decision Reasoning
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              "{irrigation.reason}"
            </p>
            <div className="mt-2 text-[11px] text-slate-400">
              Priority: <span className="font-bold text-white">{irrigation.priority}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
              Actuator Action
            </div>
            <div className="text-xs text-slate-200 font-mono space-y-1">
              <div>Decision: <span className="font-bold text-emerald-400">{irrigation.decision}</span></div>
              <div>Pump: <span className={`font-bold ${irrigation.pump_status === 'ON' ? 'text-amber-400' : 'text-slate-400'}`}>
                {irrigation.pump_status}
              </span></div>
              <div>Run Duration: <span className="font-bold text-white">{irrigation.recommended_duration || 0} mins</span></div>
              <div>Auto Mode: <span className="text-emerald-400">{irrigation.auto_irrigation ? 'ENABLED' : 'DISABLED'}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* MANUAL CUSTOM SLIDERS OVERRIDE */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Manual Custom Telemetry Injection (Fine-Tune Variables)
            </h3>
          </div>
          <button
            onClick={handleCustomApply}
            disabled={loading}
            className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition shadow-md shadow-teal-600/30"
          >
            Apply Custom Values
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Soil Moisture */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 mb-2">
              <span className="font-medium">Soil Moisture</span>
              <span className="font-bold text-emerald-400">{customValues.soil_moisture}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              step="1"
              value={customValues.soil_moisture}
              onChange={(e) => setCustomValues({ ...customValues, soil_moisture: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Dry (5%)</span>
              <span>Wet (95%)</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 mb-2">
              <span className="font-medium">Temperature</span>
              <span className="font-bold text-sky-400">{customValues.temperature}°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="0.5"
              value={customValues.temperature}
              onChange={(e) => setCustomValues({ ...customValues, temperature: parseFloat(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Cool (15°C)</span>
              <span>Hot (45°C)</span>
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 mb-2">
              <span className="font-medium">Humidity</span>
              <span className="font-bold text-teal-400">{customValues.humidity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              step="1"
              value={customValues.humidity}
              onChange={(e) => setCustomValues({ ...customValues, humidity: parseFloat(e.target.value) })}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Low (20%)</span>
              <span>Humid (95%)</span>
            </div>
          </div>

          {/* Plant Health */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 mb-2">
              <span className="font-medium">Plant Health AI</span>
              <span className="font-bold text-emerald-400">{customValues.plant_health}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="1"
              value={customValues.plant_health}
              onChange={(e) => setCustomValues({ ...customValues, plant_health: parseInt(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Stress (20%)</span>
              <span>Healthy (100%)</span>
            </div>
          </div>

          {/* Rain Sensor Toggle */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between text-xs text-slate-300 mb-2">
              <span className="font-medium">Rain Sensor</span>
              <span className={`font-bold ${customValues.rain_detected ? 'text-sky-400' : 'text-slate-400'}`}>
                {customValues.rain_detected ? 'RAINING' : 'NO RAIN'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCustomValues({ ...customValues, rain_detected: !customValues.rain_detected })}
              className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                customValues.rain_detected
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CloudRain className="w-4 h-4" />
              <span>Toggle Rain State</span>
            </button>
            <span className="text-[10px] text-slate-500 text-center mt-1">
              Precipitation detector override
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
