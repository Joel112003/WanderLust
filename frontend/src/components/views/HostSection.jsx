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

  if (!isOpen) return null;

  const name = owner?.username || "Joel";
  const email = owner?.email || "joel@example.com";
  const phone = owner?.phoneNumber || "+1 (555) 123-4567";
  const pref = owner?.preferredContact || "Email";
  const resp = owner?.responseTime || "within an hour";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity duration-300 ${mounted ? "opacity-100" : "opacity-0"}`}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        className={`w-full max-w-[420px] overflow-hidden rounded-[20px] bg-white shadow-[0_24px_64px_rgba(0,0,0,.18)] transition-all duration-300 ${mounted ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-95 opacity-0"}`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Contact Host</h3>
            <p className="mt-1 text-sm text-gray-400">Reach out directly to {name}</p>
          </div>
          <button
            onClick={close}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3.5 px-6 pt-5">
          <div className="h-13 w-13 shrink-0 overflow-hidden rounded-full border-2 border-red-200">
            {owner?.profilePic ? (
              <img src={owner.profilePic} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-red-500 text-2xl font-semibold text-white">
                {initial}
              </div>
            )}
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{name}</div>
            <div className="mt-0.5 text-xs text-gray-400">
              Host since {new Date(owner?.createdAt || Date.now()).getFullYear()}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 px-6 py-4.5">
          {[
            {
              icon: <Mail size={16} className="text-red-500" />,
              label: "Email",
              value: email,
              field: "email",
              bg: "bg-red-50",
            },
            {
              icon: <Phone size={16} className="text-green-500" />,
              label: "Phone",
              value: phone,
              field: "phone",
              bg: "bg-green-50",
            },
          ].map(({ icon, label, value, field, bg }) => (
            <div
              key={field}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-red-300 hover:shadow-[0_4px_14px_rgba(239,68,68,.08)]"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                {icon}
              </div>
              <div className="flex-1">
                <div className="mb-0.5 text-[10px] uppercase tracking-[0.07em] text-gray-400">{label}</div>
                <div className="text-sm font-medium text-gray-900">{value}</div>
              </div>
              <button
                className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                onClick={() => copy(value, field)}
              >
                {copied === field ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} className="text-gray-400" />
                )}
              </button>
            </div>
          ))}

          <div className="mt-1 grid grid-cols-2 gap-2.5">
            <div className="rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5">
              <div className="mb-1 text-[10px] uppercase tracking-[0.07em] text-red-500">Prefers</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                <MessageCircle size={13} className="text-red-500" /> {pref}
              </div>
            </div>
            <div className="rounded-[10px] border border-green-200 bg-green-50 px-3.5 py-2.5">
              <div className="mb-1 text-[10px] uppercase tracking-[0.07em] text-green-600">Response</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                <Clock size={13} className="text-green-600" /> {resp}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5.5">
          <button
            onClick={close}
            className="w-full rounded-xl bg-red-500 px-4 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-[0_10px_24px_rgba(239,68,68,.3)]"
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
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.12 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const initial = (owner?.username || "H").charAt(0).toUpperCase();
  const getHostingDuration = () => {
    if (!owner?.createdAt) return "New host";
    const yrs =
      new Date().getFullYear() - new Date(owner.createdAt).getFullYear();
    return yrs <= 0 ? "New host" : `${yrs}+ years hosting`;
  };

  const joinDate = new Date(owner?.createdAt || Date.now()).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

  const stats = [
    {
      icon: <MapPin size={18} className="text-red-500" />,
      title: "Location",
      value: owner?.location || "San Francisco, USA",
      bg: "bg-red-50",
    },
    {
      icon: <Languages size={18} className="text-blue-500" />,
      title: "Languages",
      value: owner?.languages?.join(", ") || "English, Spanish",
      bg: "bg-blue-50",
    },
    {
      icon: <Clock size={18} className="text-green-500" />,
      title: "Response Rate",
      value: owner?.responseRate || "95%",
      bg: "bg-green-50",
    },
    {
      icon: <Users size={18} className="text-amber-500" />,
      title: "Guests Hosted",
      value: owner?.totalGuests || 120,
      bg: "bg-amber-50",
    },
  ];

  return (
    <div ref={ref} className="text-gray-900">
      <div className="border-t border-gray-200 py-10">
        <div
          className={`mb-8 flex flex-wrap items-start gap-7 transition-all duration-500 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <div
            onClick={() => setDialogOpen(true)}
            className="group relative shrink-0 cursor-pointer"
          >
            <div className="h-27 w-27 overflow-hidden rounded-full border-4 border-white shadow-[0_4px_18px_rgba(0,0,0,.12)] transition-all group-hover:shadow-[0_0_0_5px_rgba(239,68,68,.18)]">
              {owner?.profilePic ? (
                <img
                  src={owner.profilePic}
                  alt={owner?.username || "Host"}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-red-500">
                  <span className="text-4xl font-semibold text-white">{initial}</span>
                </div>
              )}
            </div>
            {owner?.superHost && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-white shadow-[0_2px_8px_rgba(239,68,68,.4)]">
                Superhost
              </div>
            )}
          </div>

          <div className="min-w-[200px] flex-1">
            <h2
              onClick={() => setDialogOpen(true)}
              className="mb-2.5 inline-block cursor-pointer text-3xl font-semibold leading-tight text-gray-900"
            >
              Hosted by {owner?.username || "Joel"}
            </h2>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[13.5px] text-gray-500">
                <Calendar size={14} className="text-red-500" />
                <span>
                  <strong className="text-gray-700">Joined:</strong> {joinDate}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[13.5px]">
                <Shield size={14} className="text-green-500" />
                <span className="font-medium text-gray-700">Verified Host</span>
              </div>
              <div className="mt-0.5 flex flex-wrap gap-4">
                <span className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
                  <Clock size={13} className="text-blue-500" /> Responds {owner?.responseTime || "within an hour"}
                </span>
                <span className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
                  <Award size={13} className="text-purple-500" /> {getHostingDuration()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-7 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
          {stats.map((s, i) => (
            <div
              key={s.title}
              className={`rounded-2xl border border-gray-200 bg-white px-4 py-[18px] transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-[0_12px_30px_rgba(0,0,0,.09)] ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"} ${i === 0 ? "delay-100" : i === 1 ? "delay-150" : i === 2 ? "delay-200" : "delay-300"}`}
            >
              <div className={`mb-2.5 flex h-9.5 w-9.5 items-center justify-center rounded-[10px] ${s.bg}`}>
                {s.icon}
              </div>
              <div className="mb-1 text-[11px] uppercase tracking-[0.07em] text-gray-400">{s.title}</div>
              <div className="text-[14.5px] font-medium text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        <div
          className={`mb-7 rounded-[18px] border border-gray-200 bg-gray-50 px-6 py-6 transition-all delay-300 duration-500 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <h3 className="mb-2.5 text-xl font-semibold text-gray-900">About {owner?.username || "Joel"}</h3>
          <p className="text-[14.5px] leading-7 text-gray-600">
            {owner?.bio || "Hello! I'm a passionate host who loves to share my space with travelers from around the world. I enjoy hiking, photography, and exploring new cultures. I'm always available to help make your stay comfortable and memorable."}
          </p>
        </div>

        <div
          className={`flex flex-wrap gap-3 transition-all delay-500 duration-500 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <button
            onClick={() => setDialogOpen(true)}
            className="flex min-w-40 flex-1 items-center justify-center gap-2 rounded-[14px] bg-red-500 px-5 py-4 text-[14.5px] font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-[0_10px_24px_rgba(239,68,68,.3)]"
          >
            <MessageCircle size={17} /> Contact Host
          </button>
          <button
            onClick={() => setSaved((s) => !s)}
            className="flex min-w-40 flex-1 items-center justify-center gap-2 rounded-[14px] border border-gray-200 bg-white px-5 py-4 text-[14.5px] text-gray-700 transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50"
          >
            <Heart
              size={17}
              className={`${saved ? "fill-red-500 text-red-500" : "text-gray-400"}`}
            />
            {saved ? "Saved!" : "Save to Favorites"}
          </button>
        </div>
      </div>

      <ContactHostDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        owner={owner}
      />
    </div>
  );
};

export default HostSection;
