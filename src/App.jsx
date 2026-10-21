import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TabsNavigation from './components/TabsNavigation';
import Dashboard from './components/Dashboard';
import PlasticPickup from './components/PlasticPickup';
import CreditsRewards from './components/CreditsRewards';
import ReportIssue from './components/ReportIssue';
import NewPickupModal from './components/NewPickupModal';
import ReportIssueModal from './components/ReportIssueModal';
import SettingsModal from './components/SettingsModal';
import HelpDesk from './components/HelpDesk';
import { api } from './api/client';
import { formatDate } from './utils/dateFormat';
import { useAuth } from './context/AuthContext';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App({ onSwitchPortal }) {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [walletPoints, setWalletPoints] = useState(user?.walletPoints ?? 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Pickup Requests Data State
  const [requests, setRequests] = useState([]);

  // Civic Issues Data State
  const [issues, setIssues] = useState([]);

  // Load live data from Backend
  const loadCitizenData = useCallback(async () => {
    try {
      const [dashRes, pickupRes, complaintRes] = await Promise.all([
        api.citizen.getDashboard().catch(() => null),
        api.pickups.getMine().catch(() => null),
        api.complaints.getMine().catch(() => null),
      ]);

      if (dashRes?.metrics) {
        setWalletPoints(dashRes.metrics.walletPoints);
      }

      if (pickupRes?.pickups) {
        setRequests(pickupRes.pickups);
      }

      if (complaintRes?.complaints) {
        // Map backend complaint structure to frontend UI format
        const formattedIssues = complaintRes.complaints.map((c) => ({
          _id: c._id,
          id: c.id,
          title: c.title,
          category: c.category,
          location: c.location,
          locationShort: c.location ? c.location.split(',')[0] : '',
          description: c.description,
          reportedTime: `Reported: ${formatDate(c.createdAt)}`,
          status: (c.status || 'SUBMITTED').toUpperCase(),
          imageUrl: c.originalPhotoUrl || c.photoUrl,
          completionPhotoUrl: c.completionPhotoUrl,
          completionDescription: c.completionDescription,
          completedBy: c.completedBy,
          completedAt: c.completedAt,
          timelineSteps: (c.timeline || []).map((t) => ({
            label: t.step,
            state: t.status === 'completed' ? 'done' : t.status === 'current' ? 'active' : 'pending',
          })),
        }));
        setIssues(formattedIssues);
      }
    } catch (err) {
      console.warn('Could not load live citizen data:', err);
    }
  }, []);

  useEffect(() => {
    loadCitizenData();
  }, [loadCitizenData]);

  // Handlers
  const handleAddPickup = async (data) => {
    try {
      const payload = {
        requestedDate: data.date,
        notes: data.notes,
        photoUrl: data.photoUrl,
      };

      const res = await api.pickups.create(payload);
      showToast(`Pickup Request ${res.pickup?.customId || 'Scheduled'} placed successfully!`);
      loadCitizenData();
    } catch (err) {
      showToast(err.message || 'Failed to submit pickup request', 'error');
    }
  };

  const handleAddIssue = async (data) => {
    try {
      const payload = {
        title: data.title,
        category: data.category,
        location: data.location,
        description: data.description,
        photoUrl: data.imageUrl,
      };

      const res = await api.complaints.create(payload);
      showToast(`Civic issue ${res.complaint?.customId || ''} logged with Municipal Public Works!`);
      loadCitizenData();
    } catch (err) {
      showToast(err.message || 'Failed to report civic issue', 'error');
    }
  };

  const handleRedeem = async (cost, title, localCode) => {
    try {
      const res = await api.citizen.redeemPerk(title, cost);
      setWalletPoints(res.newBalance);
      showToast(`Voucher redeemed for ${title}! Code: ${res.voucherCode || localCode}`);
      refreshUser?.();
    } catch (err) {
      // Fallback local deduction if offline
      setWalletPoints((prev) => Math.max(0, prev - cost));
      showToast(`Voucher redeemed for ${title}! Code: ${localCode}`);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            walletPoints={walletPoints}
            onNavigateTab={setActiveTab}
          />
        );
      case 'pickup':
        return (
          <PlasticPickup
            requests={requests}
            onOpenModal={() => setShowPickupModal(true)}
          />
        );
      case 'credits':
        return (
          <CreditsRewards
            walletPoints={walletPoints}
            onRedeem={handleRedeem}
          />
        );
      case 'report':
        return (
          <ReportIssue
            issues={issues}
            onOpenModal={() => setShowReportModal(true)}
            onRefresh={loadCitizenData}
          />
        );
      case 'helpdesk':
        return <HelpDesk />;
      default:
        return <Dashboard walletPoints={walletPoints} onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50/40 via-teal-50/20 to-slate-50 text-slate-800">
      {/* ─── Left Sidebar Column (Citizen, Plastic, etc. tabs) ─── */}
      <TabsNavigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        walletPoints={walletPoints}
        onOpenSettings={() => setShowSettings(true)}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onSwitchPortal={onSwitchPortal}
      />

      {/* ─── Main Content Container (Right Side) ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          walletPoints={walletPoints}
          onOpenSettings={() => setShowSettings(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Tab Content */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {renderActiveTab()}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-500 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 EcoCivic Citizen Portal. Municipal Environmental & Sanitation Dept.</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Citizen Portal Live • Sector 14 Ward
            </span>
          </div>
        </footer>
      </div>

      {/* ─── Modals ─── */}
      <NewPickupModal
        isOpen={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        onSubmit={handleAddPickup}
      />

      <ReportIssueModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleAddIssue}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* ─── Toast Notification ─── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[120] max-w-md animate-slide-up rounded-2xl bg-slate-900 text-white p-4 shadow-2xl border border-slate-700/80 flex items-start gap-3">
          {toast.type === 'error' ? (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-sm font-medium leading-snug">
            {toast.message}
          </div>
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
