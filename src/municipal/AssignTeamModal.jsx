import React from 'react';
import { X, MapPin, AlertTriangle, Camera, ChevronDown, Send } from 'lucide-react';

export default function AssignTeamModal({ isOpen, onClose, complaint, onAssign }) {
  const [selectedTeam, setSelectedTeam] = React.useState('');

  if (!isOpen || !complaint) return null;

  const teams = [
    'Roads & Asphalt Crew',
    'Electrical Team',
    'Drainage & Sewage Unit',
    'Parks & Green Zone Crew',
    'Water Supply Division',
    'Sanitation Squad',
    'General Maintenance',
  ];

  const handleSubmit = () => {
    if (selectedTeam) {
      onAssign(complaint.id, selectedTeam);
      setSelectedTeam('');
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
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200/80 animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1">
            Check Photo, Location & Severity
          </p>
          <h3 className="text-lg font-black">
            Complaint ID: {complaint.id}
          </h3>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Photo Preview */}
          <div className="rounded-xl bg-slate-100 border border-slate-200 h-40 flex items-center justify-center overflow-hidden">
            {complaint.imageUrl ? (
              <img src={complaint.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Camera className="h-8 w-8" />
                <span className="text-xs font-medium">Photo evidence attached</span>
              </div>
            )}
          </div>

          {/* Details Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              {complaint.location}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${
                complaint.severity === 'High'
                  ? 'bg-red-50 text-red-700 ring-red-200'
                  : complaint.severity === 'Medium'
                  ? 'bg-amber-50 text-amber-700 ring-amber-200'
                  : 'bg-green-50 text-green-700 ring-green-200'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {complaint.severity} Severity
            </span>
          </div>

          {/* Complaint Title & Details */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">{complaint.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{complaint.description}</p>
          </div>

          {/* Team Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Assign to Responsible Team
            </label>
            <div className="relative">
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full appearance-none rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">Select a team…</option>
                {teams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/60">
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedTeam}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
            Assign Complaint
          </button>
        </div>
      </div>
    </div>
  );
}
