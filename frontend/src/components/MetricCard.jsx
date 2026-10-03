import React from 'react';

export default function MetricCard({
  title,
  value,
  unit = '',
  status,
  statusType = 'neutral', // success, warning, danger, info, neutral
  icon: Icon,
  trend,
  trendDirection = 'neutral', // up, down, neutral
  subtext,
  className = '',
}) {
  const getStatusBadge = () => {
    switch (statusType) {
      case 'success':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30';
      case 'warning':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/30';
      case 'danger':
        return 'bg-rose-950/80 text-rose-400 border-rose-500/30';
      case 'info':
        return 'bg-sky-950/80 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className={`glass-card glass-card-hover rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-emerald-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-1.5 mb-2">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
      </div>

      <div className="flex items-center justify-between pt-1">
        {status && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getStatusBadge()}`}>
            {status}
          </span>
        )}

        {trend && (
          <span className={`text-[11px] font-medium ${
            trendDirection === 'up' ? 'text-emerald-400' :
            trendDirection === 'down' ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {trend}
          </span>
        )}

        {subtext && !trend && (
          <span className="text-[11px] text-slate-500">{subtext}</span>
        )}
      </div>
    </div>
  );
}
