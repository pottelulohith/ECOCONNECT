import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Building2,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Headphones,
  CheckCircle2,
  Copy,
} from 'lucide-react';

const DEPARTMENTS = [
  {
    name: 'Municipal Central Command & Emergency Dispatch',
    category: '24/7 Helpline',
    phone: '+91 11 2345 6789',
    tollFree: '1800-11-2026 (Toll Free)',
    email: 'admin@ecoconnect.local',
    altEmail: 'controlroom@municipality.delhi.gov.in',
    hours: '24 Hours / 7 Days a week',
    location: 'Civic Centre, Minto Road, Central Command Wing',
    badge: 'Emergency 24x7',
    badgeColor: 'bg-red-50 text-red-700 ring-red-200',
    description: 'Immediate response for severe public safety hazards, major blockages, and emergency civic dispatches.',
  },
  {
    name: 'Sanitation, Waste Management & Recyclables Division',
    category: 'Waste & Sanitation',
    phone: '+91 11 2345 6790',
    tollFree: '1800-11-3040',
    email: 'sanitation@ecoconnect.local',
    altEmail: 'cleanliness@municipality.delhi.gov.in',
    hours: 'Monday – Saturday: 7:00 AM – 7:00 PM',
    location: 'Sanitation Wing, Zone 4 Hub, Sector 14',
    badge: 'Primary Dispatch',
    badgeColor: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    description: 'Inquiries regarding doorstep plastic collections, overflowing community bins, and illegal dumping remediation.',
  },
  {
    name: 'Public Works, Roads & Street Lighting Department',
    category: 'Infrastructure',
    phone: '+91 11 2345 6791',
    tollFree: '1800-11-4050',
    email: 'publicworks@ecoconnect.local',
    altEmail: 'infrastructure@municipality.delhi.gov.in',
    hours: 'Monday – Friday: 9:00 AM – 6:00 PM',
    location: 'Engineering Division, Civic Complex, Sector 14',
    badge: 'Roads & Lights',
    badgeColor: 'bg-amber-50 text-amber-700 ring-amber-200',
    description: 'Pothole repairs, asphalt resurfacing, street illumination outages, and roadside civil infrastructure.',
  },
  {
    name: 'Water Supply, Sewage & Drainage Directorate',
    category: 'Water & Sewage',
    phone: '+91 11 2345 6792',
    tollFree: '1800-11-5060',
    email: 'watersupply@ecoconnect.local',
    altEmail: 'drainage@municipality.delhi.gov.in',
    hours: 'Daily: 8:00 AM – 8:00 PM (Emergency 24h)',
    location: 'Water Works Complex, Near Sector 14 Pumping Station',
    badge: 'Water & Sewage',
    badgeColor: 'bg-teal-50 text-teal-700 ring-teal-200',
    description: 'Drinking water pipeline maintenance, drainage overflows, storm drain cleaning, and water quality testing.',
  },
  {
    name: 'Citizen Grievance Cell & Public Facilitation',
    category: 'Citizen Services',
    phone: '+91 11 2345 6795',
    tollFree: '1800-11-1000',
    email: 'support@ecoconnect.local',
    altEmail: 'grievance@municipality.delhi.gov.in',
    hours: 'Monday – Friday: 9:30 AM – 5:30 PM',
    location: 'Ground Floor, Public Facilitation Counter, Civic Centre',
    badge: 'Support Desk',
    badgeColor: 'bg-purple-50 text-purple-700 ring-purple-200',
    description: 'General municipal queries, complaint escalation, citizen certificate tracking, and administrative assistance.',
  },
];

export default function HelpDesk() {
  const [copiedText, setCopiedText] = useState(null);

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* ─── Top Header Banner ─── */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30">
              <Building2 className="h-3.5 w-3.5 text-emerald-400" />
              Municipal Directory & Helplines
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Help Desk • Municipal Contact Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Official phone numbers and email addresses of the municipal departments. Contact officers directly for civic inquiries, service dispatch, or urgent local assistance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="tel:+911123456789"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
            >
              <Phone className="h-4 w-4" />
              Call Central Helpline
            </a>
            <a
              href="mailto:admin@ecoconnect.local"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 text-sm font-bold backdrop-blur transition-all active:scale-[0.98]"
            >
              <Mail className="h-4 w-4" />
              Email Municipal Office
            </a>
          </div>
        </div>
      </div>

      {/* Copied Feedback Toast */}
      {copiedText && (
        <div className="fixed bottom-6 right-6 z-[120] flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-2xl border border-slate-700 text-xs font-semibold animate-slide-up">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Copied {copiedText} to clipboard!</span>
        </div>
      )}

      {/* ─── Department Cards Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DEPARTMENTS.map((dept, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            {/* Card Header */}
            <div className="p-6 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span
                  className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 ring-1 ${dept.badgeColor}`}
                >
                  {dept.badge}
                </span>
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {dept.hours}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {dept.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {dept.description}
              </p>
            </div>

            {/* Contact Details Body */}
            <div className="p-6 pt-4 space-y-3.5 bg-slate-50/50 flex-1">
              {/* Phone Numbers */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Direct Contact Numbers:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`tel:${dept.phone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition-all"
                  >
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{dept.phone}</span>
                  </a>

                  {dept.tollFree && (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                      <Headphones className="h-3 w-3 text-slate-400" />
                      {dept.tollFree}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => copyToClipboard(dept.phone, dept.name + ' Phone')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Copy Phone Number"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Official Emails */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Official Email Inboxes:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`mailto:${dept.email}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-all"
                  >
                    <Mail className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{dept.email}</span>
                  </a>

                  {dept.altEmail && (
                    <a
                      href={`mailto:${dept.altEmail}`}
                      className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <Mail className="h-3 w-3 text-slate-400" />
                      <span>{dept.altEmail}</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => copyToClipboard(dept.email, dept.name + ' Email')}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Copy Email Address"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Location Office */}
              <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{dept.location}</span>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="px-6 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                Authorized Municipal Service
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${dept.phone.replace(/\s+/g, '')}`}
                  className="rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold transition-colors"
                >
                  Call Dept
                </a>
                <a
                  href={`mailto:${dept.email}`}
                  className="rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold transition-colors"
                >
                  Send Email
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Municipal Escalation Notice ─── */}
      <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-5 flex items-start gap-3.5 text-xs text-amber-900">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm text-amber-950">
            Civic Escalation & Emergency Notice
          </p>
          <p className="mt-1 leading-relaxed text-amber-800">
            For active water main bursts, exposed live wires, or major hazardous chemical spills, please call the 24/7 Central Command Hub immediately at{' '}
            <strong className="text-amber-950 underline">+91 11 2345 6789</strong>. For standard community hazards (overflowing garbage bins, potholes, street lights), please submit a ticket using the{' '}
            <strong>Civic Issue Report</strong> tab to ensure photographic proof of work is logged.
          </p>
        </div>
      </div>
    </div>
  );
}
