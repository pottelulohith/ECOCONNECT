import React, { useState, useEffect, useCallback } from 'react';
import IndustrySidebar from './IndustrySidebar';
import IndustryHeader from './IndustryHeader';
import IndustryOverview from './IndustryOverview';
import IndustryMarketplace from './IndustryMarketplace';
import IndustryPurchaseRequests from './IndustryPurchaseRequests';
import IndustryOrdersDeliveries from './IndustryOrdersDeliveries';
import IndustryCompanyProfile from './IndustryCompanyProfile';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, X } from 'lucide-react';

export default function IndustryApp({ onSwitchPortal }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Dynamic notification state
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [badges, setBadges] = useState({ requests: 0, deliveries: 0 });

  const loadNotifications = useCallback(() => {
    api.industry
      .getNotifications()
      .then((res) => {
        if (res?.success) {
          setNotificationCount(res.count || 0);
          setNotifications(res.notifications || []);
          if (res.badges) setBadges(res.badges);
        }
      })
      .catch((err) => console.warn('Could not load industry notifications:', err));
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
      case 'overview':
        return <IndustryOverview onNavigateTab={setActiveTab} />;
      case 'marketplace':
        return <IndustryMarketplace onShowToast={showToast} />;
      case 'requests':
        return <IndustryPurchaseRequests onShowToast={showToast} />;
      case 'deliveries':
        return <IndustryOrdersDeliveries onShowToast={showToast} />;
      case 'profile':
        return <IndustryCompanyProfile onShowToast={showToast} />;
      default:
        return <IndustryOverview onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-amber-50/40 via-slate-50 to-yellow-50/30 text-slate-800">
      {/* Left Sidebar */}
      <IndustrySidebar
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
        <IndustryHeader
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
            <span>© 2026 EcoConnect Industry Portal • Circular Plastic Procurement Network</span>
            <span className="inline-flex items-center gap-1.5 text-amber-800 font-semibold">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              EPR Verified Partner • {user?.companyName || user?.name || 'Green Polymer Industries'}
            </span>
          </div>
        </footer>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[120] max-w-md animate-slide-up rounded-2xl bg-slate-900 text-white p-4 shadow-2xl border border-slate-700/80 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
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
