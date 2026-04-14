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

  const shareOptions = [
    {
      key: 'email',
      label: 'Email',
      icon: <Mail size={20} />,
      iconClass: 'bg-red-500 text-white',
      onClick: handleEmailShare,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      iconClass: 'bg-emerald-500 text-white',
      onClick: handleWhatsAppShare,
    },
    {
      key: 'twitter',
      label: 'Twitter',
      icon: <span className="text-xl font-bold">X</span>,
      iconClass: 'bg-sky-500 text-white',
      onClick: handleTwitterShare,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: <span className="text-xl font-bold">f</span>,
      iconClass: 'bg-blue-600 text-white',
      onClick: handleFacebookShare,
    },
  ];

  return (
    <>
      {buttonStyle === 'icon' ? (
        <button
          onClick={handleNativeShare}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition-all hover:border-red-400 hover:bg-gray-50"
          title="Share listing"
        >
          <Share2 size={18} className="text-gray-800" />
        </button>
      ) : (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 rounded-lg border border-[#c2633a] bg-white px-6 py-3 text-[15px] font-semibold text-[#c2633a] transition-all hover:bg-[#c2633a] hover:text-white"
        >
          <Share2 size={18} />
          Share
        </button>
      )}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-5"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[480px] rounded-[20px] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="m-0 text-2xl font-bold text-[#1a1207]">
                  Share Listing
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-none bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-6 rounded-xl bg-gray-50 p-4">
                <h3 className="mb-2 text-base font-semibold text-[#1a1207]">
                  {listing.title}
                </h3>
                <p className="text-sm leading-[1.5] text-[#7c7060]">
                  {listing.description?.substring(0, 120)}...
                </p>
              </div>
              <div className="mb-6 flex gap-3">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-200 bg-[#faf8f4] px-4 py-3 text-sm text-[#7c7060]"
                />
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-2 rounded-lg border-none px-5 py-3 text-sm font-semibold text-white transition-all ${copied ? 'bg-emerald-500' : 'bg-gradient-to-br from-[#c2633a] to-[#e8a430]'}`}
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
              <div className="grid grid-cols-2 gap-3">
                {shareOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={opt.onClick}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3.5 transition-all hover:border-[#c2633a] hover:bg-gray-50"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${opt.iconClass}`}>
                      {opt.icon}
                    </div>
                    <span className="text-[15px] font-medium text-gray-800">{opt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShareButton;
