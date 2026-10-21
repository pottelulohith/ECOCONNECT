import React, { useState } from 'react';
import { X, Scale, Sparkles, BadgeCheck } from 'lucide-react';

export default function VerifyWeightModal({ isOpen, onClose, request, onVerify }) {
  const [measuredWeight, setMeasuredWeight] = useState('');
  const [polymerType, setPolymerType] = useState('PET Bottles');
  const [notes, setNotes] = useState('');

  if (!isOpen || !request) return null;

  const polymerRates = {
    'PET Bottles': 50,
    'HDPE Containers': 55,
    'LDPE Films': 35,
    'PP Rigid': 45,
    'Mixed Polymer': 30,
  };

  const rate = polymerRates[polymerType] || 40;
  const weight = parseFloat(measuredWeight) || 0;
  const credits = Math.round(weight * rate);

  const handleSubmit = () => {
    if (weight > 0) {
      onVerify(request._id || request.id, {
        weightKg: weight,
        polymerType,
        creditsAwarded: credits,
        notes,
      });
      setMeasuredWeight('');
      setNotes('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200/80 animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1">
            Verify Plastic Type & Weight
          </p>
          <h3 className="text-lg font-black">
            Request ID: {request.id}
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            Citizen: {request.citizen || request.citizenName || 'Citizen Resident'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Polymer Category Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
              Polymer Classification
            </label>
            <select
              value={polymerType}
              onChange={(e) => setPolymerType(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PET Bottles">PET Bottles (Clear / Mineral)</option>
              <option value="HDPE Containers">HDPE Containers (Detergent / Milk)</option>
              <option value="LDPE Films">LDPE Films & Packaging</option>
              <option value="PP Rigid">PP Rigid Caps & Crates</option>
              <option value="Mixed Polymer">Mixed Polymer Bales</option>
            </select>
          </div>

          {/* Measured Weight Input */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
              Verified Scale Weight (KG)
            </label>
            <div className="relative">
              <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={measuredWeight}
                onChange={(e) => setMeasuredWeight(e.target.value)}
                placeholder="e.g. 4.2"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-12 py-3 text-lg font-black text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                KG
              </span>
            </div>
          </div>

          {/* Live Credit Calculation */}
          <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Calculated Civic Credit Reward
                </p>
                <p className="text-2xl font-black text-emerald-800 mt-0.5">
                  +{credits} <span className="text-sm font-bold">PTS</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100 rounded px-2 py-0.5">
                  Rate: {rate} pts/kg
                </span>
                <p className="text-[11px] text-emerald-700 mt-1">Automatic wallet credit</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">
              Inspection Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Clean dry bottles, sorted correctly"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleSubmit}
            disabled={weight <= 0}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all shadow-md active:scale-[0.98] ${
              weight > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <BadgeCheck className="h-4 w-4" />
            Confirm Weight & Award Credits
          </button>
        </div>
      </div>
    </div>
  );
}
