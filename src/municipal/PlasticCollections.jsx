import React, { useState, useEffect } from 'react';
import {
  Scale,
  MapPin,
  Clock,
  User,
  BadgeCheck,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Calendar,
  CalendarCheck,
  AlertCircle,
  Save,
  RefreshCw,
} from 'lucide-react';
import VerifyWeightModal from './VerifyWeightModal';
import { api } from '../api/client';
import { formatDate } from '../utils/dateFormat';

export default function PlasticCollections() {
  const [queue, setQueue] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState(null);

  // ─── Pickup Schedule State ──────────────────────────────────────────────
  const [selectedWard, setSelectedWard] = useState('Sector 14');
  const [wards, setWards] = useState(['Sector 14', 'Sector 18', 'Zone 4', 'Sector 12', 'Sector 15', 'Central Command Hub']);
  const [scheduledDateInput, setScheduledDateInput] = useState('');
  const [currentScheduledDate, setCurrentScheduledDate] = useState('Not Scheduled');
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  const fetchTargets = () => {
    api.municipality
      .getPickupScheduleTargets()
      .then((res) => {
        if (res?.success) {
          const loadedWards = res.wards?.length > 0 ? res.wards : wards;
          setWards(loadedWards);
          if (loadedWards.length > 0 && !selectedWard) {
            setSelectedWard(loadedWards[0]);
          }
        }
      })
      .catch((err) => console.warn('Could not load pickup schedule targets:', err));
  };

  const fetchSchedule = (wardVal) => {
    const params = new URLSearchParams();
    params.set('targetType', 'ward');
    if (wardVal) params.set('ward', wardVal);

    api.municipality
      .getPickupSchedule(params.toString())
      .then((res) => {
        if (res?.success) {
          const dateStr = res.scheduledDate || 'Not Scheduled';
          setCurrentScheduledDate(dateStr);
          if (dateStr && dateStr !== 'Not Scheduled' && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
            const [d, m, y] = dateStr.split('-');
            setScheduledDateInput(`${y}-${m}-${d}`);
          }
        }
      })
      .catch(() => setCurrentScheduledDate('Not Scheduled'));
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  useEffect(() => {
    if (selectedWard) {
      fetchSchedule(selectedWard);
    }
  }, [selectedWard]);

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setScheduleError(null);

    if (!scheduledDateInput || !scheduledDateInput.trim()) {
      setScheduleError('Please select a valid pickup date.');
      return;
    }

    setScheduleSaving(true);
    try {
      const payload = {
        targetType: 'ward',
        ward: selectedWard,
        scheduledDate: scheduledDateInput,
      };

      const res = await api.municipality.savePickupSchedule(payload);
      setSuccessToast(res?.message || 'Pickup schedule updated successfully!');
      setTimeout(() => setSuccessToast(null), 4000);

      if (res?.schedule?.scheduledDate) {
        setCurrentScheduledDate(res.schedule.scheduledDate);
      }
      fetchQueue();
    } catch (err) {
      setScheduleError(err.message || 'Failed to save pickup schedule');
    } finally {
      setScheduleSaving(false);
    }
  };

  const fetchQueue = () => {
    setLoading(true);
    api.pickups
      .getAll()
      .then((res) => {
        if (res?.pickups) {
          setQueue(res.pickups);
        }
      })
      .catch((err) => console.warn('Could not load collections queue:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleOpenVerify = (req) => {
    setSelectedRequest(req);
    setModalOpen(true);
  };

  const handleVerify = async (requestId, payload) => {
    try {
      const res = await api.pickups.verify(requestId, payload);
      setSuccessToast(res.message || 'Weight verified and credits awarded!');
      setTimeout(() => setSuccessToast(null), 4000);
      fetchQueue();
    } catch (err) {
      console.error('Failed to verify pickup weight:', err);
    }
  };

  const filtered = queue.filter(
    (item) =>
      item.citizen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.address && item.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-[120] max-w-md animate-slide-up rounded-2xl bg-slate-900 text-white p-4 shadow-2xl border border-emerald-500/50 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{successToast}</p>
        </div>
      )}

      {/* ─── Update Pickup Schedule (DIRECTLY ABOVE the Plastic Pickup Queue heading) ─── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Update Pickup Schedule</h3>
              <p className="text-xs text-slate-400">
                Set and update doorstep plastic collection dates for wards or specific citizens.
              </p>
            </div>
          </div>

          {/* Currently Scheduled Date Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Currently Scheduled:</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                currentScheduledDate && currentScheduledDate !== 'Not Scheduled'
                  ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                  : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              {currentScheduledDate || 'Not Scheduled'}
            </span>
          </div>
        </div>

        {/* Schedule Form */}
        <form onSubmit={handleSaveSchedule} className="mt-4 space-y-3">
          {scheduleError && (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{scheduleError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {/* Ward Selector */}
            <div className="sm:col-span-5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Select Ward
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  {wards.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Picker */}
            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Pickup Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={scheduledDateInput}
                  onChange={(e) => {
                    setScheduledDateInput(e.target.value);
                    if (scheduleError) setScheduleError(null);
                  }}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={scheduleSaving}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] py-2 px-3 text-xs font-bold text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {scheduleSaving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>
                      {currentScheduledDate && currentScheduledDate !== 'Not Scheduled'
                        ? 'Update Schedule'
                        : 'Save Schedule'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-black text-slate-800">Plastic Pickup Queue</h2>
          </div>
          <p className="text-sm text-slate-500">
            Incoming citizen collections requiring verification, scale weighing, and credit disbursement.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search citizen or ID…"
            className="w-full rounded-xl bg-white border border-slate-200 pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        {loading && queue.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading pickup queue...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No pickup requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Request ID</th>
                  <th className="px-5 py-4">Citizen & Address</th>
                  <th className="px-5 py-4">Pickup Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Verified Weight</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-blue-700">{item.id}</td>
                    <td className="px-5 py-4">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{item.citizen}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>{item.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ${
                          item.verified || item.status === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : 'bg-amber-50 text-amber-700 ring-amber-200'
                        }`}
                      >
                        {item.verified || item.status === 'Verified' ? 'Verified & Credited' : 'Pending Weighing'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">
                        {item.weight || item.verifiedWeight || 'Awaiting scale'}
                      </div>
                      {item.reward && (
                        <span className="text-[10px] font-bold text-emerald-600">{item.reward}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {item.verified || item.status === 'Verified' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <BadgeCheck className="h-4 w-4" />
                          Complete
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenVerify(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.97] cursor-pointer"
                        >
                          <Scale className="h-3.5 w-3.5" />
                          Weigh & Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verify Weight Modal */}
      <VerifyWeightModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        request={selectedRequest}
        onVerify={handleVerify}
      />
    </div>
  );
}
