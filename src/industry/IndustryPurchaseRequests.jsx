import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  ChevronDown,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../api/client';
import { formatDate } from '../utils/dateFormat';

export default function IndustryPurchaseRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = () => {
    setLoading(true);
    api.industry
      .getMyPurchaseRequests()
      .then((res) => {
        if (res?.requests) {
          setRequests(res.requests);
        } else {
          setRequests([]);
        }
      })
      .catch((err) => console.warn('Could not load industry requests:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered = requests.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (
      searchTerm &&
      !r.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !r.polymer.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const statusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900 ring-1 ring-emerald-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-700" /> Approved
          </span>
        );
      case 'Fulfilled':
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-900 ring-1 ring-blue-300">
            <CheckCircle2 className="h-3 w-3 text-blue-700" /> Delivered
          </span>
        );
      case 'Pending':
      case 'Pending Review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 ring-1 ring-amber-200">
            <Clock className="h-3 w-3 text-amber-600" /> Pending Review
          </span>
        );
      case 'Rejected':
      case 'Denied':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-black text-slate-800">My Purchase Requests</h2>
          </div>
          <p className="text-sm text-slate-500">
            Track requisition status, municipal quota approval, and payment settlement.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search request or polymer…"
              className="w-full rounded-xl bg-white border border-slate-200 pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
          >
            <option value="">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        {loading && requests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading purchase requests...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No purchase requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    Order ID
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    Polymer Type
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    Quantity
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    Total Amount
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="px-5 py-3.5 text-right text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-amber-800 text-xs">
                      {req.id}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800 text-xs">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 font-bold">
                        {req.polymer}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700 text-xs tabular-nums">
                      {req.quantity}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 text-xs tabular-nums">
                      {req.total}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatDate(req.date)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {statusBadge(req.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
