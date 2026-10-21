import React from 'react';
import {
  Factory,
  LayoutDashboard,
  Store,
  FileText,
  Truck,
  Building2,
  ChevronRight,
  X,
  ShieldCheck,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function IndustrySidebar({
  activeTab,
  onChangeTab,
  isOpenMobile,
  onCloseMobile,
  onSwitchPortal,
  badges = {},
}) {
  const { user } = useAuth();
  const companyName = user?.companyName || user?.name || 'Green Polymer Ind.';
  const roleTitle = user?.designation || user?.contactPerson || 'Procurement Manager';

  const getInitials = (str) => {
    if (!str) return 'GP';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Dashboard Summary',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'marketplace',
      label: 'Plastic Marketplace',
      description: 'Browse & Procure',
      icon: Store,
      badge: null,
    },
    {
      id: 'requests',
      label: 'Purchase Requests',
      description: 'Request Tracking',
      icon: FileText,
      badge: badges?.requests > 0 ? `${badges.requests} Pending` : null,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'deliveries',
      label: 'Orders & Deliveries',
      description: 'Shipment Tracking',
      icon: Truck,
      badge: badges?.deliveries > 0 ? `${badges.deliveries} Active` : null,
      badgeColor: 'bg-blue-600',
    },
    {
      id: 'profile',
      label: 'Company Profile',
      description: 'Organization Details',
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
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[17.5rem] flex-col justify-between border-r border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md shadow-amber-400/25">
                <Factory className="h-5 w-5 text-slate-900" strokeWidth={2.3} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-amber-700 via-yellow-700 to-amber-900 bg-clip-text text-transparent">
                    EcoConnect
                  </span>
                </div>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 ring-1 ring-amber-300/80">
                  Industry Portal
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
              Industry Navigation
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
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 text-slate-900 font-bold shadow-md shadow-amber-300/30'
                        : 'text-slate-600 hover:bg-amber-50/80 hover:text-amber-950'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? 'bg-amber-500/25 text-slate-900'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.2} />
                    </div>

                    <div className="flex-1 overflow-hidden min-w-0">
                      <div className="truncate text-[13px]">{tab.label}</div>
                      <div
                        className={`truncate text-[10.5px] ${
                          isActive
                            ? 'text-amber-950 font-medium'
                            : 'text-slate-400 group-hover:text-amber-800'
                        }`}
                      >
                        {tab.description}
                      </div>
                    </div>

                    {tab.badge ? (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive ? 'bg-amber-500/30 text-slate-950' : tab.badgeColor + ' text-white'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    ) : (
                      <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                          isActive
                            ? 'text-slate-900 opacity-90'
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

        {/* Bottom: Company Card & Portal Switcher */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 space-y-3">
          {/* Company Info Card */}
          <div
            onClick={() => onChangeTab('profile')}
            className="rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-200 border border-amber-300/80 p-3.5 text-slate-900 shadow-md shadow-amber-300/15 cursor-pointer hover:ring-2 hover:ring-amber-400/60 transition-all group"
            title="View Company Profile"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-300 text-slate-900 font-black text-xs ring-2 ring-amber-400/60 group-hover:scale-105 transition-transform">
                {getInitials(companyName)}
              </div>
              <div className="leading-tight min-w-0 flex-1">
                <p className="text-[13px] font-bold text-slate-900 flex items-center justify-between gap-1">
                  <span className="truncate max-w-[130px]" title={companyName}>{companyName}</span>
                  <span className="text-[10px] text-amber-900/70 font-normal underline group-hover:opacity-100 shrink-0">View</span>
                </p>
                <p className="text-[10.5px] text-amber-900 font-medium truncate">{roleTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
              <span className="text-[10px] font-bold text-amber-900">
                Verified Industry Partner
              </span>
            </div>
          </div>

          {/* Switch Portal Button */}
          <button
            onClick={() => onSwitchPortal('municipal')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Switch to Municipal Portal
          </button>
        </div>
      </aside>
    </>
  );
}
