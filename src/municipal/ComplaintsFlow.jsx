import React, { useState, useEffect } from 'react';
import {
  MapPin,
  AlertTriangle,
  Clock,
  Eye,
  UserPlus,
  CheckCircle2,
  Search,
  Filter,
  MessageSquareWarning,
  Image as ImageIcon,
  CheckSquare,
  ZoomIn,
} from 'lucide-react';
import AssignTeamModal from './AssignTeamModal';
import ComplaintDetailModal from './ComplaintDetailModal';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { api } from '../api/client';
import { formatDate } from '../utils/dateFormat';

export default function ComplaintsFlow({ onShowToast }) {
  const [complaints, setComplaints] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComplaints = () => {
    setLoading(true);
    api.complaints
      .getAll()
      .then((res) => {
        if (res?.complaints) {
          const formatted = res.complaints.map((c) => ({
            _id: c._id,
            id: c.id,
            title: c.title,
            category: c.category,
            location: c.location,
            locationShort: c.location ? c.location.split(',')[0] : '',
            description: c.description,
            reportedTime: formatDate(c.createdAt),
            severity: c.priority || 'Medium',
            status: c.status || 'Submitted',
            assignedTeam: c.assignedTeam !== 'Unassigned' ? c.assignedTeam : null,
            imageUrl: c.originalPhotoUrl || c.photoUrl,
            originalPhotoUrl: c.originalPhotoUrl || c.photoUrl,
            completionPhotoUrl: c.completionPhotoUrl,
            completionDescription: c.completionDescription,
            completionRemarks: c.completionRemarks,
            completedBy: c.completedBy,
            completedAt: c.completedAt,
            citizen: c.citizen,
            citizenId: c.citizenId,
            citizenPhone: c.citizenPhone,
          }));
          setComplaints(formatted);
        }
      })
      .catch((err) => console.warn('Could not load municipal complaints:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleOpenAssign = (complaint) => {
    setSelectedComplaint(complaint);
    setModalOpen(true);
  };

  const handleOpenDetail = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailModalOpen(true);
  };

  const handleImageZoom = (url, title, e) => {
    if (e) e.stopPropagation();
    setPreviewImage(url);
    setPreviewTitle(title);
  };

  const handleAssign = async (complaintId, team) => {
    try {
      const complaintToUpdate = complaints.find((c) => c.id === complaintId || c._id === complaintId);
      if (complaintToUpdate?._id) {
        await api.complaints.assign(complaintToUpdate._id, team);
      }
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId || c._id === complaintId
            ? { ...c, status: 'Assigned', assignedTeam: team }
            : c
        )
      );
      if (onShowToast) {
        onShowToast(`Team "${team}" assigned to ${complaintId} successfully!`);
      }
      fetchComplaints();
    } catch (err) {
      console.error('Failed to assign team:', err);
    }
  };

  const handleWorkCompleted = (updatedComplaint) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === updatedComplaint.customId || c._id === updatedComplaint._id
          ? {
              ...c,
              status: 'Resolved',
              completionPhotoUrl: updatedComplaint.completionPhotoUrl,
              completionDescription: updatedComplaint.completionDescription,
              completedBy: updatedComplaint.completedBy,
              completedAt: updatedComplaint.completedAt,
            }
          : c
      )
    );
    if (onShowToast) {
      onShowToast(`Complaint ${updatedComplaint.customId || ''} marked as Completed & Resolved!`);
    }
    fetchComplaints();
  };

  const filtered = complaints.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.location && c.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquareWarning className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-black text-slate-800">Citizen Complaints</h2>
          </div>
          <p className="text-sm text-slate-500">
            Active civic issues reported by citizens. Inspect citizen evidence, assign response teams, and verify completion photos.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search complaints…"
            className="w-full rounded-xl bg-white border border-slate-200 pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
        </div>
      </div>

      {loading && complaints.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading complaints from database...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">No complaints found.</div>
      ) : (
        /* Complaints Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((complaint, idx) => (
            <div
              key={complaint.id || idx}
              className={`card-hover group relative overflow-hidden rounded-2xl bg-white border shadow-sm flex flex-col justify-between transition-all ${
                complaint.severity === 'High' || complaint.severity === 'Critical'
                  ? 'border-red-200/80 hover:border-red-300'
                  : 'border-slate-200/80 hover:border-blue-300'
              }`}
            >
              {/* Severity Strip */}
              <div
                className={`h-1.5 w-full ${
                  complaint.severity === 'High' || complaint.severity === 'Critical'
                    ? 'bg-gradient-to-r from-red-500 to-rose-500'
                    : complaint.severity === 'Medium'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                }`}
              />

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Top Row: ID, Status, Severity */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 rounded-full px-2.5 py-0.5 ring-1 ring-blue-200/60">
                      {complaint.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 ring-1 ${
                          complaint.severity === 'High' || complaint.severity === 'Critical'
                            ? 'bg-red-50 text-red-700 ring-red-200'
                            : complaint.severity === 'Medium'
                            ? 'bg-amber-50 text-amber-700 ring-amber-200'
                            : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        }`}
                      >
                        {complaint.severity} Priority
                      </span>
                      <span
                        className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 ring-1 ${
                          complaint.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : complaint.status === 'Assigned' || complaint.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 ring-blue-200'
                            : 'bg-slate-100 text-slate-600 ring-slate-200'
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </div>
                  </div>

                  {/* Middle Content with Thumbnail beside Details */}
                  <div className="flex gap-4 items-start mb-3">
                    {/* Citizen Photo Thumbnail (Requirement 4) */}
                    <div
                      onClick={(e) => {
                        if (complaint.imageUrl) {
                          handleImageZoom(complaint.imageUrl, `${complaint.id} - Citizen Evidence`, e);
                        } else {
                          handleOpenDetail(complaint);
                        }
                      }}
                      className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 cursor-pointer group/thumb shadow-sm"
                      title={complaint.imageUrl ? 'Click to enlarge citizen photograph' : 'No photo uploaded'}
                    >
                      {complaint.imageUrl ? (
                        <>
                          <img
                            src={complaint.imageUrl}
                            alt={`Evidence for ${complaint.title}`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <ZoomIn className="h-5 w-5" />
                          </div>
                          <span className="absolute bottom-1 right-1 rounded bg-slate-900/80 px-1 py-0.2 text-[8px] font-bold text-white uppercase">
                            Citizen
                          </span>
                        </>
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center p-2 text-slate-400 text-center">
                          <ImageIcon className="h-6 w-6 text-slate-300 mb-1" />
                          <span className="text-[10px] font-medium leading-tight">No Photo</span>
                        </div>
                      )}
                    </div>

                    {/* Details Column beside Thumbnail */}
                    <div className="flex-1 min-w-0">
                      <h3
                        onClick={() => handleOpenDetail(complaint)}
                        className="text-sm sm:text-base font-bold text-slate-900 mb-1 leading-snug line-clamp-1 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {complaint.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                          {complaint.category}
                        </span>
                        <span>•</span>
                        <span>{complaint.reportedTime}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2 bg-slate-50 rounded-lg px-2 py-1">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{complaint.location}</span>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {complaint.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Assigned Team / Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  {complaint.assignedTeam ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="truncate max-w-[140px] sm:max-w-[180px]">
                        {complaint.assignedTeam}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No team assigned</span>
                  )}

                  <div className="flex items-center gap-2">
                    {/* View Details / Proof button */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(complaint)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-colors shadow-sm"
                      title="View full complaint details and resolution evidence"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Details</span>
                    </button>

                    {/* Quick Complete Action if Assigned/In Progress */}
                    {complaint.status !== 'Resolved' && complaint.assignedTeam && (
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(complaint)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 text-xs font-bold shadow-sm transition-all"
                        title="Upload completion photograph and mark resolved"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>Complete</span>
                      </button>
                    )}

                    {/* Assign Team Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenAssign(complaint)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.97]"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      {complaint.assignedTeam ? 'Reassign' : 'Assign'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Team Modal */}
      <AssignTeamModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        complaint={selectedComplaint}
        onAssign={handleAssign}
      />

      {/* Complaint Detail & Completion Proof Modal */}
      <ComplaintDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        complaint={selectedComplaint}
        onOpenAssign={(c) => {
          setDetailModalOpen(false);
          handleOpenAssign(c);
        }}
        onWorkCompleted={handleWorkCompleted}
        onShowImagePreview={(url, title) => handleImageZoom(url, title)}
      />

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
