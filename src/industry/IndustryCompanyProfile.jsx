import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Save,
  FileCheck,
  Mail,
  Phone,
  MapPin,
  Award,
  Calendar,
  AlertCircle,
  Hash,
  Edit3,
  X,
  Loader2,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function IndustryCompanyProfile({ onShowToast }) {
  const { user, setUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profile, setProfile] = useState({
    industryId: 'IND-1001',
    companyName: 'Green Polymer Industries Ltd.',
    businessCategory: 'Plastic Recycling & Compounder',
    authorizedPerson: 'Ananya Deshmukh',
    designation: 'Head of Sustainable Procurement',
    email: 'procurement@greenpolymer.in',
    phone: '+91 80 2845 9100',
    facilityAddress: 'Plot 42-B, Peenya Industrial Area, Phase III',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560058',
    capacity: '1,500 Metric Tons / Year',
    polymers: 'PET, HDPE, PP, LDPE',
    gstin: '29AABCU9603R1ZM',
    panNumber: 'AABCU9603R',
    complianceValidity: 'March 31, 2027 (Active)',
  });

  const [originalProfile, setOriginalProfile] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.me();
      if (res?.user) {
        const u = res.user;
        const loaded = {
          industryId: u._id ? `IND-${u._id.slice(-4).toUpperCase()}` : 'IND-1001',
          companyName: u.companyName || u.name || 'Green Polymer Industries Ltd.',
          businessCategory: u.businessCategory || u.industryType || 'Plastic Recycling & Compounder',
          authorizedPerson: u.contactPerson || u.name || 'Ananya Deshmukh',
          designation: u.designation || 'Head of Sustainable Procurement',
          email: u.email || 'industry@ecoconnect.local',
          phone: u.phone || '+91 80 2845 9100',
          facilityAddress: u.facilityLocation || u.address || 'Plot 42-B, Peenya Industrial Area, Phase III',
          city: u.city || 'Bengaluru',
          state: u.state || 'Karnataka',
          pincode: u.pincode || '560058',
          capacity: u.monthlyCapacityKg ? `${u.monthlyCapacityKg} kg / month` : '1,500 Metric Tons / Year',
          polymers: u.polymers || 'PET, HDPE, PP, LDPE',
          gstin: u.gstNumber || '29AABCU9603R1ZM',
          panNumber: u.panNumber || 'AABCU9603R',
          complianceValidity: 'March 31, 2027 (Active)',
        };
        setProfile(loaded);
        setOriginalProfile(loaded);
      }
    } catch (err) {
      console.error('Failed to load industry profile:', err);
      setError(err.message || 'Unable to retrieve company profile from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        companyName: user.companyName || user.name || prev.companyName,
        businessCategory: user.businessCategory || user.industryType || prev.businessCategory,
        authorizedPerson: user.contactPerson || prev.authorizedPerson,
        designation: user.designation || prev.designation,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        facilityAddress: user.facilityLocation || user.address || prev.facilityAddress,
        city: user.city || prev.city,
        state: user.state || prev.state,
        pincode: user.pincode || prev.pincode,
        polymers: user.polymers || prev.polymers,
        gstin: user.gstNumber || prev.gstin,
        panNumber: user.panNumber || prev.panNumber,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: profile.companyName || profile.authorizedPerson || 'Green Polymer Industries',
        companyName: profile.companyName,
        businessCategory: profile.businessCategory,
        industryType: profile.businessCategory,
        contactPerson: profile.authorizedPerson,
        designation: profile.designation,
        phone: profile.phone,
        facilityLocation: profile.facilityAddress,
        address: profile.facilityAddress,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        polymers: profile.polymers,
        gstNumber: profile.gstin,
        panNumber: profile.panNumber,
      };

      const res = await (updateProfile ? updateProfile(payload) : api.auth.updateProfile(payload));
      if (res?.user) {
        if (setUser) setUser(res.user);
        setOriginalProfile({ ...profile });
      }

      setSavedSuccess(true);
      setIsEditing(false);
      if (onShowToast) {
        onShowToast('Company profile details saved successfully to database!');
      }
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Could not persist profile to server:', err);
      setError(err.message || 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium">Loading verified company profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-black text-slate-800">Company Profile</h2>
          </div>
          <p className="text-sm text-slate-500">
            Manage your registered organization credentials and recycling partner identity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/70 px-3 py-1.5 text-xs font-bold text-amber-900 ring-1 ring-amber-300">
            <ShieldCheck className="h-4 w-4 text-amber-700" />
            Verified Recycler Partner
          </span>

          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs px-3.5 py-2 shadow-sm transition-all"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Banner inside Card */}
        <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 border-b border-amber-300/70 p-6 text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-300 text-slate-900 font-black text-2xl shadow-inner ring-2 ring-amber-400/50 shrink-0">
              {profile.companyName ? profile.companyName.slice(0, 2).toUpperCase() : 'GP'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black">{profile.companyName}</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {profile.businessCategory} • {profile.city}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-700">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Industry ID: <strong className="text-slate-900 font-mono">{profile.industryId}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award className="h-3 w-3" /> CPCB EPR Certified
                </span>
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-amber-300/80 sm:pl-6">
            <p className="text-[10px] uppercase font-bold text-amber-800">Status</p>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Active Partner
            </p>
            <p className="text-[10px] text-amber-900 font-medium mt-1">Renewal: {profile.complianceValidity}</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-7">
          {/* Section 1: Organization Identification */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileCheck className="h-3.5 w-3.5 text-amber-600" />
              Organization Identification
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Field 1: Industry ID (System-controlled, read-only) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Industry ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="industryId"
                    value={profile.industryId}
                    disabled
                    readOnly
                    className="w-full rounded-xl bg-slate-100 border border-slate-200 px-4 py-2.5 text-sm font-mono font-bold text-slate-500 cursor-not-allowed shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-900">
                      SYSTEM LOCKED
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Unique state industrial portal identifier</p>
              </div>

              {/* Company Legal Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={profile.companyName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Business Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Business Category
                </label>
                <input
                  type="text"
                  name="businessCategory"
                  value={profile.businessCategory}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  GSTIN Number
                </label>
                <input
                  type="text"
                  name="gstin"
                  value={profile.gstin}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-mono font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* PAN Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={profile.panNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-mono font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Annual Processing Capacity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Processing Capacity
                </label>
                <input
                  type="text"
                  name="capacity"
                  value={profile.capacity}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Polymers Handled */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Polymers Procured
                </label>
                <input
                  type="text"
                  name="polymers"
                  value={profile.polymers}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Representative */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-amber-600" />
              Authorized Representative
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Authorized Person
                </label>
                <input
                  type="text"
                  name="authorizedPerson"
                  value={profile.authorizedPerson}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={profile.designation}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Contact Email (Account ID)
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                  readOnly
                  className="w-full rounded-xl bg-slate-100 border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Facility Address */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-amber-600" />
              Processing Plant Address
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Factory Street Address
                </label>
                <input
                  type="text"
                  name="facilityAddress"
                  value={profile.facilityAddress}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={profile.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={profile.pincode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-amber-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {savedSuccess ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <CheckCircle2 className="h-4 w-4" />
                Changes saved successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                {isEditing ? 'Make sure all regulatory details match official documents.' : 'All changes reflect across procurement orders and bills of lading.'}
              </span>
            )}

            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-6 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 hover:from-amber-500 hover:to-yellow-500 hover:shadow-xl hover:shadow-amber-400/30 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-md shadow-amber-400/20 transition-all"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
