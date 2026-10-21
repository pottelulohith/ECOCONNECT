import React, { useState, useEffect } from 'react';
import { Scale, Coins, CheckCircle2, Truck, ArrowRight, Sparkles, Recycle, AlertTriangle, Gift } from 'lucide-react';
import { api } from '../api/client';
import { formatDate } from '../utils/dateFormat';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ walletPoints = 0, onNavigateTab }) {
  const { user } = useAuth();
  const [data, setData] = useState({
    recycledWeight: '0 kg',
    walletPoints: walletPoints,
    resolvedIssues: '0 Closed',
    nextPickup: 'Not Scheduled',
  });

  useEffect(() => {
    const fetchMetrics = () => {
      api.citizen
        .getDashboard()
        .then((res) => {
          if (res?.metrics) {
            setData({
              recycledWeight: `${res.metrics.recycledWeightKg} kg`,
              walletPoints: res.metrics.walletPoints,
              resolvedIssues: `${res.metrics.resolvedIssues} Closed`,
              nextPickup:
                res.metrics.nextPickup && res.metrics.nextPickup !== 'Not Scheduled'
                  ? formatDate(res.metrics.nextPickup)
                  : 'Not Scheduled',
            });
          }
        })
        .catch(() => {});
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [walletPoints]);

  const metrics = [
    {
      title: 'Recycled Weight',
      value: data.recycledWeight,
      icon: Scale,
      color: 'emerald',
      bg: 'from-emerald-500/10 via-emerald-50 to-emerald-100/50',
      iconBg: 'bg-emerald-600',
      ring: 'border-emerald-200/80',
      textColor: 'text-emerald-800',
      shadow: 'shadow-emerald-600/20',
      trend: parseFloat(data.recycledWeight) > 0 ? `${data.recycledWeight} verified` : 'Doorstep recycling',
      targetTab: 'pickup',
    },
    {
      title: 'Earned Credits',
      value: `${data.walletPoints ?? walletPoints} PTS`,
      icon: Coins,
      color: 'amber',
      bg: 'from-amber-500/10 via-amber-50 to-amber-100/50',
      iconBg: 'bg-amber-500',
      ring: 'border-amber-200/80',
      textColor: 'text-amber-800',
      shadow: 'shadow-amber-500/20',
      trend: (data.walletPoints ?? walletPoints) > 0 ? `${data.walletPoints ?? walletPoints} available` : '10 PTS per verified kg',
      targetTab: 'credits',
    },
    {
      title: 'Resolved Issues',
      value: data.resolvedIssues,
      icon: CheckCircle2,
      color: 'blue',
      bg: 'from-blue-500/10 via-blue-50 to-blue-100/50',
      iconBg: 'bg-blue-600',
      ring: 'border-blue-200/80',
      textColor: 'text-blue-800',
      shadow: 'shadow-blue-600/20',
      trend: 'Live civic track',
      targetTab: 'report',
    },
    {
      title: 'Next Pickup',
      value: data.nextPickup,
      icon: Truck,
      color: 'purple',
      bg: 'from-purple-500/10 via-purple-50 to-purple-100/50',
      iconBg: 'bg-purple-600',
      ring: 'border-purple-200/80',
      textColor: 'text-purple-800',
      shadow: 'shadow-purple-600/20',
      trend: 'Doorstep pickup',
      targetTab: 'pickup',
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* ─── Welcome Banner ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 p-8 sm:p-12 text-white shadow-2xl shadow-emerald-700/20">
        {/* Decorative backdrop shapes */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="pointer-events-none absolute right-24 top-10 h-3 w-3 rounded-full bg-emerald-300/40 animate-ping" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-emerald-100 backdrop-blur-md mb-4 border border-white/20">
            <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
            <span>Overview Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Welcome{user?.name ? `, ${user.name}` : ''} to your Citizen Action Portal
          </h1>
          <p className="text-base sm:text-xl text-emerald-50 leading-relaxed font-light">
            “Empowering citizens for a cleaner, sustainable community. Separate plastic, earn rewards, and keep our city clean.”
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab && onNavigateTab('pickup')}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 px-5 py-3 text-sm font-bold shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Recycle className="h-4 w-4 text-emerald-600" />
              Schedule Pickup
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('report')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-800/80 text-white border border-white/20 px-5 py-3 text-sm font-semibold transition-all hover:scale-105 active:scale-95 backdrop-blur-sm cursor-pointer"
            >
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              Report Issue
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('credits')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-800/80 text-white border border-white/20 px-5 py-3 text-sm font-semibold transition-all hover:scale-105 active:scale-95 backdrop-blur-sm cursor-pointer"
            >
              <Gift className="h-4 w-4 text-emerald-300" />
              Redeem Rewards
            </button>
          </div>
        </div>
      </div>

      {/* ─── Quick Metrics Grid (4 Stat Cards) ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Quick Metrics Overview</h2>
          <span className="text-xs text-slate-500 font-medium">Real-time civic impact</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                onClick={() => onNavigateTab && onNavigateTab(m.targetTab)}
                className={`card-hover group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br ${m.bg} p-6 border ${m.ring} shadow-sm transition-all hover:shadow-lg`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${m.iconBg} ${m.shadow} shadow-lg transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6 text-white" strokeWidth={2.2} />
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-slate-400 group-hover:text-slate-700 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{m.title}</p>
                <p className={`text-3xl font-extrabold tracking-tight tabular-nums ${m.textColor}`}>{m.value}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{m.trend}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
