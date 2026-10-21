import React, { useState } from 'react';
import { X, Upload, MapPin, Tag, FileText, Camera, Sparkles } from 'lucide-react';

import { api } from '../api/client';

const categories = [
  'Pothole / Road Damage',
  'Street Light Outage',
  'Garbage Overflow',
  'Water Supply Issue',
  'Drainage / Sewage',
  'Public Safety Hazard',
  'Noise / Pollution',
  'Overflowing Bin',
  'Illegal Dumping',
  'Missed Pickup',
  'Hazardous Plastic',
  'Burning Waste',
  'Other',
];

export default function ReportIssueModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    category: 'Garbage Overflow',
    location: '',
    description: '',
    imagePreview: null,
    imageUrl: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setForm((prev) => ({ ...prev, imagePreview: URL.createObjectURL(file) }));

    setUploading(true);
    try {
      const res = await api.upload.uploadImage(file, 'citizen-complaints');
      if (res?.url) {
        setForm((prev) => ({ ...prev, imageUrl: res.url }));
      }
    } catch (err) {
      console.warn('Image upload failed, fallback:', err);
      setUploadError(err.message || 'Could not upload image to server');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        title: form.title || 'Civic Issue Report',
        category: form.category || 'Garbage Overflow',
        location: form.location || 'Local Municipal Ward',
        description: form.description || 'Reported civic issue requiring municipal attention.',
        imageUrl: form.imageUrl || form.imagePreview,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg max-h-[90vh] animate-scale-in overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-surface-200/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-100 bg-gradient-to-r from-amber-50 to-red-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-bold text-surface-800">Report New Issue</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-all"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
              <FileText className="h-4 w-4 text-amber-500" />
              Issue Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Deep Pothole on Main Road"
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
              <Tag className="h-4 w-4 text-amber-500" />
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all appearance-none"
              required
            >
              <option value="">Select issue category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
              <MapPin className="h-4 w-4 text-amber-500" />
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g., Sector 14, Near Metro Pillar #42"
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
              <FileText className="h-4 w-4 text-amber-500" />
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Describe the issue in detail..."
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all resize-none"
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 mb-2">
              <Camera className="h-4 w-4 text-amber-500" />
              Photo Evidence
            </label>
            <label
              htmlFor="issue-photo"
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-200 bg-surface-50/50 p-4 text-center hover:border-amber-300 transition-colors cursor-pointer relative overflow-hidden"
            >
              <input
                id="issue-photo"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {form.imagePreview ? (
                <div className="relative w-full h-36 rounded-lg overflow-hidden">
                  <img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold">
                    Click to change photo
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <Camera className="h-9 w-9 text-surface-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-surface-600">Upload Photo Evidence</p>
                  <p className="text-xs text-surface-400 mt-0.5">Click to browse or drag & drop (JPG, PNG)</p>
                </div>
              )}
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all active:scale-[0.97]"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
