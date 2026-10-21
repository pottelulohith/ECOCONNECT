import React from 'react';
import {
  Landmark,
  LayoutDashboard,
  MessageSquareWarning,
  Scale,
  Boxes,
  ChevronRight,
  X,
  ShieldCheck,
  ArrowLeftRight,
  ShoppingBag,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MunicipalSidebar({
  activeTab,
  onChangeTab,
  isOpenMobile,
  onCloseMobile,
  onSwitchPortal,
  badges = {},
}) {
  const { user } = useAuth();
  const officerName = user?.name || user?.contactPerson || 'Officer R. Vance';
  const officerDesignation = user?.designation || (user?.zone ? `${user.zone} Operations Chief` : 'Zone 4 Operations Chief');

  const getInitials = (str) => {
    if (!str) return 'RV';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const tabs = [
    {
      id: 'command',
      label: 'Municipal Command Hub',
      description: 'Dispatch & Operations',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'complaints',
      label: 'Citizen Complaints Flow',
      description: 'Issue Triage & Assignment',
      icon: MessageSquareWarning,
      badge: badges?.complaints > 0 ? `${badges.complaints} Open` : null,
      badgeColor: 'bg-red-500',
    },
    {
      id: 'collections',
      label: 'Plastic Collections',
      description: 'Weighbridge Verification',
      icon: Scale,
      badge: badges?.collections > 0 ? `${badges.collections} Pending` : null,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'inventory',
      label: 'Plastic Inventory Stock',
      description: 'Polymer Stock Levels',
      icon: Boxes,
      badge: null,
    },
    {
      id: 'orders',
      label: 'Orders',
      description: 'Industry Material Requests',
      icon: ShoppingBag,
      badge: badges?.orders > 0 ? `${badges.orders} Pending` : null,
      badgeColor: 'bg-blue-600',
    },
    {
      id: 'profile',
      label: 'Profile',
      description: 'Municipal Office & Officer',
      icon: Building2,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[17.5rem] flex-col justify-between border-r border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-600/25">
                <Landmark className="h-5 w-5 text-white" strokeWidth={2.3} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 bg-clip-text text-transparent">
                    EcoConnect
                  </span>
                </div>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-blue-200/60">
                  Municipal Admin
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <div className="px-3.5 py-5">
            <p className="px-3 pb-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Admin Navigation
            </p>

            <nav className="space-y-1">
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
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-blue-50/70 hover:text-blue-900'
                      }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700'
                        }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.2} />
                    </div>

                    <div className="flex-1 overflow-hidden min-w-0">
                      <div className="truncate text-[13px]">{tab.label}</div>
                      <div
                        className={`truncate text-[10.5px] ${isActive
                          ? 'text-blue-100'
                          : 'text-slate-400 group-hover:text-blue-600/80'
                          }`}
                      >
                        {tab.description}
                      </div>
                    </div>

                    {tab.badge ? (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${isActive ? 'bg-white/25' : tab.badgeColor
                          }`}
                      >
                        {tab.badge}
                      </span>
                    ) : (
                      <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 transition-transform ${isActive
                          ? 'text-white opacity-90'
                          : 'text-slate-300 opacity-0 group-hover:opacity-100'
                          }`}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom: Officer Card & Portal Switcher */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 space-y-3">
          {/* Officer Info Card */}
          <div
            onClick={() => onChangeTab('profile')}
            className="rounded-2xl bg-gradient-to-br from-blue-800 to-blue-950 p-3.5 text-white shadow-lg shadow-blue-800/20 cursor-pointer hover:ring-2 hover:ring-blue-400/50 transition-all group"
            title="View Municipal Profile"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white font-bold text-xs ring-2 ring-white/30 group-hover:scale-105 transition-transform">
                {getInitials(officerName)}
              </div>
              <div className="leading-tight min-w-0 flex-1">
                <p className="text-[13px] font-bold flex items-center justify-between gap-1">
                  <span className="truncate max-w-[130px]" title={officerName}>{officerName}</span>
                  <span className="text-[10px] text-blue-300 font-normal underline opacity-80 group-hover:opacity-100 shrink-0">View</span>
                </p>
                <p className="text-[10.5px] text-blue-200 truncate">{officerDesignation}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-300" />
              <span className="text-[10px] font-semibold text-sky-200">
                Level 5 Admin Clearance
              </span>
            </div>
          </div>

          {/* Switch Portal Button */}
          <button
            onClick={onSwitchPortal}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Switch to Citizen Portal
          </button>
        </div>
      </aside>
    </>
  );
}
