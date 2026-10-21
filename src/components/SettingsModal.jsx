import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Home, Bell, BellOff, Moon, Sun, Globe, Shield, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Toggle({ enabled, onToggle, label, description, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'} transition-colors`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

export default function SettingsModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const [notifications, setNotifications] = useState({
    sms: true,
    pickup: true,
    rewards: false,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [savedMsg, setSavedMsg] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Arjun Mehta',
    phone: user?.phone || '+91 98102 34567',
    ward: user?.ward || 'Sector 14',
    address: user?.address || 'Flat 402, Green Valley Apts, Sector 14',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        ward: user.ward || 'Sector 14',
        address: user.address || '',
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (updateProfile) {
      await updateProfile(formData);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md max-h-[85vh] animate-slide-up overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-800">Account Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {/* ─── Profile Info ─── */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Profile Information</h4>
              </div>
              {savedMsg && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-fade-in">
                  <Check className="h-3.5 w-3.5" /> Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2 border border-slate-200/70">
                <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</p>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2 border border-slate-200/70">
                <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2 border border-slate-200/70">
                <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Citizen Ward</p>
                  <input
                    type="text"
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2 border border-slate-200/70">
                <Home className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Home Address</p>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* ─── Notifications ─── */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-emerald-500" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Notifications</h4>
            </div>
            <div className="divide-y divide-slate-50">
              <Toggle
                enabled={notifications.sms}
                onToggle={() => setNotifications((p) => ({ ...p, sms: !p.sms }))}
                label="SMS Alerts"
                description="Receive text messages for updates"
                icon={notifications.sms ? Bell : BellOff}
              />
              <Toggle
                enabled={notifications.pickup}
                onToggle={() => setNotifications((p) => ({ ...p, pickup: !p.pickup }))}
                label="Pickup Status"
                description="Get notified on pickup progress"
                icon={notifications.pickup ? Bell : BellOff}
              />
              <Toggle
                enabled={notifications.rewards}
                onToggle={() => setNotifications((p) => ({ ...p, rewards: !p.rewards }))}
                label="Reward Notifications"
                description="Alerts when you earn credits"
                icon={notifications.rewards ? Bell : BellOff}
              />
            </div>
          </div>

          {/* ─── Preferences ─── */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-emerald-500" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Preferences</h4>
            </div>
            <div className="space-y-4">
              <Toggle
                enabled={darkMode}
                onToggle={() => setDarkMode(!darkMode)}
                label="Dark Mode"
                description="Switch to dark theme"
                icon={darkMode ? Moon : Sun}
              />
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none transition-all appearance-none"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
