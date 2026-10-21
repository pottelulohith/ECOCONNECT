import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  AlertCircle,
  Building2,
  Key,
  Truck,
  Loader2,
  Package,
  Scale,
} from 'lucide-react';
import { api } from '../api/client';
import { formatDate } from '../utils/dateFormat';

export default function IndustryOrders() {
  const [subTab, setSubTab] = useState('requests'); // 'requests' | 'loading'
  const [orders, setOrders] = useState([]);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Loading OTP verification states
  const [otpForm, setOtpForm] = useState({ otp: '', actualLoadedKg: '' });
  const [verifyingId, setVerifyingId] = useState(null);
  const [verifyError, setVerifyError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    api.municipality
      .getPurchaseRequests()
      .then((res) => {
        if (res?.orders) {
          const mapped = res.orders.map((o) => ({
            _id: o._id,
            id: o.id,
            industryName: o.company || 'Industry Partner',
            plasticType: o.polymer,
            quantity: o.quantity || `${o.quantityKg} kg`,
            status:
              o.status === 'Approved'
                ? 'Approved'
                : o.status === 'Fulfilled' || o.status === 'Delivered'
                ? 'Delivered'
                : o.status === 'Rejected' || o.status === 'Denied'
                ? 'Denied'
                : 'Pending',
            rate: o.rate,
            total: o.total,
          }));
          setOrders(mapped);
        }
      })
      .catch((err) => console.warn('Could not load purchase requests:', err))
      .finally(() => setLoading(false));
  }, []);

  const fetchDeliveryOrders = useCallback(() => {
    api.municipality
      .getOrders()
      .then((res) => {
        if (res?.orders) {
          setDeliveryOrders(res.orders);
        }
      })
      .catch((err) => console.warn('Could not load delivery orders:', err));
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchDeliveryOrders();
  }, [fetchOrders, fetchDeliveryOrders]);

  const handleOpenConfirm = (order, action) => {
    setConfirmDialog({ order, action });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog(null);
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    const { order, action } = confirmDialog;

    try {
      if (action === 'Approve') {
        const res = await api.municipality.approveOrder(order._id);
        setToastMessage(res.message || `Order ${order.id} approved!`);
      } else {
        const res = await api.municipality.rejectOrder(order._id, 'Municipal stock unavailable');
        setToastMessage(res.message || `Order ${order.id} rejected.`);
      }
      setTimeout(() => setToastMessage(null), 4000);
      fetchOrders();
      fetchDeliveryOrders();
    } catch (err) {
      console.error('Error updating order:', err);
      const newStatus = action === 'Approve' ? 'Approved' : 'Denied';
      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id ? { ...item, status: newStatus } : item
        )
      );
    }

    setConfirmDialog(null);
  };

  const handleVerifyLoadingOtp = async (orderId) => {
    if (!otpForm.otp || !otpForm.actualLoadedKg || Number(otpForm.actualLoadedKg) <= 0) {
      setVerifyError('Please enter OTP and valid loaded weight');
      return;
    }
    setVerifyingId(orderId);
    setVerifyError('');
    try {
      const res = await api.municipality.verifyLoadingOtp(orderId, {
        otp: otpForm.otp,
        actualLoadedKg: Number(otpForm.actualLoadedKg),
      });
      setToastMessage(res.message || 'Loading OTP verified successfully!');
      setTimeout(() => setToastMessage(null), 4000);
      setOtpForm({ otp: '', actualLoadedKg: '' });
      setExpandedOrder(null);
      fetchDeliveryOrders();
    } catch (err) {
      setVerifyError(err.message || 'Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.industryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.plasticType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;

  // Filter delivery orders for loading verification
  const awaitingLoading = deliveryOrders.filter(
    (o) => o.status === 'Truck Dispatched' && o.loadingOtp?.generatedAt && !o.loadingOtp?.verified
  );
  const recentlyVerified = deliveryOrders.filter(
    (o) => o.loadingOtp?.verified
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[120] max-w-md animate-slide-up rounded-2xl bg-slate-900 text-white p-4 shadow-2xl border border-blue-500/50 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-black text-slate-800">Industry Orders</h2>
          </div>
          <p className="text-sm text-slate-500">
            Manage purchase requests and verify loading operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200/60">
            <Clock className="h-3 w-3" />
            {pendingCount} Pending
          </span>
          {awaitingLoading.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 ring-1 ring-violet-200/60">
              <Key className="h-3 w-3" />
              {awaitingLoading.length} Awaiting Loading
            </span>
          )}
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search orders…"
              className="w-full rounded-xl bg-white border border-slate-200 pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setSubTab('requests')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
            subTab === 'requests'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Purchase Requests
        </button>
        <button
          onClick={() => setSubTab('loading')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
            subTab === 'loading'
              ? 'bg-white text-violet-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Key className="h-3.5 w-3.5" />
          Loading Verification
          {awaitingLoading.length > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[10px] font-black text-violet-700">
              {awaitingLoading.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Purchase Requests Tab ─────────────────────────────────────── */}
      {subTab === 'requests' && (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          {loading && orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading industry purchase requests...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No industry orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                      Order ID
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                      Industry Buyer
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                      Plastic Polymer
                    </th>
                    <th className="px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                      Quantity Required
                    </th>
                    <th className="px-5 py-3.5 text-right text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-blue-700 text-xs">
                          {order.id}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 text-xs font-bold shrink-0 ring-1 ring-blue-200/60">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-slate-800 text-xs">
                            {order.industryName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200">
                          {order.plasticType}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-800 text-xs tabular-nums">
                          {order.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {order.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenConfirm(order, 'Approve')}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm shadow-emerald-600/20 hover:shadow-md hover:shadow-emerald-600/25 transition-all active:scale-[0.97] cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenConfirm(order, 'Deny')}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-700 transition-all active:scale-[0.97] cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                              Deny
                            </button>
                          </div>
                        ) : order.status === 'Approved' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Approved
                          </span>
                        ) : order.status === 'Delivered' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-blue-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200">
                            <XCircle className="h-3 w-3" />
                            Denied
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Loading Verification Tab ──────────────────────────────────── */}
      {subTab === 'loading' && (
        <div className="space-y-4">
          {/* Awaiting Loading Verification */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Key className="h-4 w-4 text-violet-600" />
              Awaiting Loading Verification
            </h3>

            {awaitingLoading.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200/80 p-10 text-center">
                <Key className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No orders awaiting loading verification</p>
                <p className="text-xs text-slate-400 mt-1">
                  Industry partners will generate loading OTPs when their trucks arrive for loading.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {awaitingLoading.map((order) => {
                  const isExpanded = expandedOrder === order._id;
                  return (
                    <div
                      key={order._id}
                      className="rounded-2xl bg-white border border-violet-200/80 shadow-sm overflow-hidden"
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-violet-50/30 transition-colors"
                        onClick={() => {
                          setExpandedOrder(isExpanded ? null : order._id);
                          setOtpForm({ otp: '', actualLoadedKg: '' });
                          setVerifyError('');
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 ring-1 ring-violet-200/80 shrink-0">
                            <Truck className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-extrabold text-slate-900">{order.id}</span>
                              <span className="inline-flex items-center rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800 ring-1 ring-violet-200">
                                {order.polymer?.split(' ')[0]} • {order.quantity}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                              {order.industry && (
                                <span>Industry: <strong className="text-slate-600">{order.industry.name}</strong></span>
                              )}
                              <span>•</span>
                              <span>Vehicle: <strong className="text-slate-600">{order.vehicleNo || 'N/A'}</strong></span>
                              <span>•</span>
                              <span>Driver: <strong className="text-slate-600">{order.driverName || 'N/A'}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-200">
                            <Key className="h-3 w-3" />
                            OTP Ready
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-violet-100 p-4 bg-violet-50/30">
                          <div className="rounded-xl bg-white border border-violet-200 p-4 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Key className="h-4 w-4 text-violet-600" />
                              <span className="text-sm font-bold text-slate-800">Verify Loading OTP</span>
                            </div>

                            <p className="text-xs text-slate-500">
                              Enter the 6-digit OTP provided by the industry partner and the actual loaded weight.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Loading OTP</label>
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={otpForm.otp}
                                  onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value.replace(/\D/g, '') })}
                                  placeholder="Enter 6-digit OTP"
                                  className="w-full rounded-lg border border-violet-200 px-3 py-2.5 text-center text-lg font-mono font-bold tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-violet-400"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                                  Actual Loaded Weight (kg)
                                </label>
                                <div className="relative">
                                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                  <input
                                    type="number"
                                    value={otpForm.actualLoadedKg}
                                    onChange={(e) => setOtpForm({ ...otpForm, actualLoadedKg: e.target.value })}
                                    placeholder={`Requested: ${order.quantityKg} kg`}
                                    className="w-full rounded-lg border border-violet-200 pl-9 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-400"
                                  />
                                </div>
                              </div>
                              <div className="flex items-end">
                                <button
                                  onClick={() => handleVerifyLoadingOtp(order._id)}
                                  disabled={verifyingId === order._id || otpForm.otp.length !== 6 || !otpForm.actualLoadedKg}
                                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {verifyingId === order._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                  Verify & Load
                                </button>
                              </div>
                            </div>

                            {verifyError && (
                              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                <span>{verifyError}</span>
                              </div>
                            )}

                            <div className="border-t border-slate-100 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div>
                                <span className="text-slate-400 font-medium">Driver</span>
                                <p className="font-semibold text-slate-800 mt-0.5">{order.driverName || '—'}</p>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium">Phone</span>
                                <p className="font-semibold text-slate-800 mt-0.5">{order.driverPhone || '—'}</p>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium">Vehicle</span>
                                <p className="font-mono font-bold text-slate-800 mt-0.5">{order.vehicleNo || '—'}</p>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium">OTP Generated</span>
                                <p className="font-semibold text-slate-800 mt-0.5">
                                  {order.loadingOtp?.generatedAt
                                    ? `${formatDate(order.loadingOtp.generatedAt)} ${new Date(order.loadingOtp.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : '—'}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  Attempts: {order.loadingOtp?.attempts || 0}/{order.loadingOtp?.maxAttempts || 5}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recently Verified */}
          {recentlyVerified.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Recently Verified
              </h3>
              <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="px-5 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Order</th>
                        <th className="px-5 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Polymer</th>
                        <th className="px-5 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Loaded</th>
                        <th className="px-5 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Vehicle</th>
                        <th className="px-5 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                        <th className="px-5 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Verified At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentlyVerified.slice(0, 10).map((order) => (
                        <tr key={order._id} className="hover:bg-green-50/30 transition-colors">
                          <td className="px-5 py-3">
                            <span className="font-mono font-bold text-blue-700 text-xs">{order.id}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-semibold text-slate-700">{order.polymer?.split(' ')[0]}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-bold text-slate-800">{order.actualLoadedKg || '—'} kg</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-mono text-slate-600">{order.vehicleNo || '—'}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              order.status === 'Delivered'
                                ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                                : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                            }`}>
                              {order.status === 'Delivered' ? <CheckCircle2 className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs text-slate-500">
                              {order.loadingOtp?.verifiedAt
                                ? `${formatDate(order.loadingOtp.verifiedAt)} ${new Date(order.loadingOtp.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  confirmDialog.action === 'Approve'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {confirmDialog.action} Order?
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {confirmDialog.order.id} • {confirmDialog.order.industryName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              {confirmDialog.action === 'Approve'
                ? `Confirming this order will create a delivery record for ${confirmDialog.order.quantity} of ${confirmDialog.order.plasticType}. The industry can then dispatch a truck for loading.`
                : `Are you sure you want to deny this request from ${confirmDialog.order.industryName}?`}
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCloseConfirm}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer ${
                  confirmDialog.action === 'Approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                }`}
              >
                Confirm {confirmDialog.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
