import React, { useState } from 'react';
import {
  X,
  MapPin,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Calendar,
  Upload,
  Image as ImageIcon,
  Loader2,
  ShieldCheck,
  FileText,
  Eye,
  Check,
} from 'lucide-react';
import { api } from '../api/client';

export default function ComplaintDetailModal({
  isOpen,
  onClose,
  complaint,
  onOpenAssign,
  onWorkCompleted,
  onShowImagePreview,
}) {
  const [activeView, setActiveView] = useState('details'); // 'details' | 'complete'
  const [completionPhoto, setCompletionPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [completionDescription, setCompletionDescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !complaint) return null;

  const isResolved = complaint.status === 'Resolved' || complaint.status === 'RESOLVED';
  const isAssignedOrInProgress =
    complaint.status === 'Assigned' ||
    complaint.status === 'In Progress' ||
    complaint.status === 'Under Review';

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('Image file must be under 25MB');
      return;
    }

    setError(null);
    setPhotoPreview(URL.createObjectURL(file));

    // Upload immediately to storage
    setUploadingPhoto(true);
    try {
      const uploadRes = await api.upload.uploadImage(file, 'complaint-resolutions');
      if (uploadRes?.url) {
        setCompletionPhoto(uploadRes.url);
      } else {
        throw new Error('Image upload failed to return URL');
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      setError(err.message || 'Failed to upload completion photograph');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmitCompletion = async (e) => {
    e.preventDefault();
    if (!completionPhoto) {
      setError('A valid completion photograph is mandatory to mark work as resolved');
      return;
    }
    if (!completionDescription.trim()) {
      setError('Please provide a description of the completed work');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        completionPhotoUrl: completionPhoto,
        completionDescription: completionDescription.trim(),
        remarks: remarks.trim(),
      };

      const res = await api.complaints.completeWork(complaint._id || complaint.id, payload);
      if (onWorkCompleted) {
        onWorkCompleted(res.complaint || { ...complaint, ...payload, status: 'Resolved' });
      }
      onClose();
    } catch (err) {
      console.error('Failed to submit completion proof:', err);
      setError(err.message || 'Failed to submit completion proof');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200/80 animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-slate-900 px-6 py-4 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-extrabold text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full ring-1 ring-blue-500/30">
              {complaint.id}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ring-1 ${
                isResolved
                  ? 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/40'
                  : complaint.status === 'Assigned'
                  ? 'bg-blue-500/20 text-blue-300 ring-blue-500/40'
                  : 'bg-amber-500/20 text-amber-300 ring-amber-500/40'
              }`}
            >
              {complaint.status}
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-400">
              {complaint.category}
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher if complaint is eligible for work completion */}
        {isAssignedOrInProgress && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 pt-3 flex gap-2">
            <button
              onClick={() => setActiveView('details')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
                activeView === 'details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Complaint Overview & Evidence
            </button>
            <button
              onClick={() => setActiveView('complete')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeView === 'complete'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark Work as Completed
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeView === 'details' ? (
            /* VIEW 1: DETAILS & RESOLUTION OVERVIEW */
            <div className="space-y-6">
              {/* Top Row: Photographs (Original vs Completion) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Original Citizen Photo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-blue-600" />
                      Citizen Original Photo Evidence
                    </span>
                    {complaint.imageUrl && (
                      <button
                        type="button"
                        onClick={() => onShowImagePreview(complaint.imageUrl, `Complaint ${complaint.id}`)}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> Zoom
                      </button>
                    )}
                  </div>
                  <div className="relative h-52 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center group">
                    {complaint.imageUrl ? (
                      <img
                        src={complaint.imageUrl}
                        alt="Citizen complaint evidence"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <Camera className="h-8 w-8 mx-auto mb-1 text-slate-300" />
                        <span className="text-xs">No photograph attached by citizen</span>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 rounded-md bg-slate-900/80 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white">
                      Original Submission
                    </span>
                  </div>
                </div>

                {/* 2. Completion Work Photo (if completed) or Status Placeholder */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Municipal Work Completion Proof
                    </span>
                    {complaint.completionPhotoUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          onShowImagePreview(
                            complaint.completionPhotoUrl,
                            `Resolution Proof for ${complaint.id}`
                          )
                        }
                        className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> Zoom
                      </button>
                    )}
                  </div>
                  <div className="relative h-52 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center group">
                    {complaint.completionPhotoUrl ? (
                      <>
                        <img
                          src={complaint.completionPhotoUrl}
                          alt="Work completion evidence"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute bottom-2 left-2 rounded-md bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold shadow">
                          Verified Resolution
                        </span>
                      </>
                    ) : (
                      <div className="text-center p-4 space-y-2 text-slate-400">
                        <ImageIcon className="h-8 w-8 mx-auto text-slate-300" />
                        <p className="text-xs font-medium text-slate-500">
                          {isResolved ? 'No resolution image' : 'Awaiting Work Completion'}
                        </p>
                        {isAssignedOrInProgress && (
                          <button
                            onClick={() => setActiveView('complete')}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                          >
                            Submit Completion Photograph →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Citizen & Location Metadata Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-slate-50 border border-slate-200/80 p-4">
                <div className="space-y-2 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Citizen Details</p>
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="font-bold">{complaint.citizen || 'Resident'}</span>
                    {complaint.citizenId && (
                      <span className="text-[10px] font-mono text-slate-400">({complaint.citizenId})</span>
                    )}
                  </div>
                  {complaint.citizenPhone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{complaint.citizenPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Reported: {complaint.reportedTime || 'Recent'}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location & Category</p>
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{complaint.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                      {complaint.category}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-600">
                      {complaint.severity || 'Medium'} Priority
                    </span>
                  </div>
                </div>
              </div>

              {/* Complaint Description */}
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900">{complaint.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-200 rounded-xl p-3">
                  {complaint.description}
                </p>
              </div>

              {/* Work Assignment / Resolution Summary */}
              <div className="rounded-2xl border border-slate-200/80 p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {complaint.assignedTeam ? `Assigned to: ${complaint.assignedTeam}` : 'No Team Assigned'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {isResolved ? 'Work order resolved and closed' : 'Municipal field dispatch in progress'}
                      </p>
                    </div>
                  </div>

                  {!isResolved && onOpenAssign && (
                    <button
                      type="button"
                      onClick={() => onOpenAssign(complaint)}
                      className="rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 text-xs font-bold transition-colors"
                    >
                      {complaint.assignedTeam ? 'Reassign Team' : 'Assign Team'}
                    </button>
                  )}
                </div>

                {isResolved && complaint.completionDescription && (
                  <div className="pt-3 border-t border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Work Completion Report:
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50/60 border border-emerald-100 rounded-lg p-2.5">
                      {complaint.completionDescription}
                    </p>
                    {complaint.completedBy && (
                      <p className="text-[10px] text-slate-400">
                        Verified by {complaint.completedBy}
                        {complaint.completedAt ? ` on ${new Date(complaint.completedAt).toLocaleString()}` : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* VIEW 2: MARK WORK AS COMPLETED FORM */
            <form onSubmit={handleSubmitCompletion} className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-xs flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Proof of Work Submission</p>
                  <p className="text-emerald-800 mt-0.5">
                    Upload an actual site photograph verifying the issue has been cleared/resolved. The photograph, resolution notes, and server timestamp will be permanently saved to MongoDB Atlas.
                  </p>
                </div>
              </div>

              {/* Photograph Upload Field */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mandatory Work Completion Photograph *
                </label>

                {photoPreview ? (
                  <div className="relative rounded-2xl border-2 border-emerald-300 bg-slate-50 p-2 overflow-hidden flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-40 w-full sm:w-56 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                      <img src={photoPreview} alt="Work preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2 p-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <Check className="h-4 w-4" />
                        Photograph uploaded to storage
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Real photograph uploaded. You can replace it before final submission.
                      </p>
                      <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors">
                        <Camera className="h-3.5 w-3.5" />
                        Replace Photograph
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                          disabled={uploadingPhoto || submitting}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 cursor-pointer transition-all group">
                    {uploadingPhoto ? (
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        <span className="text-xs font-semibold">Uploading photograph to storage…</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-emerald-700">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 group-hover:ring-emerald-300">
                          <Upload className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="text-xs font-bold">Click to upload completion photo</span>
                        <span className="text-[11px] text-slate-400">PNG, JPG, or WebP up to 10MB</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                      disabled={uploadingPhoto || submitting}
                    />
                  </label>
                )}
              </div>

              {/* Work Completion Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Work Completion Description *
                </label>
                <textarea
                  rows={3}
                  value={completionDescription}
                  onChange={(e) => setCompletionDescription(e.target.value)}
                  placeholder="Detail the work carried out (e.g., cleared overflowing bin, replaced bin liner, disinfected the area)..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Optional Remarks */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Officer Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Additional observations or recommendations..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Server Timestamp note */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Server completion timestamp will be recorded automatically upon submission.
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveView('details')}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Back to Details
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingPhoto || !completionPhoto || !completionDescription.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving to Database…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Submit Proof & Mark Resolved
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
