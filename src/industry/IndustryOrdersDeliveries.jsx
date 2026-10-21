import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Search,
  ChevronDown,
  ChevronRight,
  Navigation,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Calendar,
  User,
  Shield,
  ArrowRight,
  ArrowLeftRight,
  ExternalLink,
  X,
  Compass,
  Copy,
  Check,
  Edit3,
  Save,
  Key,
  AlertCircle,
  Loader2,
  RefreshCw,
  Hash,
  Phone,
  FileText,
  Circle,
} from 'lucide-react';
import { api } from '../api/client';
import { formatDate } from '../utils/dateFormat';

// ─── 5 Progress Steps ────────────────────────────────────────────────────
const STEP_LABELS = [
  'Request Sent',
  'Request Approved',
  'Truck Dispatched',
  'Loading OTP',
  'Return to Industry',
];

export default function IndustryOrdersDeliveries() {
  const [shipments, setShipments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Driver edit states
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverForm, setDriverForm] = useState({ driverName: '', driverPhone: '', vehicleNo: '' });
  const [driverSaving, setDriverSaving] = useState(false);
  const [driverError, setDriverError] = useState('');

  // OTP states
  const [otpLoading, setOtpLoading] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(null);

  // Action loading
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState('');

  // Simple delivery confirmation state (no OTP required)
  const [deliveryForm, setDeliveryForm] = useState({});
  const [deliveryVerifying, setDeliveryVerifying] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.industry.getOrders();
      if (res?.shipments) {
        setShipments(res.shipments);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Filter ──────────────────────────────────────────────────────────────
  const filtered = shipments.filter((s) => {
    if (statusFilter && s.status !== statusFilter) return false;
    if (
      searchTerm &&
      !s.id?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !s.polymer?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(s.vehicleNo || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  // ── Handlers ────────────────────────────────────────────────────────────
  const startEditDriver = (s) => {
    setEditingDriver(s._id);
    setDriverForm({
      driverName: s.driverName || '',
      driverPhone: s.driverPhone || '',
      vehicleNo: s.vehicleNo || '',
    });
    setDriverError('');
  };

  const saveDriverDetails = async (orderId) => {
    setDriverSaving(true);
    setDriverError('');
    try {
      await api.industry.updateDriver(orderId, driverForm);
      setEditingDriver(null);
      await fetchOrders();
    } catch (err) {
      setDriverError(err.message || 'Failed to update');
    } finally {
      setDriverSaving(false);
    }
  };

  const handleDispatch = async (orderId) => {
    setActionLoading(orderId);
    setActionError('');
    try {
      await api.industry.dispatchTruck(orderId);
      await fetchOrders();
    } catch (err) {
      setActionError(err.message || 'Failed to dispatch');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateLoadingOtp = async (orderId) => {
    setOtpLoading(true);
    setActionError('');
    try {
      await api.industry.generateLoadingOtp(orderId);
      await fetchOrders();
    } catch (err) {
      setActionError(err.message || 'Failed to generate OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Simple delivery confirmation without requiring OTP
  const handleConfirmDelivery = async (shipment) => {
    setDeliveryVerifying(shipment._id);
    setActionError('');
    try {
      const formVal = deliveryForm[shipment._id] || {};
      const deliveredKg = formVal.actualDeliveredKg || shipment.actualLoadedKg || shipment.quantityKg;
      await api.industry.verifyDelivery(shipment._id, {
        actualDeliveredKg: deliveredKg,
        reconciliationNotes: formVal.notes || '',
      });
      await fetchOrders();
    } catch (err) {
      setActionError(err.message || 'Failed to confirm delivery');
    } finally {
      setDeliveryVerifying(null);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedOtp(id);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  // ── Status badge ────────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const styles = {
      Processing: 'bg-slate-100 text-slate-700 ring-slate-200',
      Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      'Truck Dispatched': 'bg-blue-50 text-blue-700 ring-blue-200',
      'Loading OTP Verified': 'bg-violet-50 text-violet-700 ring-violet-200',
      'In Transit': 'bg-amber-50 text-amber-800 ring-amber-200',
      Delivered: 'bg-green-50 text-green-800 ring-green-200',
      Cancelled: 'bg-red-50 text-red-700 ring-red-200',
    };
    const pulse = ['In Transit', 'Truck Dispatched'].includes(status);
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${styles[status] || styles.Processing}`}>
        {pulse && <span className="h-2 w-2 rounded-full bg-current animate-pulse" />}
        {status}
      </span>
    );
  };

  // ── Progress Steps (5 steps) ────────────────────────────────────────────
  const renderProgressSteps = (steps) => {
    const displaySteps = steps && steps.length > 0 ? steps : STEP_LABELS.map((l, i) => ({ step: i + 1, label: l, completed: false, current: i === 0 }));

    return (
      <div className="flex items-center justify-between gap-0">
        {displaySteps.map((s, i) => {
          const isDone = s.completed;
          const isCurrent = s.current;
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center text-center min-w-[60px]">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                    isDone
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                      : isCurrent
                      ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400 animate-pulse'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : s.step}
                </div>
                <span className={`mt-1.5 text-[10px] font-semibold leading-tight max-w-[70px] ${isDone ? 'text-amber-800' : isCurrent ? 'text-amber-700' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < displaySteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full ${isDone ? 'bg-amber-400' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // ── Trip Card ───────────────────────────────────────────────────────────
  const renderTripCard = (trip, label, tripNum, isLocked = false) => {
    if (!trip) return null;
    const statusColors = {
      Pending: 'bg-slate-100 text-slate-600',
      'In Transit': 'bg-blue-100 text-blue-800',
      Arrived: 'bg-amber-100 text-amber-800',
      Completed: 'bg-green-100 text-green-800',
    };
    return (
      <div className={`rounded-xl border p-4 transition-all ${
        isLocked ? 'bg-slate-50 border-slate-200 opacity-60' : 
        trip.status === 'Completed' ? 'bg-green-50/50 border-green-200' :
        trip.status === 'In Transit' ? 'bg-blue-50/50 border-blue-200' :
        'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
              trip.status === 'Completed' ? 'bg-green-500 text-white' :
              trip.status === 'In Transit' ? 'bg-blue-500 text-white' :
              'bg-slate-300 text-white'
            }`}>
              {tripNum}
            </span>
            <span className="text-xs font-bold text-slate-800">Trip {tripNum}: {label}</span>
          </div>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColors[trip.status] || statusColors.Pending}`}>
            {isLocked ? '🔒 Locked' : trip.status}
          </span>
        </div>
        {trip.startedAt && (
          <p className="text-[11px] text-slate-500">Started: {new Date(trip.startedAt).toLocaleString()}</p>
        )}
        {trip.completedAt && (
          <p className="text-[11px] text-green-700 font-medium">Completed: {new Date(trip.completedAt).toLocaleString()}</p>
        )}
        {isLocked && (
          <p className="text-[11px] text-slate-400 mt-1 italic">Loading verification required before Trip 2 can start.</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-3 text-sm text-slate-500">Loading orders…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-black text-slate-800">Orders & Deliveries</h2>
          </div>
          <p className="text-sm text-slate-500">
            Manage truck dispatch, loading OTP, and delivery verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-xs font-medium transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-lg bg-white border border-slate-200 pl-3 pr-8 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm cursor-pointer"
            >
              <option value="">All Shipments</option>
              <option value="Approved">Approved</option>
              <option value="Truck Dispatched">Truck Dispatched</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search order ID…"
              className="w-full rounded-xl bg-white border border-slate-200 pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Action Error */}
      {actionError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="ml-auto text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Shipment Cards */}
      <div className="space-y-5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200/80 p-12 text-center text-slate-400">
            <Truck className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-600">No orders found</p>
            <p className="text-xs text-slate-400 mt-1">
              Submit purchase requests and get them approved to see orders here.
            </p>
          </div>
        ) : (
          filtered.map((shipment) => {
            const isExpanded = expandedId === shipment._id;
            const hasDriver = shipment.driverName && shipment.driverPhone && shipment.vehicleNo;
            const canDispatch = shipment.status === 'Approved' && hasDriver;
            const canGenerateLoadingOtp = shipment.status === 'Truck Dispatched' && !shipment.loadingOtp?.verified;
            const loadingOtpGenerated = shipment.loadingOtp?.otpPlain && !shipment.loadingOtp?.verified;
            const loadingVerified = shipment.loadingOtp?.verified;
            const canConfirmDelivery = loadingVerified && shipment.status === 'In Transit';
            const trip2Locked = !loadingVerified;

            return (
              <div
                key={shipment._id}
                className="rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Card Header */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : shipment._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-200/80 shrink-0">
                      <Truck className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-slate-900">
                          {shipment.id}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 ring-1 ring-amber-300/80">
                          {shipment.polymer?.split(' ')[0]} • {shipment.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span>
                          Amount: <strong className="text-slate-600">₹{(shipment.totalAmount || 0).toLocaleString('en-IN')}</strong>
                        </span>
                        <span>•</span>
                        <span>Created: <strong className="text-slate-600">{formatDate(shipment.createdAt)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(shipment.status)}
                    <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 sm:p-6 space-y-6">
                    {/* ─── 5-Step Progress ─────────────────────────────────── */}
                    <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Compass className="h-4 w-4 text-amber-700" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Shipment Journey Progress
                        </span>
                      </div>
                      {renderProgressSteps(shipment.progressSteps)}
                    </div>

                    {/* ─── Trip Cards ──────────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderTripCard(shipment.trip1, shipment.trip1?.label || 'Industry → Municipality', 1)}
                      {renderTripCard(shipment.trip2, shipment.trip2?.label || 'Municipality → Industry', 2, trip2Locked)}
                    </div>

                    {/* ─── Driver & Truck Details (Editable) ──────────────── */}
                    <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-600" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Driver & Truck Details
                          </span>
                        </div>
                        {shipment.status !== 'Delivered' && editingDriver !== shipment._id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); startEditDriver(shipment); }}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1.5 text-[11px] font-bold transition-colors"
                          >
                            <Edit3 className="h-3 w-3" />
                            Edit
                          </button>
                        )}
                      </div>

                      {editingDriver === shipment._id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Driver Name</label>
                              <input
                                type="text"
                                value={driverForm.driverName}
                                onChange={(e) => setDriverForm({ ...driverForm, driverName: e.target.value })}
                                placeholder="Enter driver name"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Driver Mobile</label>
                              <input
                                type="text"
                                value={driverForm.driverPhone}
                                onChange={(e) => setDriverForm({ ...driverForm, driverPhone: e.target.value })}
                                placeholder="+91 XXXXX XXXXX"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Truck Registration</label>
                              <input
                                type="text"
                                value={driverForm.vehicleNo}
                                onChange={(e) => setDriverForm({ ...driverForm, vehicleNo: e.target.value })}
                                placeholder="XX-00-XX-0000"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                              />
                            </div>
                          </div>
                          {driverError && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {driverError}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveDriverDetails(shipment._id)}
                              disabled={driverSaving}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              {driverSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                              Save Details
                            </button>
                            <button
                              onClick={() => setEditingDriver(null)}
                              className="rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 text-xs font-bold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 font-medium">Driver</span>
                            <p className="font-semibold text-slate-800 mt-0.5">{shipment.driverName || '—'}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Phone</span>
                            <p className="font-semibold text-slate-800 mt-0.5">{shipment.driverPhone || '—'}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Vehicle No.</span>
                            <p className="font-mono font-bold text-slate-800 mt-0.5">{shipment.vehicleNo || '—'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ─── Dispatch Button ─────────────────────────────────── */}
                    {shipment.status === 'Approved' && (
                      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-blue-900">Ready to Dispatch</p>
                            <p className="text-xs text-blue-700 mt-0.5">
                              {hasDriver
                                ? 'Driver and truck details are set. You can dispatch the truck now.'
                                : 'Please set driver name, phone, and vehicle number first.'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDispatch(shipment._id)}
                            disabled={!canDispatch || actionLoading === shipment._id}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === shipment._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Truck className="h-4 w-4" />
                            )}
                            Dispatch Truck
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ─── Loading OTP Section ─────────────────────────────── */}
                    {(shipment.status === 'Truck Dispatched' || loadingOtpGenerated || loadingVerified) && (
                      <div className={`rounded-xl border p-4 ${
                        loadingVerified ? 'bg-green-50 border-green-200' : 'bg-violet-50 border-violet-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Key className="h-4 w-4 text-violet-600" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Loading OTP {loadingVerified ? '✓ Verified' : ''}
                          </span>
                        </div>

                        {loadingVerified ? (
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="font-bold">Loading OTP verified by Municipality</span>
                            </div>
                            <p className="text-slate-600">
                              Actual loaded weight: <strong>{shipment.actualLoadedKg} kg</strong>
                              {shipment.actualLoadedKg !== shipment.quantityKg && (
                                <span className="ml-2 text-amber-700">(requested: {shipment.quantityKg} kg)</span>
                              )}
                            </p>
                            {shipment.loadingOtp?.verifiedAt && (
                              <p className="text-slate-500">Verified at: {new Date(shipment.loadingOtp.verifiedAt).toLocaleString()}</p>
                            )}
                          </div>
                        ) : loadingOtpGenerated ? (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-600">
                              Share this OTP with the Municipality officer at the loading point.
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="inline-flex items-center gap-2 rounded-lg bg-white border-2 border-violet-300 px-4 py-2.5">
                                <span className="font-mono text-2xl font-black text-violet-900 tracking-[0.3em]">
                                  {shipment.loadingOtp.otpPlain}
                                </span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(shipment.loadingOtp.otpPlain, `loading-${shipment._id}`)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-800 px-3 py-2.5 text-xs font-bold transition-colors"
                              >
                                {copiedOtp === `loading-${shipment._id}` ? (
                                  <><Check className="h-3.5 w-3.5" /> Copied!</>
                                ) : (
                                  <><Copy className="h-3.5 w-3.5" /> Copy OTP</>
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-4 text-[11px] text-slate-500">
                              <span>Expires: {new Date(shipment.loadingOtp.expiresAt).toLocaleString()}</span>
                              <span>•</span>
                              <span>Attempts: {shipment.loadingOtp.attempts}/{shipment.loadingOtp.maxAttempts}</span>
                            </div>
                          </div>
                        ) : canGenerateLoadingOtp ? (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-600">
                              Generate a secure 6-digit OTP for Municipality to verify loading.
                            </p>
                            <button
                              onClick={() => handleGenerateLoadingOtp(shipment._id)}
                              disabled={otpLoading}
                              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                              Generate Loading OTP
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* ─── Delivery Section (Simple, No OTP Required) ────── */}
                    {(canConfirmDelivery || shipment.status === 'Delivered') && (
                      <div className={`rounded-xl border p-4 ${
                        shipment.status === 'Delivered' ? 'bg-green-50 border-green-200' : 'bg-emerald-50 border-emerald-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Delivery Status {shipment.status === 'Delivered' ? '✓ Received & Completed' : ''}
                          </span>
                        </div>

                        {shipment.status === 'Delivered' ? (
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="font-bold">Shipment delivered & verified at industry gate</span>
                            </div>
                            {shipment.actualDeliveredKg != null && (
                              <p className="text-slate-600">
                                Delivered weight: <strong>{shipment.actualDeliveredKg} kg</strong>
                              </p>
                            )}
                            {shipment.reconciliation?.weightDiffKg != null && (
                              <p className="text-slate-600">
                                Weight difference: <strong className={shipment.reconciliation.weightDiffKg === 0 ? 'text-green-700' : 'text-amber-700'}>
                                  {shipment.reconciliation.weightDiffKg >= 0 ? '+' : ''}{shipment.reconciliation.weightDiffKg} kg
                                </strong>
                              </p>
                            )}
                          </div>
                        ) : canConfirmDelivery ? (
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                Vehicle In Transit to Industry
                              </p>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Verified loaded weight from municipality: <strong>{shipment.actualLoadedKg || shipment.quantityKg} kg</strong>. Confirm arrival below once the truck arrives.
                              </p>
                            </div>

                            {/* Simple delivery confirmation form without requiring an OTP */}
                            <div className="pt-2 border-t border-emerald-200 flex flex-wrap items-center gap-3">
                              <div className="flex-1 min-w-[180px]">
                                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                                  Delivered Weight (kg)
                                </label>
                                <input
                                  type="number"
                                  value={deliveryForm[shipment._id]?.actualDeliveredKg ?? (shipment.actualLoadedKg || shipment.quantityKg || '')}
                                  onChange={(e) => setDeliveryForm({
                                    ...deliveryForm,
                                    [shipment._id]: {
                                      ...deliveryForm[shipment._id],
                                      actualDeliveredKg: e.target.value,
                                    }
                                  })}
                                  placeholder="e.g. 500"
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                />
                              </div>

                              <div className="flex items-end">
                                <button
                                  onClick={() => handleConfirmDelivery(shipment)}
                                  disabled={deliveryVerifying === shipment._id}
                                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                  {deliveryVerifying === shipment._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                  Confirm Delivery
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* ─── Delivery & Reconciliation Panel ─────────────────── */}
                    {shipment.status === 'Delivered' && shipment.reconciliation && (
                      <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="h-4 w-4 text-green-700" />
                          <span className="text-xs font-bold uppercase tracking-wider text-green-800">
                            Delivery & Quantity Reconciliation
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500">Requested</span>
                            <p className="font-bold text-slate-800">{shipment.quantityKg} kg</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Loaded</span>
                            <p className="font-bold text-slate-800">{shipment.actualLoadedKg || '—'} kg</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Delivered</span>
                            <p className="font-bold text-slate-800">{shipment.actualDeliveredKg || '—'} kg</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Difference</span>
                            <p className={`font-bold ${(shipment.reconciliation.weightDiffKg || 0) === 0 ? 'text-green-700' : 'text-amber-700'}`}>
                              {(shipment.reconciliation.weightDiffKg || 0) >= 0 ? '+' : ''}
                              {shipment.reconciliation.weightDiffKg || 0} kg
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ─── Timeline Events ─────────────────────────────────── */}
                    {shipment.timeline && shipment.timeline.length > 0 && (
                      <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-slate-600" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Timeline Events
                          </span>
                        </div>
                        <div className="space-y-3">
                          {shipment.timeline.map((evt, i) => (
                            <div key={i} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`h-2.5 w-2.5 rounded-full mt-1 ${
                                  i === shipment.timeline.length - 1 ? 'bg-amber-500' : 'bg-slate-300'
                                }`} />
                                {i < shipment.timeline.length - 1 && (
                                  <div className="w-px flex-1 bg-slate-200 my-1" />
                                )}
                              </div>
                              <div className="pb-2">
                                <p className="text-xs font-bold text-slate-800">{evt.event}</p>
                                <p className="text-[11px] text-slate-500">{evt.description}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {formatDate(evt.timestamp)} {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {evt.actor} ({evt.actorRole})
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ─── Destination & Info Grid ─────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3.5">
                        <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
                          <MapPin className="h-3.5 w-3.5 text-amber-600" />
                          <span>Destination</span>
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          {shipment.destination || 'Not set'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3.5">
                        <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
                          <Calendar className="h-3.5 w-3.5 text-amber-600" />
                          <span>ETA</span>
                        </div>
                        <p className="font-semibold text-slate-800">
                          {shipment.eta || 'Pending dispatch'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
