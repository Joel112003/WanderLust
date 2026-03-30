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
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 700,
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          {}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertTriangle size={24} color="#dc2626" />
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                  Report Listing Issue
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#6b7280' }}>
                  Help us resolve this problem quickly
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#fff',
                border: 'none',
                padding: 8,
                cursor: 'pointer',
                borderRadius: 8,
                display: 'flex',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {}
          <div style={{ padding: 24 }}>
            {}
            <div style={{
              background: '#f9fafb',
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                <Home size={20} color="#0d9488" />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 600 }}>
                    {listing?.title}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: 14,
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <MapPin size={14} />
                    {listing?.location || listing?.city}
                  </p>
                  {booking && (
                    <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#6b7280' }}>
                      Booking ID: {booking._id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 12
              }}>
                What's the problem? *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {reportTypes.map(type => (
                  <label
                    key={type.value}
                    style={{
                      padding: 14,
                      border: `2px solid ${
                        reportType === type.value
                          ? type.severity === 'critical' ? '#ef4444' : '#0d9488'
                          : '#e5e7eb'
                      }`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: reportType === type.value
                        ? type.severity === 'critical' ? '#fef2f2' : '#f0fdfa'
                        : '#fff',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10
                    }}
                  >
                    <input
                      type="radio"
                      value={type.value}
                      checked={reportType === type.value}
                      onChange={(e) => setReportType(e.target.value)}
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{
                      fontSize: 13,
                      fontWeight: 500,
                      flex: 1
                    }}>
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
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 8
              }}>
                Describe the Issue *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information about the problem. Include what you expected vs. what you found..."
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: 12,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                maxLength={1000}
              />
              <p style={{
                margin: '4px 0 0 0',
                fontSize: 12,
                color: '#6b7280',
                textAlign: 'right'
              }}>
                {description.length}/1000
              </p>
            </div>

            {/* Photo Upload */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 8
              }}>
                Evidence Photos * ({photos.length}/10)
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                id="photo-upload"
                disabled={uploading || photos.length >= 10}
              />

              <label
                htmlFor="photo-upload"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: 24,
                  border: '2px dashed #d1d5db',
                  borderRadius: 12,
                  cursor: uploading || photos.length >= 10 ? 'not-allowed' : 'pointer',
                  background: '#fafafa',
                  transition: 'all 0.2s',
                  opacity: uploading || photos.length >= 10 ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (photos.length < 10 && !uploading) {
                    e.currentTarget.style.borderColor = '#0d9488';
                    e.currentTarget.style.background = '#f0fdfa';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = '#fafafa';
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Processing photos...</span>
                  </>
                ) : (
                  <>
                    <Camera size={24} color="#0d9488" />
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                        Click to upload photos
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#6b7280' }}>
                        Take photos of the issue (max 5MB each)
                      </p>
                    </div>
                  </>
                )}
              </label>

              {/* Photo Preview Grid */}
              {photos.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: 12,
                  marginTop: 16
                }}>
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        paddingTop: '75%',
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <img
                        src={photo.preview}
                        alt={`Evidence ${index + 1}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(0, 0, 0, 0.7)',
                          border: 'none',
                          borderRadius: 6,
                          padding: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={14} color="#fff" />
                      </button>
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        padding: '4px 8px',
                        fontSize: 11,
                        color: '#fff',
                        textAlign: 'center'
                      }}>
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rebooking Option */}
            {isCriticalIssue && (
              <div style={{
                background: '#f0fdfa',
                border: '1px solid #14b8a6',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'start',
                  gap: 12,
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={requestRebooking}
                    onChange={(e) => setRequestRebooking(e.target.checked)}
                    style={{ width: 18, height: 18, marginTop: 2 }}
                  />
                  <div>
                    <p style={{
                      margin: '0 0 4px 0',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#115e59'
                    }}>
                      🏠 Request Automatic Rebooking
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: '#0f766e' }}>
                      We'll immediately find you alternative accommodation matching your
                      original booking criteria (price, location, dates) at no extra cost.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={onClose}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: 10,
                  background: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.5 : 1
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting || !reportType || !description.trim() || photos.length === 0}
                style={{
                  flex: 2,
                  padding: '14px 24px',
                  border: 'none',
                  borderRadius: 10,
                  background: (submitting || !reportType || !description.trim() || photos.length === 0)
                    ? '#d1d5db'
                    : 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: (submitting || !reportType || !description.trim() || photos.length === 0)
                    ? 'not-allowed'
                    : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
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

            {}
            <p style={{
              margin: '16px 0 0 0',
              fontSize: 12,
              color: '#6b7280',
              textAlign: 'center'
            }}>
              Our support team will review your report within 15 minutes and take appropriate action.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportListingModal;
