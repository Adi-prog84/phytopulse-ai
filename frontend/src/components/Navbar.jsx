import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  MapPin, 
  LogOut, 
  User, 
  Users,
  ChevronDown, 
  Activity, 
  Cpu, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { alertAPI } from '../services/api';
import TeamModal from './TeamModal';


export default function Navbar() {
  const { user, logout } = useAuth();
  const { farm, unreadAlerts, refreshAll } = useFarm();
  const navigate = useNavigate();

  const [alertsDropdown, setAlertsDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [showTeamModal, setShowTeamModal] = useState(false);


  useEffect(() => {
    if (alertsDropdown) {
      alertAPI.getAlerts(farm.id, { limit: 5 })
        .then(res => {
          if (res.success && res.data) {
            setRecentAlerts(res.data.alerts);
          }
        })
        .catch(console.error);
    }
  }, [alertsDropdown, farm.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Farm Info & Status */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-semibold text-white tracking-tight">{farm.farm_name}</h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <div className="flex items-center text-xs text-slate-400 space-x-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>{farm.location} • {farm.crop_type}</span>
            </div>
          </div>
        </div>

        {/* Center: SENSE -> ANALYZE -> DECIDE -> ACT Architecture Indicator */}
        <div className="hidden xl:flex items-center space-x-1.5 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800 text-[11px] font-mono text-slate-300">
          <span className="text-emerald-400 font-semibold">SENSE</span>
          <span className="text-slate-600">→</span>
          <span className="text-teal-400 font-semibold">ANALYZE</span>
          <span className="text-slate-600">→</span>
          <span className="text-sky-400 font-semibold">DECIDE</span>
          <span className="text-slate-600">→</span>
          <span className="text-amber-400 font-semibold">ACT</span>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-3">
          {/* Simulation Status Pill */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs text-slate-300 font-medium">Virtual Core Online</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setAlertsDropdown(!alertsDropdown);
                setUserDropdown(false);
              }}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Alert Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md shadow-rose-500/30">
                  {unreadAlerts}
                </span>
              )}
            </button>

            {alertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">System Alerts</span>
                  </div>
                  <Link 
                    to="/alerts" 
                    onClick={() => setAlertsDropdown(false)}
                    className="text-xs text-emerald-400 hover:underline flex items-center"
                  >
                    View All <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </div>

                <div className="mt-2 divide-y divide-slate-800 max-h-72 overflow-y-auto">
                  {recentAlerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No active alerts. All conditions normal.
                    </div>
                  ) : (
                    recentAlerts.map(alert => (
                      <div key={alert.id} className="py-2.5 px-1 hover:bg-slate-800/40 rounded transition">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            alert.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            alert.severity === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                            'bg-sky-950 text-sky-400 border border-sky-800'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 mt-1">{alert.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setUserDropdown(!userDropdown);
                setAlertsDropdown(false);
              }}
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                {user?.name ? user.name.charAt(0) : 'A'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-medium text-slate-200">{user?.name || 'Dr. Adithya V'}</div>
                <div className="text-[10px] text-emerald-400">{user?.role || 'Lead Agri-Technologist'}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {userDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-2 text-xs">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <div className="font-semibold text-slate-200">{user?.name}</div>
                  <div className="text-slate-400 text-[11px] truncate">{user?.email}</div>
                  <div className="mt-1 text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded inline-block">
                    SIH 2026 Team: PYTHOPULSE
                  </div>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setUserDropdown(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Account & Farm Settings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
