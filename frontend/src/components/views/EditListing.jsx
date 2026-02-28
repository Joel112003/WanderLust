import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8000";
mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_TOKEN || "YOUR_MAPBOX_ACCESS_TOKEN";

const CATEGORIES = [
  { value: "Mansion",    emoji: "🏰" },
  { value: "Farm",       emoji: "🚜" },
  { value: "Lake",       emoji: "🏞️" },
  { value: "Beach",      emoji: "🏖️" },
  { value: "Apartment",  emoji: "🏢" },
  { value: "Ski Resort", emoji: "⛷️" },
  { value: "Camping",    emoji: "⛺" },
  { value: "Cottage",    emoji: "🏡" },
  { value: "Luxury",     emoji: "💎" },
];

const INIT = {
  title: "", description: "", price: 0,
  location: "", country: "", category: "",
  guests: 1, bedrooms: 1, beds: 1, baths: 1,
};

/* ── Stepper ── */
const Stepper = ({ label, name, value, onChange, min = 1, max = 30 }) => (
  <div className="el-stepper">
    <span className="el-stepper__label">{label}</span>
    <div className="el-stepper__controls">
      <button type="button" onClick={() => onChange(name, Math.max(min, value - 1))}
        disabled={value <= min} className="el-stepper__btn">−</button>
      <span className="el-stepper__val">{value}</span>
      <button type="button" onClick={() => onChange(name, Math.min(max, value + 1))}
        disabled={value >= max} className="el-stepper__btn">+</button>
    </div>
  </div>
);

/* ── Field wrapper ── */
const Field = ({ label, children, hint }) => (
  <div className="el-field">
    <label className="el-field__label">{label}</label>
    {children}
    {hint && <p className="el-field__hint">{hint}</p>}
  </div>
);

export default function EditListing() {
  const [formData, setFormData]     = useState(INIT);
  const [imageFile, setImageFile]   = useState(null);
  const [preview, setPreview]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(true);
  const mapContainerRef             = useRef(null);
  const mapRef                      = useRef(null);
  const navigate                    = useNavigate();
  const { id }                      = useParams();

  /* ── init map ── */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [78.9629, 20.5937],
      zoom: 4,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  /* ── geocode ── */
  const geocode = useCallback(async (location, country) => {
    if (!mapRef.current || !location || !country) return;
    try {
      const q   = encodeURIComponent(`${location}, ${country}`);
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${mapboxgl.accessToken}`);
      const d   = await res.json();
      if (!d.features?.length) return;
      const coords = d.features[0].center;
      document.querySelectorAll(".mapboxgl-marker").forEach(m => m.remove());
      new mapboxgl.Marker({ color: "#6366f1" }).setLngLat(coords).addTo(mapRef.current);
      mapRef.current.flyTo({ center: coords, zoom: 12, essential: true });
    } catch { /* silent */ }
  }, []);

  /* ── fetch listing ── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/listings/${id}`);
        const l = data.data;
        setFormData({
          title: l.title || "", description: l.description || "",
          price: l.price || 0, location: l.location || "",
          country: l.country || "", category: l.category || "",
          guests: l.guests || 1, bedrooms: l.bedrooms || 1,
          beds: l.beds || 1, baths: l.baths || 1,
        });
        if (l.image?.url) setPreview(l.image.url);
        if (l.location && l.country) geocode(l.location, l.country);
      } catch {
        toast.error("Failed to load listing.");
      } finally {
        setFetching(false);
      }
    })();
  }, [id, geocode]);

  /* ── handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: name === "price" ? Number(value) : value }));
  };

  const handleStepper = (name, value) => setFormData(p => ({ ...p, [name]: value }));

  const handleLocation = (e) => {
    handleChange(e);
    if (formData.country) geocode(e.target.value, formData.country);
  };

  const handleCountry = (e) => {
    handleChange(e);
    if (formData.location) geocode(formData.location, e.target.value);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB."); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Saving changes…");
    try {
      const payload = new FormData();
      payload.append("listing", JSON.stringify({
        title: formData.title, description: formData.description,
        price: formData.price, location: formData.location,
        country: formData.country, category: formData.category,
        guests: formData.guests, bedrooms: formData.bedrooms,
        beds: formData.beds, baths: formData.baths,
      }));
      if (imageFile) payload.append("image", imageFile);

      const token = localStorage.getItem("authToken");
      const { data } = await axios.put(`${API_BASE_URL}/listings/${id}`, payload, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        transformRequest: (d, h) => { delete h["Content-Type"]; return d; },
      });

      if (data.success) {
        toast.success("Listing updated!", { id: toastId });
        setTimeout(() => navigate(`/listings/${id}`), 1200);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="el-loading-screen">
      <div className="el-spinner" />
      <p>Loading listing…</p>
    </div>
  );

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: "'DM Sans', sans-serif", fontSize: "14px", borderRadius: "12px" },
          success: { iconTheme: { primary: "#6366f1", secondary: "#fff" } },
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .el-page {
          min-height: 100vh;
          background: #f7f7f5;
          padding: 80px 16px 60px;
          font-family: 'DM Sans', sans-serif;
        }

        .el-shell {
          max-width: 860px;
          margin: 0 auto;
        }

        /* Header */
        .el-header { margin-bottom: 36px; }
        .el-header__eyebrow {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #6366f1;
          margin-bottom: 8px;
        }
        .el-header__title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 40px);
          color: #111;
          line-height: 1.15;
        }
        .el-header__sub {
          margin-top: 8px;
          font-size: 14px;
          color: #888;
        }

        /* Warning banner */
        .el-warning {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #fffbeb;
          border: 1px solid #fcd34d;
          border-radius: 14px;
          padding: 14px 18px;
          margin-bottom: 32px;
          font-size: 13.5px;
          color: #92400e;
          line-height: 1.5;
        }
        .el-warning__icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

        /* Card */
        .el-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #ebebeb;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .el-card__head {
          padding: 20px 28px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #aaa;
        }
        .el-card__body { padding: 28px; }
        .el-card__body--grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 600px) {
          .el-card__body--grid { grid-template-columns: 1fr; }
        }

        /* Field */
        .el-field { display: flex; flex-direction: column; gap: 6px; }
        .el-field__label { font-size: 13px; font-weight: 600; color: #444; }
        .el-field__hint { font-size: 12px; color: #aaa; }
        .el-input, .el-textarea, .el-select {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e5e5e5;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #111;
          background: #fafafa;
          transition: border-color .18s, box-shadow .18s;
          outline: none;
        }
        .el-input:focus, .el-textarea:focus, .el-select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,.1);
          background: #fff;
        }
        .el-textarea { resize: vertical; min-height: 110px; }
        .el-select { cursor: pointer; }

        /* Price input */
        .el-price-wrap { position: relative; }
        .el-price-wrap .el-input { padding-left: 32px; }
        .el-price-currency {
          position: absolute; left: 13px; top: 50%;
          transform: translateY(-50%);
          font-size: 14px; color: #888; pointer-events: none;
        }

        /* Category grid */
        .el-cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
          gap: 10px;
          margin-top: 4px;
        }
        .el-cat-btn {
          display: flex; flex-direction: column; align-items: center;
          gap: 4px; padding: 12px 8px; border-radius: 12px;
          border: 1.5px solid #e5e5e5; background: #fafafa;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500; color: #555;
          transition: all .15s;
        }
        .el-cat-btn:hover { border-color: #a5b4fc; background: #f5f3ff; color: #4f46e5; }
        .el-cat-btn.selected {
          border-color: #6366f1; background: #ede9fe; color: #4338ca;
        }
        .el-cat-btn__emoji { font-size: 22px; }

        /* Steppers */
        .el-steppers-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 480px) { .el-steppers-grid { grid-template-columns: 1fr; } }

        .el-stepper {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-radius: 12px;
          border: 1.5px solid #e5e5e5; background: #fafafa;
        }
        .el-stepper__label { font-size: 13px; font-weight: 500; color: #444; }
        .el-stepper__controls { display: flex; align-items: center; gap: 12px; }
        .el-stepper__btn {
          width: 30px; height: 30px; border-radius: 8px;
          border: 1.5px solid #e0e0e0; background: #fff;
          font-size: 18px; line-height: 1; cursor: pointer; color: #444;
          transition: all .15s; display: flex; align-items: center; justify-content: center;
        }
        .el-stepper__btn:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; background: #ede9fe; }
        .el-stepper__btn:disabled { opacity: .3; cursor: not-allowed; }
        .el-stepper__val { font-size: 16px; font-weight: 600; color: #111; min-width: 20px; text-align: center; }

        /* Image upload */
        .el-upload-zone {
          border: 2px dashed #ddd; border-radius: 14px;
          padding: 28px 20px; text-align: center;
          cursor: pointer; transition: all .2s;
          background: #fafafa; position: relative;
        }
        .el-upload-zone:hover { border-color: #a5b4fc; background: #f5f3ff; }
        .el-upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
        .el-upload-icon { font-size: 32px; margin-bottom: 8px; }
        .el-upload-text { font-size: 14px; font-weight: 500; color: #555; }
        .el-upload-sub { font-size: 12px; color: #aaa; margin-top: 4px; }

        .el-preview {
          margin-top: 16px; border-radius: 14px; overflow: hidden;
          aspect-ratio: 16/7; position: relative;
        }
        .el-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .el-preview__badge {
          position: absolute; bottom: 10px; left: 10px;
          background: rgba(0,0,0,.6); color: #fff;
          font-size: 11px; font-weight: 600; padding: 4px 10px;
          border-radius: 20px; backdrop-filter: blur(4px);
        }

        /* Map */
        .el-map { height: 220px; border-radius: 14px; overflow: hidden; border: 1.5px solid #e5e5e5; }

        /* Submit */
        .el-submit-row { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
        .el-btn {
          padding: 12px 28px; border-radius: 12px; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer; transition: all .18s;
          border: none; display: inline-flex; align-items: center; gap: 8px;
        }
        .el-btn--ghost {
          background: transparent; border: 1.5px solid #e0e0e0; color: #666;
        }
        .el-btn--ghost:hover { border-color: #999; color: #333; background: #f5f5f5; }
        .el-btn--primary {
          background: #6366f1; color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,.3);
        }
        .el-btn--primary:hover:not(:disabled) { background: #4f46e5; box-shadow: 0 6px 20px rgba(99,102,241,.4); }
        .el-btn--primary:disabled { opacity: .55; cursor: not-allowed; }

        /* Loading screen */
        .el-loading-screen {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 16px;
          font-family: 'DM Sans', sans-serif; color: #888;
        }
        .el-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid #e5e5e5; border-top-color: #6366f1;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="el-page">
        <div className="el-shell">
          {/* Header */}
          <motion.div className="el-header"
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
            <p className="el-header__eyebrow">Host Dashboard</p>
            <h1 className="el-header__title">Edit your listing</h1>
            <p className="el-header__sub">Changes are saved immediately and visible to guests.</p>
          </motion.div>

          {/* Warning */}
          <motion.div className="el-warning"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .1 }}>
            <span className="el-warning__icon">⚠️</span>
            <span>Please re-upload your photo when saving, even if you're not changing it — otherwise the current image will be removed.</span>
          </motion.div>

          <form onSubmit={handleSubmit}>
            {/* ── Basics ── */}
            <motion.div className="el-card"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}>
              <div className="el-card__head">Basic info</div>
              <div className="el-card__body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <Field label="Title">
                  <input className="el-input" name="title" value={formData.title}
                    onChange={handleChange} placeholder="Give your listing a great name" />
                </Field>
                <Field label="Description">
                  <textarea className="el-textarea" name="description" value={formData.description}
                    onChange={handleChange} placeholder="What makes your place special?" rows={4} />
                </Field>
                <Field label="Nightly rate (USD)">
                  <div className="el-price-wrap">
                    <span className="el-price-currency">$</span>
                    <input className="el-input" type="number" name="price" value={formData.price}
                      onChange={handleChange} min={0} placeholder="0" />
                  </div>
                </Field>
              </div>
            </motion.div>

            {/* ── Category ── */}
            <motion.div className="el-card"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}>
              <div className="el-card__head">Category</div>
              <div className="el-card__body">
                <div className="el-cat-grid">
                  {CATEGORIES.map(c => (
                    <button key={c.value} type="button"
                      className={`el-cat-btn${formData.category === c.value ? " selected" : ""}`}
                      onClick={() => setFormData(p => ({ ...p, category: c.value }))}>
                      <span className="el-cat-btn__emoji">{c.emoji}</span>
                      {c.value}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Capacity ── */}
            <motion.div className="el-card"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }}>
              <div className="el-card__head">Capacity</div>
              <div className="el-card__body">
                <div className="el-steppers-grid">
                  {[
                    { label: "Guests",   name: "guests",   max: 30 },
                    { label: "Bedrooms", name: "bedrooms", max: 20 },
                    { label: "Beds",     name: "beds",     max: 30 },
                    { label: "Baths",    name: "baths",    max: 15 },
                  ].map(s => (
                    <Stepper key={s.name} label={s.label} name={s.name}
                      value={formData[s.name]} onChange={handleStepper} max={s.max} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Photo ── */}
            <motion.div className="el-card"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}>
              <div className="el-card__head">Cover photo</div>
              <div className="el-card__body">
                <div className="el-upload-zone">
                  <input type="file" accept="image/*" onChange={handleImage} />
                  <div className="el-upload-icon">🖼️</div>
                  <p className="el-upload-text">{imageFile ? imageFile.name : "Click or drag to upload"}</p>
                  <p className="el-upload-sub">JPEG, PNG, WebP · max 5 MB</p>
                </div>
                <AnimatePresence>
                  {preview && (
                    <motion.div className="el-preview"
                      initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                      <img src={preview} alt="Preview" />
                      <span className="el-preview__badge">
                        {imageFile ? "New photo" : "Current photo"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* ── Location ── */}
            <motion.div className="el-card"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35 }}>
              <div className="el-card__head">Location</div>
              <div className="el-card__body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="el-card__body--grid" style={{ padding: 0 }}>
                  <Field label="City / neighbourhood">
                    <input className="el-input" name="location" value={formData.location}
                      onChange={handleLocation} placeholder="e.g. Brooklyn, New York" />
                  </Field>
                  <Field label="Country">
                    <input className="el-input" name="country" value={formData.country}
                      onChange={handleCountry} placeholder="e.g. United States" />
                  </Field>
                </div>
                <div ref={mapContainerRef} className="el-map" />
              </div>
            </motion.div>

            {/* ── Actions ── */}
            <motion.div className="el-submit-row"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .4 }}>
              <button type="button" className="el-btn el-btn--ghost"
                onClick={() => navigate(`/listings/${id}`)}>
                Cancel
              </button>
              <button type="submit" className="el-btn el-btn--primary" disabled={loading}>
                {loading ? "Saving…" : "Save changes"}
              </button>
            </motion.div>
          </form>
        </div>
      </div>
    </>
  );
}