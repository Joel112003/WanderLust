import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  Camera,
  Upload,
  Trash2,
  Send,
  Loader2,
  Check,
  MapPin,
  Home
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { safeGetItem } from '../../utilis/js/storage';

const API_URL = import.meta?.env?.VITE_APP_API_URL || 'http://localhost:8000';

const ReportListingModal = ({
  isOpen,
  onClose,
  booking,
  listing,
  onReportSuccess
}) => {
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestRebooking, setRequestRebooking] = useState(true);

  const reportTypes = [
    { value: 'not_exist', label: 'Listing does not exist', severity: 'critical' },
    { value: 'not_match', label: 'Doesn\'t match description', severity: 'high' },
    { value: 'unsafe', label: 'Unsafe or hazardous', severity: 'critical' },
    { value: 'unclean', label: 'Unclean or unhygienic', severity: 'high' },
    { value: 'no_amenities', label: 'Missing advertised amenities', severity: 'medium' },
    { value: 'wrong_location', label: 'Different location than listed', severity: 'high' },
    { value: 'other', label: 'Other issue', severity: 'medium' }
  ];

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (photos.length + files.length > 10) {
      toast.error('Maximum 10 photos allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = validFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              file,
              preview: e.target.result,
              name: file.name
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      setPhotos(prev => [...prev, ...uploadedPhotos]);
      toast.success(`${uploadedPhotos.length} photo(s) added`);
    } catch (error) {
      toast.error('Failed to process photos');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reportType) {
      toast.error('Please select a report type');
      return;
    }

    if (!description.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    if (photos.length === 0) {
      toast.error('Please add at least one photo as evidence');
      return;
    }

    setSubmitting(true);

    try {
      const token = safeGetItem('authToken');

      const formData = new FormData();
      formData.append('reportType', reportType);
      formData.append('description', description.trim());
      formData.append('bookingId', booking?._id);
      formData.append('listingId', listing?._id);
      formData.append('requestRebooking', requestRebooking);

      photos.forEach((photo, index) => {
        formData.append('photos', photo.file);
      });

      const response = await axios.post(
        `${API_URL}/reports/listing`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        const selectedType = reportTypes.find(t => t.value === reportType);
        const isCritical = selectedType?.severity === 'critical';

        toast.success(
          isCritical && requestRebooking
            ? '🎯 Report submitted! We\'re finding you alternative accommodation immediately.'
            : '✅ Report submitted successfully. Our support team will contact you shortly.',
          { duration: 5000 }
        );

        onReportSuccess?.(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Report submission error:', error);
      toast.error(
        error.response?.data?.message ||
        'Failed to submit report. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedType = reportTypes.find(t => t.value === reportType);
  const isCriticalIssue = selectedType?.severity === 'critical' || selectedType?.severity === 'high';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-5"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] w-full max-w-[700px] overflow-auto rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-br from-red-100 to-amber-100 p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} color="#dc2626" />
              <div>
                <h2 className="m-0 text-xl font-semibold">
                  Report Listing Issue
                </h2>
                <p className="mb-0 mt-1 text-[13px] text-gray-500">
                  Help us resolve this problem quickly
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex rounded-lg bg-white p-2 shadow-sm transition-colors hover:bg-gray-50"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6">
            <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <Home size={20} color="#0d9488" />
                <div className="flex-1">
                  <h3 className="mb-1 mt-0 text-base font-semibold">
                    {listing?.title}
                  </h3>
                  <p className="m-0 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={14} />
                    {listing?.location || listing?.city}
                  </p>
                  {booking && (
                    <p className="mb-0 mt-2 text-[13px] text-gray-500">
                      Booking ID: {booking._id}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-5">
              <label className="mb-3 block text-sm font-semibold">
                What's the problem? *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {reportTypes.map(type => (
                  <label
                    key={type.value}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-[10px] border-2 p-3.5 transition-all ${reportType === type.value ? (type.severity === 'critical' ? 'border-red-500 bg-red-50' : 'border-teal-600 bg-teal-50') : 'border-gray-200 bg-white'}`}
                  >
                    <input
                      type="radio"
                      value={type.value}
                      checked={reportType === type.value}
                      onChange={(e) => setReportType(e.target.value)}
                      className="h-[18px] w-[18px]"
                    />
                    <span className="flex-1 text-[13px] font-medium">
                      {type.label}
                    </span>
                    {type.severity === 'critical' && (
                      <AlertTriangle size={16} color="#ef4444" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold">
                Describe the Issue *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information about the problem. Include what you expected vs. what you found..."
                className="min-h-[120px] w-full resize-y rounded-lg border border-gray-300 p-3 text-sm"
                maxLength={1000}
              />
              <p className="mb-0 mt-1 text-right text-xs text-gray-500">
                {description.length}/1000
              </p>
            </div>

            {/* Photo Upload */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold">
                Evidence Photos * ({photos.length}/10)
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
                disabled={uploading || photos.length >= 10}
              />

              <label
                htmlFor="photo-upload"
                className={`flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-all ${uploading || photos.length >= 10 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-teal-600 hover:bg-teal-50'}`}
              >
                {uploading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-sm font-medium">Processing photos...</span>
                  </>
                ) : (
                  <>
                    <Camera size={24} color="#0d9488" />
                    <div>
                      <p className="m-0 text-sm font-medium">
                        Click to upload photos
                      </p>
                      <p className="mb-0 mt-1 text-xs text-gray-500">
                        Take photos of the issue (max 5MB each)
                      </p>
                    </div>
                  </>
                )}
              </label>

              {/* Photo Preview Grid */}
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-lg border border-gray-200 pt-[75%]"
                    >
                      <img
                        src={photo.preview}
                        alt={`Evidence ${index + 1}`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute right-2 top-2 flex items-center justify-center rounded-md bg-black/70 p-1.5"
                      >
                        <Trash2 size={14} color="#fff" />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-center text-[11px] text-white">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rebooking Option */}
            {isCriticalIssue && (
              <div className="mb-5 rounded-xl border border-teal-500 bg-teal-50 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={requestRebooking}
                    onChange={(e) => setRequestRebooking(e.target.checked)}
                    className="mt-0.5 h-[18px] w-[18px]"
                  />
                  <div>
                    <p className="mb-1 mt-0 text-sm font-semibold text-teal-900">
                      🏠 Request Automatic Rebooking
                    </p>
                    <p className="m-0 text-[13px] text-teal-700">
                      We'll immediately find you alternative accommodation matching your
                      original booking criteria (price, location, dates) at no extra cost.
                    </p>
                  </div>
                </label>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 rounded-[10px] border border-gray-300 bg-white px-6 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting || !reportType || !description.trim() || photos.length === 0}
                className={`flex flex-[2] items-center justify-center gap-2 rounded-[10px] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(13,148,136,0.3)] ${(submitting || !reportType || !description.trim() || photos.length === 0) ? 'cursor-not-allowed bg-gray-300' : 'bg-gradient-to-br from-teal-600 to-teal-500'}`}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Report
                  </>
                )}
              </button>
            </div>
            <p className="mb-0 mt-4 text-center text-xs text-gray-500">
              Our support team will review your report within 15 minutes and take appropriate action.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportListingModal;
