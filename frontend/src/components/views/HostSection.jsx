import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  MapPin,
  Languages,
  MessageCircle,
  Heart,
  Calendar,
  Award,
  Clock,
  Users,
  Phone,
  Mail,
  Copy,
  X,
  CheckCircle,
} from "lucide-react";

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

    .host-root * { box-sizing: border-box; }
    .host-root { font-family: 'DM Sans', sans-serif; color: #1a1a1a; }
    .host-serif { font-family: 'Playfair Display', serif; }

    .stat-card { transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease; }
    .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,.09); border-color: #fca5a5 !important; }

    .btn-contact { transition: background .2s, transform .18s, box-shadow .2s; }
    .btn-contact:hover { background: #dc2626 !important; transform: translateY(-2px); box-shadow: 0 10px 24px rgba(239,68,68,.3); }
    .btn-contact:active { transform: scale(.97); }

    .btn-fav { transition: border-color .2s, background .2s, transform .18s; }
    .btn-fav:hover { border-color: #fca5a5 !important; background: #fff5f5 !important; transform: translateY(-2px); }

    .avatar-inner { transition: transform .4s ease; }
    .avatar-wrap:hover .avatar-inner { transform: scale(1.06); }
    .avatar-wrap { transition: box-shadow .25s ease; cursor: pointer; }
    .avatar-wrap:hover { box-shadow: 0 0 0 5px rgba(239,68,68,.18) !important; border-radius: 50%; }

    .name-link { position: relative; display: inline-block; cursor: pointer; }
    .name-link::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0;
      width: 0; height: 2px;
      background: #ef4444;
      transition: width .3s ease;
    }
    .name-link:hover::after { width: 100%; }

    .dialog-backdrop { backdrop-filter: blur(3px); }
    .copy-btn { transition: background .15s; border-radius: 8px; }
    .copy-btn:hover { background: #f3f4f6; }
    .contact-row { transition: border-color .2s, box-shadow .2s; }
    .contact-row:hover { border-color: #fca5a5 !important; box-shadow: 0 4px 14px rgba(239,68,68,.08); }

    .fade-up { opacity: 0; transform: translateY(16px); transition: opacity .55s ease, transform .55s ease; }
    .fade-up.in { opacity: 1; transform: translateY(0); }
  `}</style>
);

const ContactHostDialog = ({ isOpen, onClose, owner }) => {
  const [copied, setCopied] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) setTimeout(() => setMounted(true), 10);
    else setMounted(false);
  }, [isOpen]);

  const copy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const close = () => {
    setMounted(false);
    setTimeout(onClose, 270);
  };

  const name = owner?.username || "Joel";
  const email = owner?.email || "joel@example.com";
  const phone = owner?.phoneNumber || "+1 (555) 123-4567";
  const pref = owner?.preferredContact || "Email";
  const resp = owner?.responseTime || "within an hour";
  const initial = name.charAt(0).toUpperCase();

  if (!isOpen) return null;

  return (
    <div
      className="dialog-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.38)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        opacity: mounted ? 1 : 0,
        transition: "opacity .27s ease",
      }}
      onClick={e => e.target === e.currentTarget && close()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%", maxWidth: 420,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,.18)",
          transform: mounted ? "scale(1) translateY(0)" : "scale(.93) translateY(22px)",
          opacity: mounted ? 1 : 0,
          transition: "transform .28s cubic-bezier(.34,1.46,.64,1), opacity .28s ease",
        }}
      >
<div style={{ padding: "20px 24px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 className="host-serif" style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "#111" }}>Contact Host</h3>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#9ca3af" }}>Reach out directly to {name}</p>
          </div>
          <button
            onClick={close}
            style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "#f3f4f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#e5e7eb"}
            onMouseLeave={e => e.currentTarget.style.background = "#f3f4f6"}
          >
            <X size={16} />
          </button>
        </div>
<div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: "2px solid #fecaca", flexShrink: 0 }}>
            {owner?.profilePic
              ? <img src={owner.profilePic} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontFamily: "Playfair Display, serif", fontWeight: 600 }}>{initial}</div>
            }
          </div>
          <div>
            <div className="host-serif" style={{ fontSize: 18, color: "#111", fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Host since {new Date(owner?.createdAt || Date.now()).getFullYear()}</div>
          </div>
        </div>
<div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { icon: <Mail size={16} color="#ef4444" />, label: "Email", value: email, field: "email", bg: "#fff5f5" },
            { icon: <Phone size={16} color="#22c55e" />, label: "Phone", value: phone, field: "phone", bg: "#f0fdf4" },
          ].map(({ icon, label, value, field, bg }) => (
            <div
              key={field}
              className="contact-row"
              style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, color: "#111", fontWeight: 500 }}>{value}</div>
              </div>
              <button
                className="copy-btn"
                onClick={() => copy(value, field)}
                style={{ border: "none", background: "none", cursor: "pointer", padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {copied === field
                  ? <CheckCircle size={16} color="#22c55e" />
                  : <Copy size={16} color="#9ca3af" />}
              </button>
            </div>
          ))}
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
            <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10, padding: "11px 14px" }}>
              <div style={{ fontSize: 10, color: "#ef4444", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>Prefers</div>
              <div style={{ fontSize: 13, color: "#111", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
                <MessageCircle size={13} color="#ef4444" /> {pref}
              </div>
            </div>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "11px 14px" }}>
              <div style={{ fontSize: 10, color: "#16a34a", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>Response</div>
              <div style={{ fontSize: 13, color: "#111", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
                <Clock size={13} color="#16a34a" /> {resp}
              </div>
            </div>
          </div>
        </div>
<div style={{ padding: "0 24px 22px" }}>
          <button
            onClick={close}
            className="btn-contact"
            style={{ width: "100%", padding: "14px", background: "#ef4444", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", letterSpacing: ".02em" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const HostSection = ({ owner }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: .12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const initial = (owner?.username || "H").charAt(0).toUpperCase();

  const getHostingDuration = () => {
    if (!owner?.createdAt) return "New host";
    const yrs = new Date().getFullYear() - new Date(owner.createdAt).getFullYear();
    return yrs <= 0 ? "New host" : `${yrs}+ years hosting`;
  };

  const joinDate = new Date(owner?.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const stats = [
    { icon: <MapPin size={18} color="#ef4444" />, title: "Location", value: owner?.location || "San Francisco, USA", bg: "#fff5f5", delay: 100 },
    { icon: <Languages size={18} color="#3b82f6" />, title: "Languages", value: owner?.languages?.join(", ") || "English, Spanish", bg: "#eff6ff", delay: 180 },
    { icon: <Clock size={18} color="#22c55e" />, title: "Response Rate", value: owner?.responseRate || "95%", bg: "#f0fdf4", delay: 260 },
    { icon: <Users size={18} color="#f59e0b" />, title: "Guests Hosted", value: owner?.totalGuests || 120, bg: "#fffbeb", delay: 340 },
  ];

  return (
    <div className="host-root" ref={ref}>
      <GlobalStyle />

      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 32, paddingBottom: 40 }}>
<div
          className={`fade-up ${visible ? "in" : ""}`}
          style={{ display: "flex", alignItems: "flex-start", gap: 28, marginBottom: 32, flexWrap: "wrap" }}
        >
<div
            className="avatar-wrap"
            onClick={() => setDialogOpen(true)}
            style={{ position: "relative", flexShrink: 0 }}
          >
            <div style={{ width: 108, height: 108, borderRadius: "50%", overflow: "hidden", border: "4px solid #fff", boxShadow: "0 4px 18px rgba(0,0,0,.12)" }}>
              {owner?.profilePic
                ? <img src={owner.profilePic} alt={owner?.username || "Host"} className="avatar-inner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div className="avatar-inner" style={{ width: "100%", height: "100%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="host-serif" style={{ color: "#fff", fontSize: 40, fontWeight: 600 }}>{initial}</span>
                  </div>
              }
            </div>
            {owner?.superHost && (
              <div style={{ position: "absolute", bottom: -4, right: -4, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 100, letterSpacing: ".06em", textTransform: "uppercase", boxShadow: "0 2px 8px rgba(239,68,68,.4)" }}>
                Superhost
              </div>
            )}
          </div>
<div style={{ flex: 1, minWidth: 200 }}>
            <h2
              className="host-serif name-link"
              onClick={() => setDialogOpen(true)}
              style={{ fontSize: 30, fontWeight: 600, margin: "0 0 10px", color: "#111", lineHeight: 1.2 }}
            >
              Hosted by {owner?.username || "Joel"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, color: "#6b7280" }}>
                <Calendar size={14} color="#ef4444" />
                <span><strong style={{ color: "#374151" }}>Joined:</strong> {joinDate}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5 }}>
                <Shield size={14} color="#22c55e" />
                <span style={{ color: "#374151", fontWeight: 500 }}>Verified Host</span>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 2, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#6b7280" }}>
                  <Clock size={13} color="#3b82f6" /> Responds {owner?.responseTime || "within an hour"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#6b7280" }}>
                  <Award size={13} color="#a855f7" /> {getHostingDuration()}
                </span>
              </div>
            </div>
          </div>
        </div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 28 }}>
          {stats.map((s, i) => (
            <div
              key={i}
              className={`stat-card fade-up ${visible ? "in" : ""}`}
              style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "18px 16px", transitionDelay: `${s.delay}ms` }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 14.5, color: "#111", fontWeight: 500 }}>{s.value}</div>
            </div>
          ))}
        </div>
<div
          className={`fade-up ${visible ? "in" : ""}`}
          style={{ background: "#fafafa", border: "1.5px solid #e5e7eb", borderRadius: 18, padding: "24px 26px", marginBottom: 28, transitionDelay: "400ms" }}
        >
          <h3 className="host-serif" style={{ fontSize: 20, fontWeight: 600, margin: "0 0 10px", color: "#111" }}>
            About {owner?.username || "Joel"}
          </h3>
          <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.78, fontSize: 14.5 }}>
            {owner?.bio || "Hello! I'm a passionate host who loves to share my space with travelers from around the world. I enjoy hiking, photography, and exploring new cultures. I'm always available to help make your stay comfortable and memorable."}
          </p>
        </div>
<div
          className={`fade-up ${visible ? "in" : ""}`}
          style={{ display: "flex", gap: 12, flexWrap: "wrap", transitionDelay: "500ms" }}
        >
          <button
            onClick={() => setDialogOpen(true)}
            className="btn-contact"
            style={{ flex: 1, minWidth: 160, padding: "15px 20px", background: "#ef4444", border: "none", borderRadius: 14, color: "#fff", fontSize: 14.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <MessageCircle size={17} /> Contact Host
          </button>
          <button
            onClick={() => setSaved(s => !s)}
            className="btn-fav"
            style={{ flex: 1, minWidth: 160, padding: "15px 20px", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, color: "#374151", fontSize: 14.5, fontWeight: 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <Heart
              size={17}
              style={{ fill: saved ? "#ef4444" : "none", color: saved ? "#ef4444" : "#9ca3af", transition: "all .2s" }}
            />
            {saved ? "Saved!" : "Save to Favorites"}
          </button>
        </div>
      </div>

      <ContactHostDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} owner={owner} />
    </div>
  );
};

export default HostSection;
