import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, Loader2, MessageSquare, Award } from "lucide-react";import "../../utilis/css/Review.css";

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
  if (!res.ok) throw new Error(
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
    <div className="rv-star-picker" onMouseLeave={() => setHover(0)}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          className={`rv-star-btn${(hover||value) >= n ? " active" : ""}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n>1?"s":""}`}
        >
          <Star size={26} fill={(hover||value) >= n ? "currentColor" : "none"} />
        </button>
      ))}
      {value > 0 && (
        <span className="rv-star-label">
          {["","Terrible","Poor","Okay","Good","Excellent"][value]}
        </span>
      )}
    </div>
  );
};

const RatingBar = ({ star, count, total }) => {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="rv-bar-row">
      <span className="rv-bar-label">{star}★</span>
      <div className="rv-bar-track">
        <motion.div
          className="rv-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: (5-star)*0.08, ease:"easeOut" }}
        />
      </div>
      <span className="rv-bar-count">{count}</span>
    </div>
  );
};

const ReviewCard = ({ review, currentUser, onDelete, deleting }) => {
  const isOwn = currentUser && review.author?.username === currentUser.username;
  return (
    <motion.div
      className="rv-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      layout
    >
      <div className="rv-card__top">
        {}
        <div className="rv-avatar">
          {(review.author?.username || "A")[0].toUpperCase()}
        </div>

        <div className="rv-card__meta">
          <span className="rv-card__author">
            {review.author?.username || "Anonymous"}
          </span>
          <span className="rv-card__date">{fmtDate(review.createdAt)}</span>
        </div>

        {}
        <div className="rv-card__stars">
          {[1,2,3,4,5].map(n => (
            <Star
              key={n} size={13}
              fill={n <= review.rating ? "currentColor" : "none"}
              className={n <= review.rating ? "rv-star-on" : "rv-star-off"}
            />
          ))}
        </div>
      </div>

      <p className="rv-card__body">{review.comment}</p>

      {isOwn && (
        <button
          className="rv-delete-btn"
          onClick={() => onDelete(review._id)}
          disabled={deleting}
          aria-label="Delete review"
        >
          {deleting
            ? <Loader2 size={13} className="rv-spin"/>
            : <Trash2 size={13}/>}
          {deleting ? "Deleting…" : "Delete"}
        </button>
      )}
    </motion.div>
  );
};

const Review = ({ listingId, onReviewSubmit }) => {
  const [reviews,   setReviews]   = useState([]);
  const [user,      setUser]      = useState(null);
  const [rating,    setRating]    = useState(0);
  const [comment,   setComment]   = useState("");
  const [error,     setError]     = useState("");
  const [loadingR,  setLoadingR]  = useState(true);
  const [loadingS,  setLoadingS]  = useState(false);
  const [loadingD,  setLoadingD]  = useState(false);

  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const d = await apiFetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(d.user || d);
      } catch {  }
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

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
     const token = getToken();
  console.log("Token:", token);
  console.log("Payload:", { rating, comment });
    if (!token)             return setError("You must be logged in to review.");
    if (!rating)            return setError("Please select a star rating.");
    if (comment.length < 10)return setError("Comment must be at least 10 characters.");

    setLoadingS(true);
    try {
      const d = await apiFetch(`${API_URL}/listings/${listingId}/reviews`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
body: JSON.stringify({ rating: Number(rating), comment: comment.trim() }),
      });
      const newR = { ...d.review, author: d.review.author || user };
      setReviews(prev => [newR, ...prev]);
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
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingD(false);
    }
  };

  const overall = avgRating(reviews);
  const dist = [5,4,3,2,1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
  }));

  return (
    <>

      <div className="rv-root">
        {}
        <AnimatePresence>
          {error && (
            <motion.div
              className="rv-error"
              role="alert"
              initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            >
              {error}
              <button className="rv-error-x" onClick={()=>setError("")}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        <div className="rv-summary">
          {}
          <div className="rv-score">
            <span className="rv-score__num">{overall.toFixed(1)}</span>
            <div className="rv-score__stars">
              {[1,2,3,4,5].map(n=>(
                <Star key={n} size={16}
                  fill={n<=Math.round(overall)?"currentColor":"none"}
                  className={n<=Math.round(overall)?"rv-star-on":"rv-star-off"}
                />
              ))}
            </div>
            <span className="rv-score__total">
              {reviews.length} review{reviews.length!==1?"s":""}
            </span>
          </div>

          {}
          {reviews.length > 0 && (
            <div className="rv-dist">
              {dist.map(({star,count})=>(
                <RatingBar key={star} star={star} count={count} total={reviews.length}/>
              ))}
            </div>
          )}
        </div>

        {}
        {token ? (
          <motion.div
            className="rv-form-card"
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.1 }}
          >
            <div className="rv-form-card__header">
              <MessageSquare size={16} className="rv-form-card__ico"/>
              <h4 className="rv-form-card__title">Leave a review</h4>
            </div>

            <form onSubmit={handleSubmit} className="rv-form">
              <div className="rv-form__row">
                <label className="rv-form__label">Your rating</label>
                <StarPicker value={rating} onChange={setRating}/>
              </div>

              <div className="rv-form__row">
                <label htmlFor="rv-comment" className="rv-form__label">
                  Your experience
                </label>
                <textarea
                  id="rv-comment"
                  className="rv-textarea"
                  rows={4}
                  placeholder="Share what you loved (or didn't)… min. 10 characters"
                  value={comment}
                  onChange={e=>setComment(e.target.value)}
                  minLength={10}
                  required
                />
                <span className="rv-char-count">{comment.length} chars</span>
              </div>

              <motion.button
                type="submit"
                className="rv-submit-btn"
                disabled={loadingS}
                whileHover={!loadingS?{scale:1.02}:{}}
                whileTap={!loadingS?{scale:0.97}:{}}
              >
                {loadingS
                  ? <><Loader2 size={15} className="rv-spin"/> Submitting…</>
                  : <><Star size={15}/> Submit review</>}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <div className="rv-login-nudge">
            <Star size={18} className="rv-star-on"/>
            <span>
              <a href="/auth/login" className="rv-login-link">Log in</a>
              {" "}to leave a review
            </span>
          </div>
        )}

        {}
        <div className="rv-list">
          {loadingR ? (
            <div className="rv-loading">
              <Loader2 size={22} className="rv-spin rv-loading__ico"/>
              <span>Loading reviews…</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="rv-empty">
              <MessageSquare size={32} strokeWidth={1.2}/>
              <p>No reviews yet — be the first!</p>
            </div>
          ) : (
            <AnimatePresence>
              {reviews.map(r => (
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
    </>
  );
};

export default Review;
