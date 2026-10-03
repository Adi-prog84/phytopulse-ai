import React from 'react';
import {
  X,
  Users,
  Shield,
  Brain,
  Cpu,
  Server,
  Monitor,
  BarChart3,
  ChevronRight,
  Leaf
} from 'lucide-react';

const TEAM_MEMBERS = [
  {
    number: '01',
    role: 'Team Lead & System Architect',
    color: 'emerald',
    icon: Shield,
    gradient: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
    responsibilities: [
      'Overall system architecture & design',
      'Module integration across all subsystems',
      'Team coordination & sprint planning',
      'Final system assembly & SIH demo coordination',
    ],
    tag: 'Architecture',
  },
  {
    number: '02',
    role: 'AI / Plant Health Engineer',
    color: 'violet',
    icon: Brain,
    gradient: 'from-violet-500 to-purple-500',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    badge: 'bg-violet-950/60 text-violet-400 border-violet-500/30',
    responsibilities: [
      'Plant Health AI inference engine',
      'Crop image analysis (RGB / deep learning)',
      'Plant disease & moisture stress detection',
      'AI-powered care recommendations',
    ],
    tag: 'AI / ML',
  },
  {
    number: '03',
    role: 'IoT & Hardware Engineer',
    color: 'amber',
    icon: Cpu,
    gradient: 'from-amber-500 to-orange-500',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    badge: 'bg-amber-950/60 text-amber-400 border-amber-500/30',
    responsibilities: [
      'ESP32-S3 & ESP32-CAM firmware',
      'Soil moisture sensor & DHT22 integration',
      'Rain sensor & real-time data acquisition',
      'Relay module, pump & OLED display control',
    ],
    tag: 'IoT / Hardware',
  },
  {
    number: '04',
    role: 'Backend & Decision Engine Engineer',
    color: 'sky',
    icon: Server,
    gradient: 'from-sky-500 to-cyan-500',
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    badge: 'bg-sky-950/60 text-sky-400 border-sky-500/30',
    responsibilities: [
      'Flask REST API backend & JWT auth',
      'MySQL schema design & ORM models',
      'Irrigation decision logic engine',
      'SENSE → ANALYZE → DECIDE → ACT pipeline',
    ],
    tag: 'Backend',
  },
  {
    number: '05',
    role: 'Frontend & UI Engineer',
    color: 'teal',
    icon: Monitor,
    gradient: 'from-teal-500 to-emerald-500',
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    badge: 'bg-teal-950/60 text-teal-400 border-teal-500/30',
    responsibilities: [
      'React 18 + Vite frontend architecture',
      'Dashboard, Demo Simulator & Alerts UI',
      'Device interface & sensor visualizations',
      'Responsive design & glassmorphism theming',
    ],
    tag: 'Frontend',
  },
  {
    number: '06',
    role: 'Data, Analytics & Testing Engineer',
    color: 'rose',
    icon: BarChart3,
    gradient: 'from-rose-500 to-pink-500',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    badge: 'bg-rose-950/60 text-rose-400 border-rose-500/30',
    responsibilities: [
      'Analytics engine & historical data trends',
      'Sensor data pipelines & time-series storage',
      'End-to-end testing & scenario validation',
      'Documentation, reporting & demo support',
    ],
    tag: 'Data / QA',
  },
];

export default function TeamModal({ onClose }) {
  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Modal panel */}
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden"
        style={{ background: 'rgba(10, 15, 30, 0.97)' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {/* Team logo */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">PYTHOPULSE</h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                    SIH 2026
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-sm text-slate-400">6 Member Team</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-sm text-slate-400">Problem Statement</span>
                  <span className="text-xs font-mono text-emerald-400">SIH26180</span>
                </div>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pipeline pill */}
          <div className="mt-4 flex items-center space-x-1.5 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800 w-fit text-[11px] font-mono">
            <span className="text-emerald-400 font-semibold">SENSE</span>
            <span className="text-slate-600">→</span>
            <span className="text-teal-400 font-semibold">ANALYZE</span>
            <span className="text-slate-600">→</span>
            <span className="text-sky-400 font-semibold">DECIDE</span>
            <span className="text-slate-600">→</span>
            <span className="text-amber-400 font-semibold">ACT</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Smart Agriculture & Climate Resilience</span>
          </div>
        </div>

        {/* ── Team grid (scrollable) ── */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEAM_MEMBERS.map((member) => {
              const Icon = member.icon;
              return (
                <div
                  key={member.number}
                  className={`group relative rounded-xl border ${member.border} bg-slate-900/50 p-5 flex flex-col gap-3 transition-all duration-300 hover:bg-slate-800/50 hover:shadow-lg`}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-lg ${member.bg} border ${member.border}`}>
                      <Icon className={`w-5 h-5 ${member.text}`} />
                    </div>
                    <span className={`text-[10px] font-bold font-mono border px-2 py-0.5 rounded-full ${member.badge}`}>
                      {member.tag}
                    </span>
                  </div>

                  {/* Member number + role */}
                  <div>
                    <div className={`text-[10px] font-mono font-semibold ${member.text} mb-0.5`}>
                      MEMBER #{member.number}
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-snug">
                      {member.role}
                    </h3>
                  </div>

                  {/* Divider */}
                  <div className={`h-px w-full bg-gradient-to-r ${member.gradient} opacity-20`} />

                  {/* Responsibilities */}
                  <ul className="space-y-1.5">
                    {member.responsibilities.map((item, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <ChevronRight className={`w-3 h-3 mt-0.5 flex-shrink-0 ${member.text} opacity-70`} />
                        <span className="text-[11px] text-slate-300 leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            PhytoPulse AI · Smart India Hackathon 2026 · Theme: Smart Agriculture & Climate Resilience
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
