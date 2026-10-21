import React, { useState, useEffect } from 'react';
import {
  Boxes,
  IndianRupee,
  Clock,
  Truck,
  TrendingUp,
  ArrowUpRight,
  Zap,
  Activity,
} from 'lucide-react';
import { api } from '../api/client';
import { formatDate } from '../utils/dateFormat';

export default function IndustryOverview({ onNavigateTab }) {
  const [metricsData, setMetricsData] = useState({
    totalProcuredKg: 0,
    totalSpent: 0,
    activeRequests: 0,
    inTransitDeliveries: 0,
  });
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    api.industry
      .getDashboard()
      .then((res) => {
        if (res?.metrics) {
          setMetricsData(res.metrics);
        }
        if (res?.recentActivity) {
          // Strict privacy filter: ensure no citizen PII or non-procurement records are displayed in audit trail
          const filtered = res.recentActivity.filter((item) => {
            const desc = (item.description || '').toLowerCase();
            const act = (item.action || '').toLowerCase();
            if (act.includes('complaint') || act.includes('pickup') || act.includes('citizen')) return false;
            if (desc.includes('complaint') || desc.includes('pickup request')) return false;
            return true;
          });
          setActivity(filtered);
        }
      })
      .catch((err) => console.warn('Could not load industry overview:', err));
  }, []);

  const metrics = [
    {
      label: 'Procured Stock',
      value: metricsData.totalProcuredKg.toLocaleString(),
      sub: 'kg',
      icon: Boxes,
      color: 'from-amber-400 to-yellow-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-800',
      ringColor: 'ring-amber-200/80',
      shadowColor: 'shadow-amber-500/10',
      trend: 'Total polymer volume',
    },
    {
      label: 'Expenditure',
      value: `₹${metricsData.totalSpent.toLocaleString('en-IN')}`,
      sub: '',
      icon: IndianRupee,
      color: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      ringColor: 'ring-blue-200/60',
      shadowColor: 'shadow-blue-500/15',
      trend: 'Recycled feedstock spend',
    },
    {
      label: 'Pending Requests',
      value: String(metricsData.activeRequests),
      sub: 'Active',
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
      ringColor: 'ring-amber-200/60',
      shadowColor: 'shadow-amber-500/15',
      trend: 'Awaiting municipal review',
    },
    {
      label: 'Shipments',
      value: String(metricsData.inTransitDeliveries),
      sub: 'Deliveries',
      icon: Truck,
      color: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
      ringColor: 'ring-violet-200/60',
      shadowColor: 'shadow-violet-500/15',
      trend: 'Active tracking',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900 via-slate-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-amber-900/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
        <div className="absolute top-4 right-8 flex items-center gap-2 bg-amber-400/10 rounded-full px-3 py-1 ring-1 ring-amber-400/30">
          <Activity className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[11px] font-semibold text-amber-300">Procurement Operations Live</span>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Industrial Plastic Sourcing Portal
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Circular Polymer Marketplace
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Purchase verified post-consumer recycled polymer batches from municipal MRF centers,
            audit material grades, and track inbound freight.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => onNavigateTab && onNavigateTab('marketplace')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 hover:from-amber-500 hover:to-yellow-500 transition-all active:scale-[0.97] cursor-pointer"
            >
              Browse Stock Batches
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('deliveries')}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all cursor-pointer"
            >
              <Truck className="h-4 w-4 text-amber-400" />
              Track Deliveries
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className={`card-hover group relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm ${m.shadowColor}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {m.label}
                </span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.bgLight} ring-1 ${m.ringColor}`}>
                  <Icon className={`h-4 w-4 ${m.textColor}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 tabular-nums">{m.value}</span>
                {m.sub && <span className={`text-xs font-bold ${m.textColor}`}>{m.sub}</span>}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                <TrendingUp className="h-3 w-3 text-emerald-600" />
                <span>{m.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Log */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">Procurement & Dispatch Audit Trail</h3>
          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 rounded-full px-2.5 py-0.5 ring-1 ring-amber-300">
            Real-time
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {activity.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No procurement audit records found yet.
            </div>
          ) : (
            activity.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                <span className="text-xs font-mono font-semibold text-slate-400 w-24 shrink-0">
                  {formatDate(item.createdAt || item.timestamp) || 'Today'}
                </span>
                <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                <p className="text-sm text-slate-600 flex-1">{item.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
