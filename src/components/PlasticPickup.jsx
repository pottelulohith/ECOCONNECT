import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { formatDate } from '../utils/dateFormat';

export default function PlasticPickup({ requests, onOpenModal }) {
  return (
    <div className="animate-fade-in space-y-6">
      {/* ─── Top Action Bar ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">Plastic Pickup Request</h2>
          <p className="text-sm text-slate-500 mt-0.5">Schedule doorstep pickups, track verification status, and earn civic PTS</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenModal}
            className="inline-flex items-center gap-2 justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 transition-all active:scale-[0.97] cursor-pointer"
          >
            <Calendar className="h-4 w-4" />
            <span>Request Plastic Pickup</span>
          </button>
        </div>
      </div>

      {/* ─── Request History Table ─── */}
      <div className="overflow-hidden rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">REQUEST ID</th>
                <th className="px-5 py-4">REQUESTED DATE</th>
                <th className="px-5 py-4">PICKUP DATE</th>
                <th className="px-5 py-4">VERIFIED WEIGHT</th>
                <th className="px-5 py-4 text-right">REWARD OUTCOME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-400 text-sm">
                    No pickup requests scheduled yet. Click "Request Plastic Pickup" to schedule doorstep collection.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="group transition-colors hover:bg-emerald-50/30">
                    <td className="px-5 py-4 font-mono font-semibold text-emerald-700">
                      {req.id}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDate(req.date)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={req.pickupDate ? 'font-medium text-slate-700' : 'text-slate-400 italic'}>
                        {req.pickupDate ? formatDate(req.pickupDate) : 'Not Scheduled'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-medium ${req.verified ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                        {req.weight}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {req.verified ? (
                        <span className="text-emerald-600 font-bold">{req.reward}</span>
                      ) : (
                        <span className="text-slate-400">{req.reward}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
