import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Trash2,
  CheckCheck,
  Filter,
  ShieldAlert
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { alertAPI } from '../services/api';

export default function Alerts() {
  const { farm, showToast, refreshAll } = useFarm();
  const [alerts, setAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const options = {};
      if (filterSeverity !== 'ALL') {
        options.severity = filterSeverity;
      }
      if (unreadOnly) {
        options.unread_only = 'true';
      }
      const res = await alertAPI.getAlerts(farm.id, options);
      if (res.success && res.data) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [farm.id, filterSeverity, unreadOnly]);

  const handleMarkRead = async (id) => {
    try {
      await alertAPI.markRead(id);
      showToast('Alert marked as read', 'info');
      await fetchAlerts();
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await alertAPI.markAllRead(farm.id);
      showToast('All alerts marked as read', 'success');
      await fetchAlerts();
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await alertAPI.deleteAlert(id);
      showToast('Alert deleted', 'info');
      await fetchAlerts();
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'WARNING':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-sky-950 text-sky-300 border-sky-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Batch Actions */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Agronomic Event & Alert Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated event bus notifying root depletion, canopy stress, rain overrides, and pump actuations.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
        >
          <CheckCheck className="w-4 h-4 text-emerald-400" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-slate-400 font-medium">Filter Severity:</span>
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg font-semibold transition text-xs ${
                filterSeverity === sev
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
          />
          <span>Show Unread Only</span>
        </label>
      </div>

      {/* Alerts Feed */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No alerts found matching current filter criteria.
          </div>
        ) : (
          alerts.map((al) => (
            <div
              key={al.id}
              className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                al.is_read
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  : 'bg-slate-900/90 border-slate-700 text-slate-200 shadow-md'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider shrink-0 mt-0.5 ${getSeverityBadge(al.severity)}`}>
                  {al.severity}
                </span>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-white">{al.type.replace('_', ' ')}</span>
                    {!al.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{al.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    {new Date(al.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {!al.is_read && (
                  <button
                    onClick={() => handleMarkRead(al.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950/60 text-slate-400 hover:text-emerald-400 border border-slate-700 transition"
                    title="Mark as Read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(al.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                  title="Delete Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
