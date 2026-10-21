import React from 'react';
import {
  LayoutDashboard,
  Recycle,
  Gift,
  AlertTriangle,
  Leaf,
  Coins,
  Settings,
  X,
  ChevronRight,
  ShieldCheck,
  ArrowLeftRight,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const tabs = [
  {
    id: 'dashboard',
    label: 'Citizen Dashboard',
    description: 'Overview Hub & Metrics',
    icon: LayoutDashboard,
  },
  {
    id: 'pickup',
    label: 'Plastic Pickup Request',
    description: 'Doorstep Pickup & Tracking',
    icon: Recycle,
  },
  {
    id: 'credits',
    label: 'Credits & Rewards',
    description: 'Redeem Civic Perks',
    icon: Gift,
  },
  {
    id: 'report',
    label: 'Civic Issue Report',
    description: 'Report & Track Complaints',
    icon: AlertTriangle,
  },
  {
    id: 'helpdesk',
    label: 'Help Desk',
    description: 'Municipal Contacts & Helplines',
    icon: HelpCircle,
  },
];

export default function TabsNavigation({
  activeTab,
  onChangeTab,
  walletPoints,
  onOpenSettings,
  isOpenMobile,
  onCloseMobile,
  onSwitchPortal,
}) {
  const { user } = useAuth();
  const citizenName = user?.name || 'Arjun Mehta';
  const citizenWard = user?.ward
    ? (user.ward.toLowerCase().includes('ward') || user.ward.startsWith('#') ? user.ward : `Ward #${user.ward}`)
    : 'Ward #SEC14';

  const getInitials = (str) => {
    if (!str) return 'AM';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      {/* ─── Mobile Backdrop Overlay ─── */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* ─── Left Sidebar Column ─── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Top: Brand Header */}
        <div>
          <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <Leaf className="h-5 w-5 text-white" strokeWidth={2.3} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 bg-clip-text text-transparent">
                    EcoConnect
                  </span>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200/60">
                  Citizen Portal
                </span>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              onClick={onCloseMobile}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links Column */}
          <div className="px-4 py-6">
            <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Citizen Navigation
            </p>

            <nav className="space-y-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onChangeTab(tab.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`group relative flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-all duration-200 ${isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                      : tab.id === 'helpdesk'
                      ? 'text-emerald-900 bg-emerald-50/60 hover:bg-emerald-100/80 border border-emerald-200/60'
                      : 'text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-900'
                      }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${isActive
                        ? 'bg-white/20 text-white'
                        : tab.id === 'helpdesk'
                        ? 'bg-emerald-100/90 text-emerald-700 group-hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                        }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.2} />
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="truncate text-sm">{tab.label}</div>
                      <div
                        className={`truncate text-[11px] ${isActive ? 'text-emerald-100' : 'text-slate-400 group-hover:text-emerald-600/80'
                          }`}
                      >
                        {tab.description}
                      </div>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'text-white opacity-90' : 'text-slate-300 opacity-0 group-hover:opacity-100'
                        }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Column: Wallet Card & Profile / Settings */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
          {/* Wallet summary card */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 p-4 text-white shadow-lg shadow-emerald-700/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200">
                EcoConnect Wallet
              </span>
              <Coins className="h-4 w-4 text-amber-300" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tabular-nums">{walletPoints}</span>
              <span className="text-xs font-bold text-emerald-200">PTS</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-100">
              Separate plastic to earn more civic perks
            </p>
          </div>

          {/* Citizen info & Settings button */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs ring-1 ring-emerald-200">
                {getInitials(citizenName)}
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate max-w-[125px]" title={citizenName}>{citizenName}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[125px]">{citizenWard}</p>
              </div>
            </div>

            <button
              onClick={onOpenSettings}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
              title="Citizen Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Switch Portal */}
          {onSwitchPortal && (
            <button
              onClick={onSwitchPortal}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Switch to Municipal Admin
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
