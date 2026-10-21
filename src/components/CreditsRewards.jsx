import React, { useState, useEffect } from 'react';
import { Bus, Zap, Trees, Coins, Gift, CheckCircle, Sparkles, Tag, Copy, Check, History, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { api } from '../api/client';
import { formatDate } from '../utils/dateFormat';

const perks = [
  {
    id: 'transit',
    icon: Bus,
    title: 'Public Transit Monthly Pass Discount',
    cost: 200,
    description: 'Get 15% off municipal metro and city bus pass renewals.',
    gradient: 'from-blue-600 to-indigo-600',
    shadow: 'shadow-blue-600/25',
    bg: 'from-blue-50/80 to-indigo-50/40',
    ring: 'border-blue-200/80',
    accent: 'text-blue-700',
    voucherPrefix: 'TRANSIT15',
  },
  {
    id: 'electricity',
    icon: Zap,
    title: 'Municipal Electricity Bill Rebate',
    cost: 300,
    description: 'Get ₹150 deduction on your municipal utility bill.',
    gradient: 'from-amber-500 to-amber-600',
    shadow: 'shadow-amber-500/25',
    bg: 'from-amber-50/80 to-amber-100/40',
    ring: 'border-amber-200/80',
    accent: 'text-amber-700',
    voucherPrefix: 'UTILREBATE',
  },
  {
    id: 'facility',
    icon: Trees,
    title: 'Public Facility Access Pass',
    cost: 150,
    description: 'Free monthly access pass to civic sports complexes & parks.',
    gradient: 'from-emerald-600 to-teal-600',
    shadow: 'shadow-emerald-600/25',
    bg: 'from-emerald-50/80 to-teal-50/40',
    ring: 'border-emerald-200/80',
    accent: 'text-emerald-700',
    voucherPrefix: 'CIVICPARK',
  },
];

export default function CreditsRewards({ walletPoints, onRedeem }) {
  const [redeemedVouchers, setRedeemedVouchers] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.citizen
      .getTransactions()
      .then((res) => {
        if (res?.transactions) {
          setTransactions(res.transactions);
        }
      })
      .catch(() => {});
  }, [walletPoints]);

  const handleRedeem = (perk) => {
    if (walletPoints >= perk.cost && !redeemedVouchers[perk.id]) {
      const code = `${perk.voucherPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      setRedeemedVouchers((prev) => ({ ...prev, [perk.id]: code }));
      onRedeem(perk.cost, perk.title, code);
    }
  };

  const copyToClipboard = (perkId, code) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(perkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* ─── Balance Header ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-10 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-60 w-60 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-5 w-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Available Wallet Balance</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-extrabold tracking-tight tabular-nums text-white">
                {walletPoints}
              </span>
              <span className="text-2xl font-bold text-emerald-400">PTS</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              1 PTS ≈ ₹1 municipal subsidy value. Earn more by scheduling verified plastic pickups!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-5 py-3 text-sm backdrop-blur border border-white/10">
              <Sparkles className="h-4 w-4 text-emerald-300 shrink-0" />
              <span className="text-slate-200 font-medium">Automatic Citizen Subsidy applied</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section Title ─── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">Redeem Civic Perks & Discounts</h2>
        <p className="text-sm text-slate-500 mt-1">Exchange your earned sustainability credits for municipal rebates, passes, and transit discounts.</p>
      </div>

      {/* ─── Perks Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {perks.map((perk) => {
          const Icon = perk.icon;
          const voucherCode = redeemedVouchers[perk.id];
          const canAfford = walletPoints >= perk.cost;

          return (
            <div
              key={perk.id}
              className={`card-hover relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white/95 border ${perk.ring} shadow-sm backdrop-blur`}
            >
              {/* Top Accent Gradient Bar */}
              <div className={`h-2 bg-gradient-to-r ${perk.gradient}`} />

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${perk.gradient} ${perk.shadow} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" strokeWidth={2.2} />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      {perk.cost} PTS
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{perk.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">{perk.description}</p>
                </div>

                <div>
                  {voucherCode ? (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Voucher Activated!</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded-lg px-3 py-1.5 border border-emerald-200 mt-1">
                        <span className="font-mono text-xs font-bold text-slate-800">{voucherCode}</span>
                        <button
                          onClick={() => copyToClipboard(perk.id, voucherCode)}
                          className="text-emerald-700 hover:text-emerald-800 transition-colors"
                          title="Copy voucher code"
                        >
                          {copiedId === perk.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRedeem(perk)}
                      disabled={!canAfford}
                      className={`w-full rounded-xl py-3 px-4 text-sm font-bold transition-all active:scale-[0.98] ${
                        canAfford
                          ? `bg-gradient-to-r ${perk.gradient} text-white shadow-lg ${perk.shadow} hover:brightness-110 cursor-pointer`
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      {canAfford ? 'Redeem Voucher' : `Need ${perk.cost - walletPoints} More PTS`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Credit Transaction History ─── */}
      <div className="overflow-hidden rounded-2xl bg-white/95 border border-slate-200/80 shadow-sm backdrop-blur p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800">Credits Ledger & Activity</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{transactions.length} record(s)</span>
        </div>

        {transactions.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No transactions recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.transactionId || tx._id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      tx.amount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {tx.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{tx.description}</p>
                    <p className="text-xs text-slate-400 font-mono">
                      {tx.transactionId} • {formatDate(tx.createdAt || Date.now())}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-extrabold ${
                      tx.amount > 0 ? 'text-emerald-600' : 'text-slate-700'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} PTS
                  </span>
                  <p className="text-[11px] text-slate-400">Bal: {tx.balanceAfter} PTS</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
