import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, Loader2, MessageSquare } from "lucide-react";

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8000";

const getToken = () => localStorage.getItem("authToken");

const apiFetch = async (url, options = {}) => {
  const { headers: extraHeaders, ...rest } = options;

  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.errors?.comment || data.errors?.rating || data.message || data.error || "Request failed"
    );
  return data;
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const avgRating = (list) =>
  list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;

const StarPicker = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`cursor-pointer border-none bg-transparent p-0.5 transition-all duration-200 ${
            (hover || value) >= n ? "text-[#e03030]" : "text-[#e5e5e5]"
          } hover:scale-125`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star size={26} fill={(hover || value) >= n ? "currentColor" : "none"} />
        </button>
      ))}

      {value > 0 && (
        <span className="ml-2 text-[12.5px] font-semibold tracking-[0.02em] text-[#e03030]">
          {["", "Terrible", "Poor", "Okay", "Good", "Excellent"][value]}
        </span>
      )}
    </div>
  );
};

const RatingBar = ({ star, count, total }) => {
  const pct = total ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2.5">
      <span className="w-[22px] text-right text-[11.5px] font-semibold text-[#aaa]">{star}★</span>
      <div className="h-[7px] flex-1 overflow-hidden rounded-md bg-[#f0eded]">
        <motion.div
          className="h-full rounded-md bg-gradient-to-r from-[#e03030] to-[#ff8f6b]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: (5 - star) * 0.08, ease: "easeOut" }}
        />
      </div>
      <span className="w-[18px] text-right text-[11.5px] text-[#bbb]">{count}</span>
    </div>
  );
};

const ReviewCard = ({ review, currentUser, onDelete, deleting }) => {
  const isOwn = currentUser && review.author?.username === currentUser.username;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-[#f0eded] bg-white px-5 py-[18px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.07)]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      layout
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e03030] to-[#ff8f6b] text-[15px] font-bold text-white">
          {(review.author?.username || "A")[0].toUpperCase()}
        </div>

        <div className="flex flex-1 flex-col gap-px">
          <span className="text-sm font-semibold text-[#1a1a1a]">
            {review.author?.username || "Anonymous"}
          </span>
          <span className="text-[11.5px] text-[#bbb]">{fmtDate(review.createdAt)}</span>
        </div>

        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={13}
              fill={n <= review.rating ? "currentColor" : "none"}
              className={n <= review.rating ? "text-[#e03030]" : "text-[#e5e5e5]"}
            />
          ))}
        </div>
      </div>

      <p className="mb-3 border-l-2 border-[#f5eded] pl-3 text-[13.5px] leading-7 text-[#666]">
        {review.comment}
      </p>

      {isOwn && (
        <button
          className="inline-flex items-center gap-1 rounded-[7px] border border-[#ffc5c5] bg-[#fff3f3] px-3 py-1.5 text-xs font-semibold text-[#e03030] transition-colors hover:border-[#e03030] hover:bg-[#ffe8e8] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onDelete(review._id)}
          disabled={deleting}
          aria-label="Delete review"
        >
          {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          {deleting ? "Deleting…" : "Delete"}
        </button>
      )}
    </motion.div>
  );
};

const Review = ({ listingId, onReviewSubmit }) => {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loadingR, setLoadingR] = useState(true);
  const [loadingS, setLoadingS] = useState(false);
  const [loadingD, setLoadingD] = useState(false);

  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const d = await apiFetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(d.user || d);
      } catch {
        // ignore
      }
    })();
  }, [token]);

  const fetchReviews = useCallback(async () => {
    setLoadingR(true);
    setError("");
    try {
      const d = await apiFetch(`${API_URL}/listings/${listingId}/reviews?page=1&limit=20`);
      if (d.success) setReviews(d.reviews);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingR(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const currentToken = getToken();
    if (!currentToken) return setError("You must be logged in to review.");
    if (!rating) return setError("Please select a star rating.");
    if (comment.length < 10) return setError("Comment must be at least 10 characters.");

    setLoadingS(true);
    try {
      const d = await apiFetch(`${API_URL}/listings/${listingId}/reviews`, {
        method: "POST",
        headers: { Authorization: `Bearer ${currentToken}` },
        body: JSON.stringify({ rating: Number(rating), comment: comment.trim() }),
      });
      const newR = { ...d.review, author: d.review.author || user };
      setReviews((prev) => [newR, ...prev]);
      setRating(0);
      setComment("");
      onReviewSubmit?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingS(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!token) return setError("You must be logged in.");
    setLoadingD(true);
    try {
      await apiFetch(`${API_URL}/listings/${listingId}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingD(false);
    }
  };

  const overall = avgRating(reviews);
  const dist = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  return (
    <div className="flex flex-col gap-7 font-sans">
      <AnimatePresence>
        {error && (
          <motion.div
            className="flex items-center justify-between rounded-[10px] border border-[#ffc5c5] border-l-4 border-l-[#e03030] bg-[#fff3f3] px-4 py-3 text-[13.5px] text-[#c12a2a]"
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
            <button
              className="bg-transparent px-1 py-0.5 text-[13px] leading-none text-[#c12a2a] transition-opacity hover:opacity-60"
              onClick={() => setError("")}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-10 border-b border-[#f0eded] pb-6 max-[560px]:flex-col max-[560px]:items-start max-[560px]:gap-5">
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <span className="bg-gradient-to-br from-[#e03030] to-[#ff7b5e] bg-clip-text font-serif text-[3.2rem] font-bold leading-none text-transparent">
            {overall.toFixed(1)}
          </span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={16}
                fill={n <= Math.round(overall) ? "currentColor" : "none"}
                className={n <= Math.round(overall) ? "text-[#e03030]" : "text-[#e5e5e5]"}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-[#bbb]">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
        </div>

        {reviews.length > 0 && (
          <div className="flex min-w-[180px] flex-1 flex-col gap-[7px] max-[560px]:w-full">
            {dist.map(({ star, count }) => (
              <RatingBar key={star} star={star} count={count} total={reviews.length} />
            ))}
          </div>
        )}
      </div>

      {token ? (
        <motion.div
          className="rounded-[18px] border border-[#ede8e8] bg-[#faf8f8] px-6 py-[22px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-[18px] flex items-center gap-2">
            <MessageSquare size={16} className="text-[#e03030]" />
            <h4 className="m-0 font-serif text-base font-semibold text-[#1a1a1a]">Leave a review</h4>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#bbb]">Your rating</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="rv-comment" className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#bbb]">
                Your experience
              </label>
              <textarea
                id="rv-comment"
                className="min-h-[100px] w-full resize-y rounded-xl border border-[#ede8e8] bg-white px-3.5 py-3 text-[13.5px] text-[#111] outline-none transition-all placeholder:text-[#ccc] focus:border-[#e03030] focus:shadow-[0_0_0_3px_rgba(224,48,48,0.09)]"
                rows={4}
                placeholder="Share what you loved (or didn't)… min. 10 characters"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                minLength={10}
                required
              />
              <span className="-mt-1 text-right text-[11px] text-[#ccc]">{comment.length} chars</span>
            </div>

            <motion.button
              type="submit"
              className="inline-flex w-fit items-center justify-center gap-1.5 self-start rounded-[10px] border-none bg-gradient-to-br from-[#e03030] to-[#c91a1a] px-6 py-3 text-sm font-semibold text-white shadow-[0_5px_18px_rgba(201,26,26,0.25)] transition-shadow hover:shadow-[0_8px_24px_rgba(201,26,26,0.36)] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loadingS}
              whileHover={!loadingS ? { scale: 1.02 } : {}}
              whileTap={!loadingS ? { scale: 0.97 } : {}}
            >
              {loadingS ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Star size={15} /> Submit review
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-[#f5dada] bg-[#fff8f8] px-[18px] py-[14px] text-[13.5px] text-[#888]">
          <Star size={18} className="text-[#e03030]" />
          <span>
            <a href="/auth/login" className="font-semibold text-[#e03030] underline hover:text-[#c91a1a]">
              Log in
            </a>{" "}
            to leave a review
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3.5">
        {loadingR ? (
          <div className="flex items-center justify-center gap-2.5 py-8 text-[13.5px] text-[#bbb]">
            <Loader2 size={22} className="animate-spin text-[#e03030]" />
            <span>Loading reviews…</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 py-12 text-center text-[13.5px] text-[#ccc]">
            <MessageSquare size={32} strokeWidth={1.2} />
            <p>No reviews yet — be the first!</p>
          </div>
        ) : (
          <AnimatePresence>
            {reviews.map((r) => (
              <ReviewCard
                key={r._id}
                review={r}
                currentUser={user}
                onDelete={handleDelete}
                deleting={loadingD}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Review;