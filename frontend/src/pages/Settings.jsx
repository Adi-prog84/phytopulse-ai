import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Save,
  Sliders,
  Sprout,
  User,
  CheckCircle2,
  Lock,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { settingsAPI, farmAPI } from '../services/api';

export default function Settings() {
  const { user } = useAuth();
  const { farm, showToast, refreshAll } = useFarm();

  const [settings, setSettings] = useState({
    moisture_threshold: 35.0,
    auto_irrigation: true,
    simulation_mode: true,
  });

  const [farmForm, setFarmForm] = useState({
    farm_name: '',
    location: '',
    area: '',
    crop_type: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    settingsAPI.getSettings(farm.id).then((res) => {
      if (res.success && res.data) {
        setSettings(res.data);
      }
    });

    if (farm) {
      setFarmForm({
        farm_name: farm.farm_name || '',
        location: farm.location || '',
        area: farm.area || '',
        crop_type: farm.crop_type || '',
      });
    }
  }, [farm]);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await settingsAPI.updateSettings({
        farm_id: farm.id,
        moisture_threshold: parseFloat(settings.moisture_threshold),
        auto_irrigation: settings.auto_irrigation,
        simulation_mode: settings.simulation_mode,
      });
      if (res.success) {
        showToast('Autonomous system thresholds updated', 'success');
        await refreshAll();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFarmSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await farmAPI.updateFarm(farm.id, farmForm);
      if (res.success) {
        showToast('Farm plot metadata updated', 'success');
        await refreshAll();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update farm details', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
            <SettingsIcon className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              System Settings & Operational Thresholds
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Fine-tune decision engine parameters, automated watering thresholds, and farm plot profiles.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decision Engine & Simulation Settings */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Autonomous Engine Parameters
            </h3>
          </div>

          <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Root-Zone Moisture Cutoff Threshold ({settings.moisture_threshold}%)
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                When soil moisture drops below this value, autonomous pump actuation triggers unless rain is detected.
              </p>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="15"
                  max="65"
                  step="1"
                  value={settings.moisture_threshold}
                  onChange={(e) => setSettings({ ...settings, moisture_threshold: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="font-mono font-bold text-emerald-400 text-sm">{settings.moisture_threshold}%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-semibold text-white block">Autonomous Irrigation Engine</span>
                  <span className="text-[11px] text-slate-400">
                    Allows backend decision engine to execute pump cycles autonomously.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.auto_irrigation}
                  onChange={(e) => setSettings({ ...settings, auto_irrigation: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-semibold text-white block">Virtual Simulation Mode</span>
                  <span className="text-[11px] text-slate-400">
                    Denotes software simulation of hardware nodes during testing.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.simulation_mode}
                  onChange={(e) => setSettings({ ...settings, simulation_mode: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-1.5 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>Save Autonomous Parameters</span>
            </button>
          </form>
        </div>

        {/* Farm Metadata Settings */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-4">
            <Sprout className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Farm Profile & Agronomic Identity
            </h3>
          </div>

          <form onSubmit={handleFarmSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Farm Name</label>
              <input
                type="text"
                value={farmForm.farm_name}
                onChange={(e) => setFarmForm({ ...farmForm, farm_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Geographic Location</label>
              <input
                type="text"
                value={farmForm.location}
                onChange={(e) => setFarmForm({ ...farmForm, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Crop Type / Variety</label>
                <input
                  type="text"
                  value={farmForm.crop_type}
                  onChange={(e) => setFarmForm({ ...farmForm, crop_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Total Cultivated Area</label>
                <input
                  type="text"
                  value={farmForm.area}
                  onChange={(e) => setFarmForm({ ...farmForm, area: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold transition shadow-md shadow-teal-600/30 flex items-center justify-center space-x-1.5 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>Update Farm Profile</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
