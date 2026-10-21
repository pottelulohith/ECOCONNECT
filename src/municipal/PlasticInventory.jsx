import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Wine,
  Box,
  Layers,
  Container,
  TrendingUp,
  Clock,
  BadgeCheck,
  User,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../api/client';
import { formatDate } from '../utils/dateFormat';

export default function PlasticInventory() {
  const [batches, setBatches] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.municipality.getInventory().catch(() => null),
      api.municipality.getInventoryTransactions().catch(() => null),
    ])
      .then(([invRes, txnRes]) => {
        if (invRes?.batches) {
          setBatches(invRes.batches);
        }
        if (txnRes?.transactions) {
          setTransactions(txnRes.transactions);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const getPolymerIcon = (code) => {
    if (code.includes('PET')) return Wine;
    if (code.includes('HDPE')) return Box;
    if (code.includes('LDPE')) return Layers;
    return Container;
  };

  const getPolymerStyles = (code) => {
    if (code.includes('PET')) {
      return {
        color: 'from-blue-600 to-sky-600',
        bgLight: 'bg-blue-50',
        textColor: 'text-blue-600',
        barColor: 'bg-gradient-to-r from-blue-600 to-sky-500',
        ringColor: 'ring-blue-200/60',
      };
    }
    if (code.includes('HDPE')) {
      return {
        color: 'from-emerald-500 to-teal-600',
        bgLight: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        barColor: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        ringColor: 'ring-emerald-200/60',
      };
    }
    if (code.includes('LDPE')) {
      return {
        color: 'from-sky-500 to-blue-600',
        bgLight: 'bg-sky-50',
        textColor: 'text-sky-700',
        barColor: 'bg-gradient-to-r from-sky-500 to-blue-600',
        ringColor: 'ring-sky-200/60',
      };
    }
    return {
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
      barColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
      ringColor: 'ring-amber-200/60',
    };
  };

  const displayBatches = batches;

  const totalStock = displayBatches.reduce((acc, curr) => acc + (curr.currentStockKg || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Boxes className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-black text-slate-800">Municipal Plastic Stock</h2>
          </div>
          <p className="text-sm text-slate-500">
            Real-time stockpile by polymer grade, sorted after doorstep citizen collection.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200/60 rounded-xl px-4 py-2 text-xs font-bold text-blue-800">
          <span>Total Stock: {totalStock.toLocaleString()} kg</span>
        </div>
      </div>

      {/* Polymer Stock Cards */}
      {displayBatches.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200/80 p-8 text-center text-slate-400">
          <Boxes className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-600">No polymer inventory batches currently in stock.</p>
          <p className="text-xs text-slate-400 mt-1">Verify collected plastic from citizens to automatically generate sorted polymer stock.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayBatches.map((item) => {
            const styles = getPolymerStyles(item.polymerType);
            const Icon = getPolymerIcon(item.polymerType);
            const cap = item.initialStockKg || 1000;
            const percentage = Math.min(100, Math.round(((item.currentStockKg || 0) / cap) * 100));

            return (
              <div
                key={item.polymerType || item._id}
                className="card-hover group relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.bgLight} ring-1 ${styles.ringColor}`}>
                    <Icon className={`h-5 w-5 ${styles.textColor}`} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 rounded px-2 py-0.5">
                    {item.polymerType}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {item.fullName || `${item.polymerType} Baled`}
                </h4>

                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    {(item.currentStockKg || 0).toLocaleString()}
                  </span>
                  <span className={`text-sm font-bold ${styles.textColor}`}>kg</span>
                  <span className="text-xs text-slate-400 ml-auto">{percentage}% capacity</span>
                </div>

              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${styles.barColor} transition-all duration-700 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <TrendingUp className="h-3 w-3" /> In Stock
                </span>
                <span>Cap: {cap} kg</span>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Stock Inflow Verification Audit Log (Clean: NO "Type" Column) */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-700">Stock Inventory Verification Audit Log</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Verified intake and industry dispatch transactions
            </p>
          </div>
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 rounded-full px-2.5 py-0.5 ring-1 ring-blue-200/60">
            Audit Ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Time
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Transaction / Action
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Polymer
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quantity
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">
                  Operator
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-xs text-slate-400">
                    No inventory audit transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3 text-xs font-mono font-semibold text-slate-500">
                      {formatDate(entry.createdAt || entry.timestamp) || 'Today'}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800 text-xs">
                      {entry.action}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {entry.polymerType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs font-black">
                      <span className={entry.quantityKg > 0 ? 'text-emerald-600' : 'text-slate-700'}>
                        {entry.quantityKg > 0 ? `+${entry.quantityKg}` : entry.quantityKg} kg
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 hidden md:table-cell">
                      {entry.operator || 'System'}
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
