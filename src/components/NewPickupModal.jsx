import React, { useState } from 'react';
import { X, Upload, FileText, Sparkles, Calendar, Loader2 } from 'lucide-react';
import { api } from '../api/client';

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

export default function NewPickupModal({ isOpen, onClose, onSubmit }) {
  const [pickupDate, setPickupDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      setUploadingPhoto(true);
      try {
        const res = await api.upload.uploadImage(file, 'citizen-pickups');
        if (res?.url) {
          setUploadedUrl(res.url);
        }
      } catch (err) {
        console.warn('Pickup photo upload fallback to preview:', err);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      const todayFormatted = (() => {
        const d = new Date();
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
      })();
      onSubmit({
        date: formatDateForDisplay(pickupDate) || todayFormatted,
        notes,
        photoUrl: uploadedUrl || photoPreview,
      });
    }
    setNotes('');
    setPhotoPreview(null);
    setUploadedUrl(null);
    setPickupDate(getTodayString());
    onClose();
  };

  const handleClose = () => {
    setNotes('');
    setPhotoPreview(null);
    setUploadedUrl(null);
    setPickupDate(getTodayString());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg animate-scale-in overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-surface-200/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-100 bg-gradient-to-r from-eco-50 to-teal-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-eco-500" />
            <div>
              <h3 className="text-lg font-bold text-surface-800">New Pickup Request</h3>
              <p className="text-xs text-surface-500">Select date for doorstep collection</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-all"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Preferred Pickup Date */}
          <div>
            <label htmlFor="pickup-date-input" className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
              <Calendar className="h-4 w-4 text-eco-500" />
              <span>Preferred Date</span>
              <span className="text-xs text-rose-500 font-normal">*</span>
            </label>
            <input
              id="pickup-date-input"
              type="date"
              required
              min={getTodayString()}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm font-medium text-surface-700 focus:border-eco-400 focus:ring-2 focus:ring-eco-400/20 focus:outline-none transition-all cursor-pointer"
            />
            <p className="text-[11px] text-surface-400 mt-1">Pickups are scheduled Monday through Saturday</p>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
              <FileText className="h-4 w-4 text-eco-500" />
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Ring the doorbell, gate code, approximate weight..."
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 focus:border-eco-400 focus:ring-2 focus:ring-eco-400/20 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Upload Photo */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
              <Upload className="h-4 w-4 text-eco-500" />
              Upload Photo (Optional)
            </label>
            <label
              htmlFor="pickup-photo"
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-200 bg-surface-50/50 p-5 text-center hover:border-eco-300 transition-colors cursor-pointer relative overflow-hidden block"
            >
              <input
                id="pickup-photo"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {uploadingPhoto ? (
                <div className="flex flex-col items-center justify-center py-4 text-eco-600">
                  <Loader2 className="h-6 w-6 animate-spin mb-1" />
                  <span className="text-xs font-semibold">Uploading photo to server…</span>
                </div>
              ) : photoPreview ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold">
                    Click to change photo
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="h-7 w-7 text-surface-300 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-surface-600">Upload Photo</p>
                  <p className="text-[11px] text-surface-400 mt-0.5">Drag & drop or click to browse</p>
                </div>
              )}
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-100">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-eco-500 to-eco-600 hover:from-eco-600 hover:to-eco-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-eco-500/25 hover:shadow-xl transition-all active:scale-[0.97] cursor-pointer"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
