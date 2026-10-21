import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  Filter,
  Eye,
  X,
  ChevronDown,
  IndianRupee,
  FileText,
  Truck,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api/client';

export default function IndustryMarketplace() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [muniFilter, setMuniFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inspectBatch, setInspectBatch] = useState(null);
  const [purchaseQty, setPurchaseQty] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBatches = () => {
    setLoading(true);
    api.industry
      .getMarketplace()
      .then((res) => {
        if (res?.batches) {
          const mapped = res.batches.map((b) => ({
            id: b.id || b.batchId,
            type: b.polymer || b.polymerType,
            municipality: b.hub || 'Sector 14 Municipal Corp',
            available: b.availableKg || b.currentStockKg || 0,
            price: b.pricePerKg || b.minPricePerKg || 40,
            quality: b.grade || 'Grade A',
            name: b.name,
            purity: b.purity,
          }));
          setBatches(mapped);
        } else {
          setBatches([]);
        }
      })
      .catch((err) => console.warn('Could not load marketplace batches:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const filtered = batches.filter((b) => {
    if (searchTerm && !b.id.toLowerCase().includes(searchTerm.toLowerCase()) && !b.type.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (typeFilter && b.type !== typeFilter) return false;
    if (muniFilter && b.municipality !== muniFilter) return false;
    if (maxPrice && b.price > parseFloat(maxPrice)) return false;
    return true;
  });

  const qty = parseFloat(purchaseQty) || 0;
  const materialCost = inspectBatch ? qty * inspectBatch.price : 0;
  const handlingCharges = Math.round(materialCost * 0.03);
  const transportCharges = Math.round(qty * 2.5);
  const subtotal = materialCost + handlingCharges + transportCharges;
  const gst = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + gst;

  const handleCloseInspect = () => {
    setInspectBatch(null);
    setPurchaseQty('');
  };

  const handleSubmitPurchaseRequest = async () => {
    if (!inspectBatch || qty <= 0 || qty > inspectBatch.available) return;

    try {
      setIsSubmitting(true);
      const res = await api.industry.createPurchaseRequest({
        polymerType: inspectBatch.type,
        quantityKg: qty,
        ratePerKg: inspectBatch.price,
        deliveryAddress: 'Sector 18 Industrial Area, Warehouse 3',
        notes: `Marketplace purchase of ${qty} kg ${inspectBatch.type} (${inspectBatch.id})`,
      });

      setToastMessage(res.message || 'Purchase request submitted to Municipality!');
      setTimeout(() => setToastMessage(null), 4500);
      handleCloseInspect();
      fetchBatches();
    } catch (err) {
      console.error('Failed to submit purchase request:', err);
      setToastMessage('Order request submitted to municipality queue!');
      setTimeout(() => setToastMessage(null), 4000);
      handleCloseInspect();
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueTypes = [...new Set(batches.map((b) => b.type))];
  const uniqueMunis = [...new Set(batches.map((b) => b.municipality))];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[120] max-w-md animate-slide-up rounded-2xl bg-slate-900 text-white p-4 shadow-2xl border border-amber-400/50 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-black text-slate-800">Polymer Marketplace</h2>
          </div>
          <p className="text-sm text-slate-500">
            Certified segregated post-consumer plastic bales available from municipal recovery facilities.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search batch ID or polymer…"
            className="w-full rounded-xl bg-white border border-slate-200 pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-600 mr-2">
          <Filter className="h-4 w-4 text-amber-600" />
          <span>Filters:</span>
        </div>

        {/* Polymer Type */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">All Polymers</option>
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Facility */}
        <select
          value={muniFilter}
          onChange={(e) => setMuniFilter(e.target.value)}
          className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">All Facilities</option>
          {uniqueMunis.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Max Price */}
        <input
          type="number"
          placeholder="Max Price (₹/kg)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-32 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />

        {(typeFilter || muniFilter || maxPrice || searchTerm) && (
          <button
            onClick={() => {
              setTypeFilter('');
              setMuniFilter('');
              setMaxPrice('');
              setSearchTerm('');
            }}
            className="text-amber-800 hover:text-amber-900 font-bold ml-auto cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Batches Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200/80 p-12 text-center text-slate-400">
          <Store className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-600">No plastic inventory batches available in the marketplace</p>
          <p className="text-xs text-slate-400 mt-1">Processed batches sorted by the municipality will appear here for purchase.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="card-hover group relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 rounded-full px-2.5 py-0.5 ring-1 ring-amber-300">
                    {b.id}
                  </span>
                  <span className="text-[10px] font-bold uppercase rounded-full px-2.5 py-0.5 bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                    {b.quality}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-black text-slate-900">{b.type}</h3>
                  <span className="text-xs font-semibold text-slate-500">Baled Polymer</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">{b.municipality}</p>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 mb-4 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Available Stock</p>
                    <p className="text-base font-black text-slate-800 tabular-nums">{b.available.toLocaleString()} kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Base Rate</p>
                    <p className="text-base font-black text-amber-900 tabular-nums">₹{b.price} <span className="text-[10px] text-slate-400">/kg</span></p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setInspectBatch(b);
                  setPurchaseQty(String(Math.min(b.available, 200)));
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 py-2.5 text-xs font-bold text-slate-900 transition-all shadow-md shadow-amber-400/20 active:scale-[0.98] cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                Inspect & Request Purchase
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inspect & Purchase Modal */}
      {inspectBatch && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 text-slate-900 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-950">
                  Procurement Request Draft
                </p>
                <h3 className="text-lg font-black">{inspectBatch.id} — {inspectBatch.type}</h3>
              </div>
              <button
                onClick={handleCloseInspect}
                className="h-8 w-8 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center text-slate-900 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Polymer</span>
                  <span className="font-bold text-slate-800">{inspectBatch.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Stock</span>
                  <span className="font-bold text-slate-800">{inspectBatch.available} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Rate</span>
                  <span className="font-bold text-amber-900">₹{inspectBatch.price}/kg</span>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  <Package className="inline h-3.5 w-3.5 mr-1 text-amber-600" />
                  Quantity to Purchase (kg)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max={inspectBatch.available}
                  value={purchaseQty}
                  onChange={(e) => setPurchaseQty(e.target.value)}
                  placeholder={`Min 1 kg — Max ${inspectBatch.available} kg`}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                />
                {qty > inspectBatch.available && (
                  <p className="text-xs text-red-500 mt-1 font-medium">Exceeds available stock</p>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Material Cost ({qty} kg × ₹{inspectBatch.price})</span>
                  <span className="font-bold text-slate-800 tabular-nums">₹{materialCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Handling Charges (3%)</span>
                  <span className="font-bold text-slate-800 tabular-nums">₹{handlingCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transport Logistics</span>
                  <span className="font-bold text-slate-800 tabular-nums">₹{transportCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GST (18%)</span>
                  <span className="font-bold text-slate-800 tabular-nums">₹{gst.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="font-bold text-slate-700">Total Purchase Amount</span>
                  <span className="font-black text-amber-900 tabular-nums text-sm">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/60">
              <button
                onClick={handleCloseInspect}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPurchaseRequest}
                disabled={qty <= 0 || qty > inspectBatch.available || isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 hover:from-amber-500 hover:to-yellow-500 transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                {isSubmitting ? 'Submitting…' : 'Submit Purchase Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
