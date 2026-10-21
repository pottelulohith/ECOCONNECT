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
  Hash,
  Edit3,
  X,
  Loader2,
  AlertCircle,
  Landmark,
  User,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function MunicipalProfile({ onShowToast }) {
  const { user, setUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profile, setProfile] = useState({
    municipalityId: 'MUN-4001',
    departmentName: 'Department of Municipal Administration & Public Works',
    authorizedOfficer: 'Officer R. Vance',
    designation: 'Zone 4 Operations Chief',
    email: 'admin@ecoconnect.local',
    phone: '+91 11 2345 6789',
    zone: 'Zone 4 / Central Command',
    ward: 'Sector 14 Central',
    officeAddress: 'Civic Centre, Minto Road, New Delhi',
    city: 'New Delhi',
    state: 'Delhi NCR',
    pincode: '110002',
    clearanceLevel: 'Level 5 Admin Clearance (Active)',
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
          municipalityId: u._id ? `MUN-${u._id.slice(-4).toUpperCase()}` : 'MUN-4001',
          departmentName: u.department || u.companyName || 'Department of Municipal Administration & Public Works',
          authorizedOfficer: u.name || 'Officer R. Vance',
          designation: u.designation || 'Zone 4 Operations Chief',
          email: u.email || 'admin@ecoconnect.local',
          phone: u.phone || '+91 11 2345 6789',
          zone: u.zone || u.ward || 'Zone 4 / Central Command',
          ward: u.ward || 'Sector 14 Central',
          officeAddress: u.officeAddress || u.address || 'Civic Centre, Minto Road',
          city: u.city || 'New Delhi',
          state: u.state || 'Delhi NCR',
          pincode: u.pincode || '110002',
          clearanceLevel: 'Level 5 Admin Clearance (Active)',
        };
        setProfile(loaded);
        setOriginalProfile(loaded);
      }
    } catch (err) {
      console.error('Failed to load municipal profile:', err);
      setError(err.message || 'Unable to load municipal profile');
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
        municipalityId: user._id ? `MUN-${user._id.slice(-4).toUpperCase()}` : prev.municipalityId,
        departmentName: user.department || user.companyName || prev.departmentName,
        authorizedOfficer: user.name || user.contactPerson || prev.authorizedOfficer,
        designation: user.designation || prev.designation,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        zone: user.zone || user.ward || prev.zone,
        ward: user.ward || prev.ward,
        officeAddress: user.officeAddress || user.address || prev.officeAddress,
        city: user.city || prev.city,
        state: user.state || prev.state,
        pincode: user.pincode || prev.pincode,
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
        name: profile.authorizedOfficer,
        contactPerson: profile.authorizedOfficer,
        designation: profile.designation,
        phone: profile.phone,
        department: profile.departmentName,
        companyName: profile.departmentName,
        ward: profile.ward,
        zone: profile.zone,
        officeAddress: profile.officeAddress,
        address: profile.officeAddress,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
      };

      const res = await (updateProfile ? updateProfile(payload) : api.auth.updateProfile(payload));
      if (res?.user) {
        if (setUser) setUser(res.user);
        setOriginalProfile({ ...profile });
      }

      setSavedSuccess(true);
      setIsEditing(false);
      if (onShowToast) {
        onShowToast('Municipality profile details updated successfully in database!');
      }
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Could not save municipal profile:', err);
      setError(err.message || 'Failed to update municipality profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading municipal credentials and office profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-black text-slate-800">Municipality Profile</h2>
          </div>
          <p className="text-sm text-slate-500">
            Official department credentials, jurisdictional parameters, and designated officer profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1.5 text-xs font-bold text-blue-900 ring-1 ring-blue-300">
            <ShieldCheck className="h-4 w-4 text-blue-700" />
            Verified Municipal Authority
          </span>

          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 shadow-sm transition-all active:scale-[0.98]"
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
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white font-black text-2xl shadow-inner ring-2 ring-white/20 shrink-0">
              <Landmark className="h-8 w-8 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black">{profile.departmentName}</h3>
              </div>
              <p className="text-xs text-blue-100 font-medium mt-0.5">
                {profile.zone} • Environmental & Sanitation Wing
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-blue-200">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" /> Municipality ID: <strong className="text-white font-mono">{profile.municipalityId}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award className="h-3 w-3" /> Zone 4 Operations Command
                </span>
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-blue-700/60 sm:pl-6">
            <p className="text-[10px] uppercase font-bold text-blue-200">System Clearance</p>
            <p className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Officer Authorized
            </p>
            <p className="text-[10px] text-blue-200 font-medium mt-1">{profile.clearanceLevel}</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-7">
          {/* Section 1: Department Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileCheck className="h-3.5 w-3.5 text-blue-600" />
              Municipal Department Identity
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Municipality ID (Read-only, protected) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Municipality ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="municipalityId"
                    value={profile.municipalityId}
                    disabled
                    readOnly
                    className="w-full rounded-xl bg-slate-100 border border-slate-200 px-4 py-2.5 text-sm font-mono font-bold text-slate-500 cursor-not-allowed shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-800">
                      SYSTEM LOCKED
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">State Urban Local Body Registration ID</p>
              </div>

              {/* Department Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Municipality / Department Name
                </label>
                <input
                  type="text"
                  name="departmentName"
                  value={profile.departmentName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-blue-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Operational Service Zone
                </label>
                <input
                  type="text"
                  name="zone"
                  value={profile.zone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-blue-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Primary Ward */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Headquarters Ward / Sector
                </label>
                <input
                  type="text"
                  name="ward"
                  value={profile.ward}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-blue-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Designated Officer Profile */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-blue-600" />
              Designated Officer & Contact Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Authorized Officer Name
                </label>
                <input
                  type="text"
                  name="authorizedOfficer"
                  value={profile.authorizedOfficer}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-blue-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Designation / Role
                </label>
                <input
                  type="text"
                  name="designation"
                  value={profile.designation}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-blue-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Official Email (System Account)
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
                  Direct Contact Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-blue-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Headquarters Office Location */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              Municipal Office Location
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Headquarters Street Address
                </label>
                <input
                  type="text"
                  name="officeAddress"
                  value={profile.officeAddress}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-blue-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400'
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
                      ? 'bg-white border-blue-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  State / Territory
                </label>
                <input
                  type="text"
                  name="state"
                  value={profile.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-blue-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Postal Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={profile.pincode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all shadow-sm ${
                    isEditing
                      ? 'bg-white border-blue-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {savedSuccess ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Municipal profile updated and saved to database!
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                {isEditing ? 'Saved updates immediately synchronize with your public municipal dispatches.' : 'Credentials authenticated through EcoCivic Urban Management Network.'}
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
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
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
