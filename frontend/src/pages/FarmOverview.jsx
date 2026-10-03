import React, { useState, useEffect } from 'react';
import {
  Sprout,
  MapPin,
  Layers,
  Droplets,
  Power,
  ScanEye,
  Calendar,
  Compass,
  Sun,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { farmAPI } from '../services/api';

export default function FarmOverview() {
  const { farm, sensorData, irrigation } = useFarm();
  const [farmData, setFarmData] = useState(null);

  useEffect(() => {
    farmAPI.getFarm(farm.id).then((res) => {
      if (res.success && res.data) {
        setFarmData(res.data);
      }
    });
  }, [farm.id]);

  const zones = [
    {
      id: 'Zone A',
      name: 'North Canopy Plot',
      crop: 'Tomato (Solanum lycopersicum)',
      area: '1.0 acre',
      irrigation_type: 'Precision Subsurface Drip',
      soil_moisture: sensorData.soil_moisture,
      plant_health: 92,
      pump_status: irrigation.pump_status,
      status: sensorData.moisture_status,
      soil_type: 'Red Sandy Loam (pH 6.5)',
    },
    {
      id: 'Zone B',
      name: 'Polyhouse Greenhouse',
      crop: 'Bell Pepper (Capsicum annuum)',
      area: '0.75 acre',
      irrigation_type: 'Micro-Sprinkler & Fogger',
      soil_moisture: 48.0,
      plant_health: 95,
      pump_status: 'OFF',
      status: 'Optimal',
      soil_type: 'Coco Peat Compost Blend',
    },
    {
      id: 'Zone C',
      name: 'South Agro-Orchard',
      crop: 'Citrus / Lime (Citrus aurantiifolia)',
      area: '0.75 acre',
      irrigation_type: 'Basin Bubbler Array',
      soil_moisture: 52.0,
      plant_health: 89,
      pump_status: 'OFF',
      status: 'Optimal',
      soil_type: 'Clay Loam with High Organic Matter',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Farm Profile Header Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 shrink-0">
              <Sprout className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {farm.farm_name}
                </h2>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  SIH26180 Pilot
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{farm.location}</span>
                </span>
                <span>•</span>
                <span>Primary Crop: <strong className="text-slate-200">{farm.crop_type}</strong></span>
                <span>•</span>
                <span>Total Area: <strong className="text-slate-200">{farm.area}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Microclimate</span>
              <span className="text-white font-bold">{sensorData.temperature}°C / {sensorData.humidity}% RH</span>
            </div>
            <div className="border-l border-slate-700 pl-3">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Rain State</span>
              <span className={`font-bold ${sensorData.rainfall_detected ? 'text-sky-400' : 'text-emerald-400'}`}>
                {sensorData.rainfall_detected ? 'Precipitation' : 'Dry & Clear'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Farm Plot Zones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Farm Irrigation Zones (Subdivided Micro-Plots)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Autonomous individual zoning available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {zones.map((zone) => (
            <div key={zone.id} className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    {zone.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    zone.pump_status === 'ON'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    VALVE {zone.pump_status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white">{zone.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{zone.crop}</p>

                <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Area & Infrastructure:</span>
                    <span className="text-white font-medium">{zone.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Irrigation Spec:</span>
                    <span className="text-emerald-400 font-medium">{zone.irrigation_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Soil Profile:</span>
                    <span className="text-slate-300 text-[11px] truncate max-w-[150px]">{zone.soil_type}</span>
                  </div>
                </div>
              </div>

              {/* Live Zone Metrics */}
              <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Soil Moisture</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {zone.soil_moisture}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">{zone.status}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Plant Health</span>
                  <span className="text-base font-extrabold text-white font-mono">
                    {zone.plant_health}%
                  </span>
                  <span className="text-[10px] text-emerald-400 block">AI Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
