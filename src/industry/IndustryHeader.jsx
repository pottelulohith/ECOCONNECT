import React, { useState } from 'react';
import { Menu, Bell, Search, ChevronRight, X } from 'lucide-react';
import { formatDate } from '../utils/dateFormat';
import { useAuth } from '../context/AuthContext';

export default function IndustryHeader({
  activeTab,
  onOpenMobileMenu,
  notificationCount = 0,
  notifications = [],
  onNavigateTab,
}) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const companyName = user?.companyName || user?.name || 'Green Polymer Industries';
  const roleTitle = user?.designation || user?.contactPerson || 'Procurement Mgr';

  const getInitials = (str) => {
    if (!str) return 'GP';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const pageTitles = {
    overview: 'Industry Overview',
    marketplace: 'Plastic Marketplace',
    requests: 'Purchase Requests',
    deliveries: 'Orders & Deliveries',
    profile: 'Company Profile',
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 lg:hidden"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800">
              {pageTitles[activeTab] || 'Industry Dashboard'}
            </h1>
            <p className="hidden sm:block text-xs text-slate-400">
              EcoConnect Industry Operations • {companyName}
            </p>
          </div>
        </div>

        {/* Right: Search, Bell, Company */}
        <div className="flex items-center gap-2 sm:gap-3 relative">
          {/* Search Bar */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search batches, orders…"
              className="w-56 rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-sm"
            />
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-800 transition-all shadow-sm cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" strokeWidth={2} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 z-50 animate-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">Industry Notifications</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                      {notificationCount} Active
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No active notifications.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.linkTab && onNavigateTab) {
                            onNavigateTab(item.linkTab);
                          }
                          setShowNotifications(false);
                        }}
                        className="py-2.5 px-1 hover:bg-amber-50/40 transition-colors cursor-pointer rounded-lg flex items-start gap-2.5"
                      >
                        <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800">{item.title}</p>
                          <p className="text-[11px] text-slate-600 truncate">{item.message}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-1" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Company Avatar & Info */}
          <div className="hidden md:flex items-center gap-2.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1.5 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-900 text-[10px] font-extrabold shadow-sm">
              {getInitials(companyName)}
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-bold text-slate-700 truncate max-w-[130px]" title={companyName}>{companyName}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{roleTitle}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
