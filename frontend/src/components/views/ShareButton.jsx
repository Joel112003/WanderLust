import React, { useState } from 'react';
import { Share2, X, Copy, Check, Mail, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ShareButton = ({ listing, buttonStyle = 'icon' }) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!listing || !listing._id) {
    return null;
  }

  const shareUrl = `${window.location.origin}/listings/${listing._id}`;
  const shareTitle = listing.title || 'Check out this amazing property!';
  const shareText = `${shareTitle} - ${listing.description?.substring(0, 100) || ''}...`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(`${shareText}\n\nView listing: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {}
      {buttonStyle === 'icon' ? (
        <button
          onClick={handleNativeShare}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid #e5e7eb',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f9fafb';
            e.currentTarget.style.borderColor = '#c2633a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
          title="Share listing"
        >
          <Share2 size={18} color="#1f2937" />
        </button>
      ) : (
        <button
          onClick={handleNativeShare}
          style={{
            padding: '12px 24px',
            border: '1px solid #c2633a',
            borderRadius: 8,
            background: 'white',
            color: '#c2633a',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#c2633a';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#c2633a';
          }}
        >
          <Share2 size={18} />
          Share
        </button>
      )}

      {}
      <AnimatePresence>
        {showModal && (
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
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 20
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: 20,
                padding: 32,
                maxWidth: 480,
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
            >
              {}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1a1207'
                }}>
                  Share Listing
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: 'none',
                    background: '#f3f4f6',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {}
              <div style={{
                padding: 16,
                background: '#f9fafb',
                borderRadius: 12,
                marginBottom: 24
              }}>
                <h3 style={{
                  margin: '0 0 8px',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1a1207'
                }}>
                  {listing.title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  color: '#7c7060',
                  lineHeight: 1.5
                }}>
                  {listing.description?.substring(0, 120)}...
                </p>
              </div>

              {}
              <div style={{
                display: 'flex',
                gap: 12,
                marginBottom: 24
              }}>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#7c7060',
                    background: '#faf8f4'
                  }}
                />
                <button
                  onClick={handleCopyLink}
                  style={{
                    padding: '12px 20px',
                    border: 'none',
                    borderRadius: 8,
                    background: copied ? '#10b981' : 'linear-gradient(135deg, #c2633a, #e8a430)',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s'
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12
              }}>
                {}
                <button
                  onClick={handleEmailShare}
                  style={{
                    padding: '14px 20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#c2633a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#ea4335',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Mail size={20} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#1f2937' }}>
                    Email
                  </span>
                </button>

                {}
                <button
                  onClick={handleWhatsAppShare}
                  style={{
                    padding: '14px 20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#c2633a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#25d366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <MessageCircle size={20} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#1f2937' }}>
                    WhatsApp
                  </span>
                </button>

                {}
                <button
                  onClick={handleTwitterShare}
                  style={{
                    padding: '14px 20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#c2633a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#1da1f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 700
                  }}>
                    𝕏
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#1f2937' }}>
                    Twitter
                  </span>
                </button>

                {}
                <button
                  onClick={handleFacebookShare}
                  style={{
                    padding: '14px 20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#c2633a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#1877f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 700
                  }}>
                    f
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#1f2937' }}>
                    Facebook
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShareButton;
