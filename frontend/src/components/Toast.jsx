import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export default function Toast() {
  const { toast } = useFarm();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  const getBorder = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200';
      case 'warning':
        return 'border-amber-500/40 bg-amber-950/90 text-amber-200';
      case 'error':
        return 'border-rose-500/40 bg-rose-950/90 text-rose-200';
      default:
        return 'border-sky-500/40 bg-sky-950/90 text-sky-200';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md max-w-md ${getBorder()}`}>
        {getIcon()}
        <span className="text-xs font-medium leading-relaxed">{toast.message}</span>
      </div>
    </div>
  );
}
