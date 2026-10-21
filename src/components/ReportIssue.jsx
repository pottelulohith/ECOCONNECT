import React, { useState } from 'react';
import {
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  Wrench,
  Flag,
  AlertTriangle,
  Filter,
  Eye,
  ZoomIn,
  ShieldCheck,
  Search,
  RefreshCw,
  Camera,
} from 'lucide-react';
import ImagePreviewModal from './ImagePreviewModal';

export default function ReportIssue({ issues = [], onOpenModal, onRefresh }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const filteredIssues = issues.filter((issue) => {
    const matchesStatus =
      filterStatus === 'ALL' || (issue.status || '').toUpperCase() === filterStatus;
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.location && issue.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.category && issue.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleZoom = (url, title, e) => {
    if (e) e.stopPropagation();
    setPreviewImage(url);
    setPreviewTitle(title);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* ─── Top Action Bar ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">
            Civic Issue Report & Tracker
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Log community hazards with photo evidence, assign to Municipal Public Works, and monitor verified resolution proof.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
              title="Refresh complaints from MongoDB"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 transition-all active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" />
            Report New Issue
          </button>
        </div>
      </div>

      {/* ─── Search & Status Filters ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your reported issues by ID, title, or location…"
            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'SUBMITTED', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Issue Cards List ─── */}
      <div className="space-y-6">
        {filteredIssues.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200/80 p-12 text-center text-slate-400 space-y-3 shadow-sm">
            <AlertTriangle className="h-10 w-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-base">No civic issues found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm || filterStatus !== 'ALL'
                ? 'Try resetting the search or status filter to see all your logged reports.'
                : 'Have you spotted overflowing waste, potholes, broken lights, or drainage hazards? Report them to initiate municipal action.'}
            </p>
            <button
              type="button"
              onClick={onOpenModal}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              Submit Civic Report
            </button>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isResolved = (issue.status || '').toUpperCase() === 'RESOLVED';
            const isAssigned = (issue.status || '').toUpperCase() === 'ASSIGNED';
            const isInProgress = (issue.status || '').toUpperCase() === 'IN PROGRESS';

            return (
              <div
                key={issue.id}
                className="card-hover overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-sm backdrop-blur transition-all"
              >
                {/* Card Header Strip */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4 gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800 ring-emerald-300/70'
                          : isInProgress || isAssigned
                          ? 'bg-blue-100 text-blue-800 ring-blue-300/70'
                          : 'bg-amber-100 text-amber-800 ring-amber-300/70'
                      }`}
                    >
                      {isResolved ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Wrench className="h-3.5 w-3.5" />
                      )}
                      {issue.status}
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-700">{issue.id}</span>
                    <span className="hidden sm:inline-flex rounded-md bg-slate-200/70 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {issue.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{issue.reportedTime}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Original Citizen Photo Thumbnail */}
                    <div className="shrink-0">
                      <div
                        onClick={(e) => {
                          if (issue.imageUrl) {
                            handleZoom(issue.imageUrl, `${issue.id} - Original Citizen Evidence`, e);
                          }
                        }}
                        className={`relative h-44 w-full lg:w-64 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center overflow-hidden group ${
                          issue.imageUrl ? 'cursor-pointer shadow-sm' : ''
                        }`}
                        title={issue.imageUrl ? 'Click to enlarge citizen photograph' : 'No photo evidence'}
                      >
                        {issue.imageUrl ? (
                          <>
                            <img
                              src={issue.imageUrl}
                              alt={issue.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                              <ZoomIn className="h-4 w-4" />
                              <span>Enlarge Photo</span>
                            </div>
                            <span className="absolute bottom-2 left-2 rounded-md bg-slate-900/80 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white">
                              Citizen Evidence
                            </span>
                          </>
                        ) : (
                          <div className="text-center p-4">
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                              <Camera className="h-6 w-6" />
                            </div>
                            <p className="text-xs font-semibold text-slate-700">No Photo Uploaded</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{issue.locationShort || issue.location}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{issue.title}</h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
                          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{issue.location}</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                        {issue.description}
                      </p>

                      {/* Verified Work Resolution Proof Banner (If Resolved) */}
                      {isResolved && issue.completionPhotoUrl && (
                        <div className="mt-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 flex flex-col sm:flex-row items-center gap-4">
                          <div
                            onClick={(e) =>
                              handleZoom(
                                issue.completionPhotoUrl,
                                `${issue.id} - Verified Municipal Resolution Proof`,
                                e
                              )
                            }
                            className="relative h-20 w-24 rounded-xl overflow-hidden shrink-0 cursor-pointer border border-emerald-300 group/proof shadow-sm bg-slate-900"
                            title="Click to inspect completion photo"
                          >
                            <img
                              src={issue.completionPhotoUrl}
                              alt="Work Resolution Evidence"
                              className="h-full w-full object-cover transition-transform group-hover/proof:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/proof:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <ZoomIn className="h-4 w-4" />
                            </div>
                            <span className="absolute bottom-1 right-1 rounded bg-emerald-600 px-1 py-0.2 text-[8px] font-bold text-white uppercase">
                              Proof
                            </span>
                          </div>

                          <div className="flex-1 text-xs text-emerald-950 space-y-1">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                              Municipal Work Completed & Verified
                            </span>
                            <p className="text-[11.5px] text-emerald-900 leading-relaxed font-medium">
                              {issue.completionDescription || 'Work order completed by Municipal Public Works.'}
                            </p>
                            {issue.completedBy && (
                              <p className="text-[10px] text-emerald-700">
                                Verified by {issue.completedBy}
                                {issue.completedAt ? ` on ${new Date(issue.completedAt).toLocaleString()}` : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ─── Resolution Timeline Tracker ─── */}
                  {issue.timelineSteps && issue.timelineSteps.length > 0 && (
                    <div className="border-t border-slate-100 pt-4 mt-2">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Municipal Resolution Milestones
                        </p>
                        <span className="text-[11px] font-semibold text-slate-600">
                          {isResolved ? 'Status: Closed' : 'Est. Completion: 24-48 Hours'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {issue.timelineSteps.map((step, idx) => {
                          const isDone = step.state === 'done';
                          const isActive = step.state === 'active';

                          return (
                            <div
                              key={idx}
                              className={`rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                                isDone
                                  ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                                  : isActive
                                  ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-200 animate-pulse'
                                  : 'bg-slate-50 text-slate-400'
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              ) : isActive ? (
                                <Wrench className="h-4 w-4 text-blue-600 shrink-0" />
                              ) : (
                                <Flag className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                              )}
                              <span className="truncate">{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Image Preview / Zoom Modal */}
      <ImagePreviewModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage}
        title={previewTitle}
      />
    </div>
  );
}
