import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  ScanEye,
  Activity,
  Droplets,
  Bell,
  BarChart3,
  Cpu,
  SlidersHorizontal,
  Settings,
  ShieldCheck,
  Leaf
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function Sidebar() {
  const { unreadAlerts } = useFarm();

  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Farm Overview', to: '/farms', icon: Sprout },
    { name: 'Plant Health AI', to: '/plant-health', icon: ScanEye },
    { name: 'Live Sensors', to: '/sensors', icon: Activity },
    { name: 'Irrigation', to: '/irrigation', icon: Droplets },
    { name: 'Alerts', to: '/alerts', icon: Bell, badge: unreadAlerts },
    { name: 'Analytics', to: '/analytics', icon: BarChart3 },
    { name: 'Devices', to: '/devices', icon: Cpu },
    { name: 'Demo Simulator', to: '/simulator', icon: SlidersHorizontal, highlight: true },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Leaf className="w-5 h-5 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <span className="text-lg font-bold text-white tracking-tight flex items-center">
            PhytoPulse <span className="text-emerald-400 ml-1">AI</span>
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            SIH26180 • PYTHOPULSE
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `
                relative flex items-center px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150
                ${item.highlight 
                  ? (isActive 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30' 
                      : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40')
                  : (isActive 
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-semibold' 
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white')
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 mr-3 shrink-0 ${
                    item.highlight ? 'text-emerald-400' : (isActive ? 'text-emerald-400' : 'text-slate-400')
                  }`} />
                  <span className="flex-1 truncate">{item.name}</span>

                  {item.badge && item.badge > 0 ? (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}

                  {item.highlight && !isActive && (
                    <span className="text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded ml-2">
                      LIVE
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800 m-3 rounded-xl bg-slate-950/70 border border-slate-800/60 text-xs">
        <div className="flex items-center space-x-2 text-emerald-400 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-semibold text-[11px]">Autonomous Climate Loop</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          AI decision pipeline evaluating sensor telemetry & canopy health in real-time.
        </p>
      </div>
    </aside>
  );
}
