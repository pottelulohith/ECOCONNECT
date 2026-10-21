import React, { useState, useEffect, useCallback } from 'react';
import MunicipalSidebar from './MunicipalSidebar';
import MunicipalHeader from './MunicipalHeader';
import MunicipalCommandHub from './MunicipalCommandHub';
import ComplaintsFlow from './ComplaintsFlow';
import PlasticCollections from './PlasticCollections';
import PlasticInventory from './PlasticInventory';
import IndustryOrders from './IndustryOrders';
import MunicipalProfile from './MunicipalProfile';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, X } from 'lucide-react';

export default function MunicipalApp({ onSwitchPortal }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('command');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Dynamic notification state
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [badges, setBadges] = useState({ complaints: 0, collections: 0, orders: 0 });

  const loadNotifications = useCallback(() => {
    api.municipality
      .getNotifications()
      .then((res) => {
        if (res?.success) {
          setNotificationCount(res.count || 0);
          setNotifications(res.notifications || []);
          if (res.badges) setBadges(res.badges);
        }
      })
      .catch((err) => console.warn('Could not load municipality notifications:', err));
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [loadNotifications, activeTab]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4500);
    loadNotifications();
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'command':
        return <MunicipalCommandHub onNavigateTab={setActiveTab} />;
      case 'complaints':
        return <ComplaintsFlow onShowToast={showToast} />;
      case 'collections':
        return <PlasticCollections />;
      case 'inventory':
        return <PlasticInventory />;
      case 'orders':
        return <IndustryOrders />;
      case 'profile':
        return <MunicipalProfile onShowToast={showToast} />;
      default:
        return <MunicipalCommandHub onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50/40 via-slate-50 to-sky-50/30 text-slate-800">
      {/* Left Sidebar */}
      <MunicipalSidebar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onSwitchPortal={onSwitchPortal}
        badges={badges}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <MunicipalHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          notificationCount={notificationCount}
          notifications={notifications}
          onNavigateTab={setActiveTab}
        />

        {/* Tab Content */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {renderActiveTab()}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white/60 py-5 text-center text-xs text-slate-500 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 EcoCivic Municipal Admin. {user?.department || 'Environmental & Sanitation Dept.'}</span>
            <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Dispatch System Active • {user?.zone || 'Zone 4'} Operations
            </span>
          </div>
        </footer>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[120] max-w-md animate-slide-up rounded-2xl bg-slate-900 text-white p-4 shadow-2xl border border-slate-700/80 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium leading-snug">{toast}</div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
