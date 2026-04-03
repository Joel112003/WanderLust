import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import BookingDetailModal from "./BookingDetailModal";
import AlternativeBookingsModal from "../views/AlternativeBookingsModal";
import { getAuthToken, authHeaders } from "../lib/userApi";

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8000";
const token = () => getAuthToken();
const authH = () => authHeaders();

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@300;400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --red:#C0392B; --red-d:#96281B; --red-l:#FDF0EF; --red-m:#E74C3C;
      --white:#fff; --off:#fff; --border:#EAD8D6;
      --text:#1A0806; --muted:#6B4C49; --sub:#B89E9B;
      --sw:256px;
      --r:14px; --sh:0 2px 20px rgba(192,57,43,.07);
      --sh-lg:0 16px 56px rgba(192,57,43,.13);
    }
    body{font-family:'Manrope',sans-serif;background:#fff;}

    /* animations */
    @keyframes pulse {
      0%, 100% { box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3); }
      50% { box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5), 0 0 0 4px rgba(255, 107, 107, 0.2); }
    }

    /* scrollbar */
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-thumb{background:#E8D0CE;border-radius:8px;}

    /* sidebar - white with red accents */
    .sb{position:fixed;top:0;left:0;bottom:0;width:var(--sw);background:#fff;
      border-right:1.5px solid var(--border);
      display:flex;flex-direction:column;z-index:200;overflow-y:auto;}
    .sb-logo{padding:28px 22px 22px;border-bottom:1.5px solid var(--border);}
    .sb-logo-name{font-family:'Playfair Display',serif;font-size:22px;color:var(--red);letter-spacing:-.4px;font-weight:600;}
    .sb-logo-tag{font-size:10px;color:var(--sub);letter-spacing:.1em;text-transform:uppercase;margin-top:3px;}
    .sb-user{display:flex;align-items:center;gap:11px;padding:16px 20px;border-bottom:1.5px solid var(--border);}
    .sb-av{width:38px;height:38px;border-radius:50%;background:var(--red);
      display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:17px;color:#fff;flex-shrink:0;font-weight:600;}
    .sb-uname{font-size:13px;font-weight:700;color:var(--text);line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .sb-uemail{font-size:11px;color:var(--sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .sb-nav{flex:1;padding:10px 10px;}
    .sb-grp{font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
      color:var(--sub);padding:14px 12px 6px;}
    .nb{display:flex;align-items:center;gap:11px;width:100%;padding:10px 13px;border:none;
      background:none;cursor:pointer;border-radius:10px;font-family:'Manrope',sans-serif;
      font-size:13.5px;font-weight:500;color:var(--muted);transition:all .16s;text-align:left;border-left:3px solid transparent;}
    .nb svg{flex-shrink:0;width:17px;height:17px;color:var(--sub);transition:color .16s;}
    .nb:hover{background:var(--red-l);color:var(--red);}
    .nb:hover svg{color:var(--red);}
    .nb.on{background:var(--red-l);color:var(--red);font-weight:700;border-left-color:var(--red);}
    .nb.on svg{color:var(--red);}
    .nb-badge{margin-left:auto;background:var(--red);color:#fff;font-size:10px;font-weight:700;
      padding:2px 7px;border-radius:20px;min-width:20px;text-align:center;}
    .sb-foot{padding:12px 10px;border-top:1.5px solid var(--border);}
    .sb-back{display:flex;align-items:center;gap:9px;padding:9px 13px;border-radius:10px;
      color:var(--sub);font-size:13px;text-decoration:none;transition:all .16s;}
    .sb-back:hover{color:var(--red);background:var(--red-l);}

    /* main */
    .main{margin-left:var(--sw);min-height:100vh;display:flex;flex-direction:column;background:#fff;}
    .mobile-topbar{display:none;}
    .ph{padding:36px 40px 0;border-bottom:1.5px solid var(--border);padding-bottom:24px;
      background:#fff;display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;}
    .ph-eye{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--red);margin-bottom:5px;}
    .ph-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:500;color:var(--text);line-height:1.15;}
    .ph-sub{font-size:13.5px;color:var(--muted);margin-top:4px;}
    .content{padding:28px 40px 60px;flex:1;background:#fff;}

    /* stats */
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:30px;}
    @media(max-width:900px){.stats{grid-template-columns:repeat(2,1fr);}}
    .sc{background:#fff;border:1.5px solid var(--border);border-radius:var(--r);padding:20px 22px;transition:transform .2s,box-shadow .2s;}
    .sc:hover{transform:translateY(-2px);box-shadow:var(--sh-lg);}
    .sc-ico{width:36px;height:36px;border-radius:10px;background:var(--red-l);display:flex;align-items:center;justify-content:center;margin-bottom:13px;}
    .sc-val{font-family:'Playfair Display',serif;font-size:26px;color:var(--red);margin-bottom:3px;line-height:1;}
    .sc-lbl{font-size:12px;color:var(--muted);}

    /* cards */
    .card{background:#fff;border:1.5px solid var(--border);border-radius:var(--r);overflow:hidden;transition:transform .2s,box-shadow .2s;}
    .card:hover{transform:translateY(-2px);box-shadow:var(--sh-lg);}
    .grid3{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;}
    .cimg{position:relative;height:172px;overflow:hidden;}
    .cimg img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
    .card:hover .cimg img{transform:scale(1.04);}
    .cimg-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 55%);}
    .cimg-title{position:absolute;bottom:13px;left:15px;right:46px;color:#fff;
      font-family:'Playfair Display',serif;font-size:15px;font-weight:500;line-height:1.3;}
    .cbody{padding:15px 17px;}

    /* status pill */
    .pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.03em;text-transform:capitalize;}
    .pill-g{background:#EAF7EF;color:#1E7A41;border:1px solid #A5D9B5;}
    .pill-r{background:#FDF0EF;color:#C0392B;border:1px solid #F0A8A1;}
    .pill-a{background:#FEF5E4;color:#9A5D08;border:1px solid #F2CF85;}
    .pill-b{background:#EBF3FD;color:#1650A8;border:1px solid #8DB8F0;}
    .pill-x{background:#F2EDEB;color:var(--muted);border:1px solid #DDD0CC;}

    /* buttons */
    .btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;
      font-family:'Manrope',sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .16s;}
    .btn-r{background:var(--red);color:#fff;}
    .btn-r:hover{background:var(--red-d);}
    .btn-r:disabled{background:#D4B8B6;cursor:not-allowed;}
    .btn-w{background:#fff;color:var(--text);border:1.5px solid var(--border);}
    .btn-w:hover{border-color:var(--red);color:var(--red);}
    .btn-rl{background:var(--red-l);color:var(--red);border:1.5px solid #F0C8C4;}
    .btn-rl:hover{background:#FAD5D0;}
    .btn-sm{padding:6px 13px;font-size:12px;}
    .btn-xs{padding:4px 10px;font-size:11px;border-radius:7px;}
    .btn-full{width:100%;justify-content:center;}

    /* input */
    .inp{width:100%;padding:10px 13px;border:1.5px solid var(--border);border-radius:10px;
      font-family:'Manrope',sans-serif;font-size:13.5px;color:var(--text);background:#fff;
      outline:none;transition:border-color .18s,box-shadow .18s;}
    .inp:focus{border-color:var(--red);box-shadow:0 0 0 3px rgba(192,57,43,.1);background:#fff;}
    select.inp{cursor:pointer;}

    /* empty */
    .empty{text-align:center;padding:64px 24px;}
    .empty-ico{width:60px;height:60px;border-radius:50%;background:var(--red-l);
      display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--red);}
    .empty-t{font-family:'Playfair Display',serif;font-size:20px;color:var(--text);margin-bottom:6px;}
    .empty-s{font-size:13.5px;color:var(--muted);}

    /* modal */
    .modal-ov{position:fixed;inset:0;background:rgba(22,7,5,.55);z-index:500;
      display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(6px);}
    .modal{background:#fff;border-radius:20px;width:100%;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.2);}

    /* manage bookings */
    .mb-hdr{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:22px;}
    .mb-filters{display:flex;gap:8px;flex-wrap:wrap;}
    .mb-chip{padding:6px 15px;border-radius:20px;font-size:12.5px;font-weight:600;cursor:pointer;
      border:1.5px solid var(--border);background:#fff;color:var(--muted);font-family:'Manrope',sans-serif;transition:all .15s;}
    .mb-chip:hover{border-color:var(--red);color:var(--red);}
    .mb-chip.on{background:var(--red);color:#fff;border-color:var(--red);}
    .mb-search{position:relative;}
    .mb-search input{padding:8px 14px 8px 36px;border:1.5px solid var(--border);border-radius:20px;
      font-family:'Manrope',sans-serif;font-size:13px;outline:none;background:#fff;transition:border-color .18s;width:210px;}
    .mb-search input:focus{border-color:var(--red);}
    .mb-search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--sub);}

    /* booking row */
    .br{background:#fff;border:1.5px solid var(--border);border-radius:var(--r);
      padding:16px 20px;display:flex;gap:16px;align-items:center;transition:box-shadow .2s,transform .2s;}
    .br:hover{box-shadow:var(--sh-lg);transform:translateY(-1px);}
    .br-thumb{width:68px;height:68px;border-radius:10px;object-fit:cover;flex-shrink:0;}
    .br-info{flex:1;min-width:0;}
    .br-title{font-family:'Playfair Display',serif;font-size:14.5px;color:var(--text);margin-bottom:3px;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .br-meta{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
    .br-meta-dot{width:3px;height:3px;border-radius:50%;background:var(--sub);}
    .br-guest{display:flex;align-items:center;gap:8px;flex-shrink:0;}
    .br-gav{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--red-l),#FAE8D5);
      display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--red);flex-shrink:0;}
    .br-actions{display:flex;gap:8px;flex-shrink:0;align-items:center;}

    /* expand panel */
    .exp-panel{background:#FDF0EF;border-top:1.5px solid var(--border);padding:16px 20px;
      display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}
    .exp-field label{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--sub);margin-bottom:3px;display:block;}
    .exp-field p{font-size:13.5px;font-weight:500;color:var(--text);}

    /* transactions */
    .tx-row{display:flex;align-items:center;gap:14px;padding:15px 18px;background:#fff;
      border:1.5px solid var(--border);border-radius:var(--r);transition:box-shadow .2s;}
    .tx-row:hover{box-shadow:var(--sh);}
    .tx-ico{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}

    /* profile */
    .pf-hero{background:linear-gradient(135deg,#fff 0%,var(--red-l) 100%);border:1.5px solid var(--border);
      border-radius:20px;padding:28px;margin-bottom:24px;display:flex;align-items:center;gap:22px;flex-wrap:wrap;}
    .pf-avatar{width:78px;height:78px;border-radius:50%;background:linear-gradient(135deg,var(--red),#E07B30);
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
      box-shadow:0 0 0 3px #fff,0 0 0 5px var(--red);}
    .pf-av-letter{font-family:'Playfair Display',serif;font-size:34px;color:#fff;}
    .pf-name{font-family:'Playfair Display',serif;font-size:26px;font-weight:500;color:var(--text);margin-bottom:4px;}
    .pf-email{font-size:14px;color:var(--muted);margin-bottom:14px;}
    .pf-fields{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:18px;}
    .pf-field{background:#fff;border:1.5px solid var(--border);border-radius:12px;padding:14px 16px;
      display:flex;align-items:center;gap:12px;}
    .pf-field-ico{width:36px;height:36px;border-radius:9px;background:var(--red-l);
      display:flex;align-items:center;justify-content:center;color:var(--red);flex-shrink:0;}
    .pf-field-lbl{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--sub);margin-bottom:3px;}
    .pf-field-val{font-size:13.5px;font-weight:500;color:var(--text);}

    /* notification */
    .nf-row{display:flex;gap:13px;padding:15px 17px;border:1.5px solid var(--border);border-radius:var(--r);background:#fff;}
    .nf-row.unread{border-color:#F0C8C4;background:#FFF8F7;}
    .nf-ico{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}

    /* wishlist/listings action strip */
    .act-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:8px;}

    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes pdot{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
    .pdot{animation:pdot 2s ease-in-out infinite;}
    .spin{animation:spin .8s linear infinite;}

    @media(max-width:860px){
      .sb{transform:translateX(-100%);transition:transform .25s;}
      .sb.open{transform:translateX(0);}
      .main{margin-left:0;}
      .ph,.content{padding-left:20px;padding-right:20px;}
      .stats{grid-template-columns:repeat(2,1fr);}
      .mobile-topbar{display:flex;}
    }
  `}</style>
);

const I = {
  Home: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  Bell: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  ),
  Receipt: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  Card: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  ),
  User: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  Edit: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  ),
  Trash: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Eye: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  Pin: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Check: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  X: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  Clock: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Down: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  ),
  Mail: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  Phone: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  ),
  Star: (p) => (
    <svg {...p} viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Logout: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
  Shield: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  Cal: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  Users: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  Arr: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  ),
  Chev: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  ),
  Search: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  ChevD: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  ),
  Menu: (p) => (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  ),
};

const fmt = (n) => (n ?? 0).toLocaleString("en-IN");
const fmtD = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
const nights = (ci, co) =>
  Math.max(1, Math.ceil((new Date(co) - new Date(ci)) / 86400000));
const imgOf = (l) =>
  l?.image?.url ||
  l?.images?.[0]?.url ||
  l?.images?.[0] ||
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400";

const pillClass = (s) => {
  const m = {
    paid: "pill-g",
    confirmed: "pill-g",
    active: "pill-g",
    pending: "pill-a",
    failed: "pill-r",
    cancelled: "pill-r",
    refunded: "pill-b",
  };
  return "pill " + (m[s?.toLowerCase()] || "pill-x");
};

const Pill = ({ status }) => (
  <span className={pillClass(status)}>{status}</span>
);

const Empty = ({ icon: Ico, title, sub }) => (
  <div className="empty">
    <div className="empty-ico">
      <Ico style={{ width: 26, height: 26 }} />
    </div>
    <p className="empty-t">{title}</p>
    <p className="empty-s">{sub}</p>
  </div>
);

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [actLoad, setActLoad] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_URL}/bookings/owner/listings`, {
        headers: authH(),
      });
      setBookings(Array.isArray(r.data) ? r.data : r.data?.bookings || []);
    } catch (e) {
      toast.error("Could not load guest bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id, action) => {
    setActLoad((p) => ({ ...p, [id + action]: true }));
    try {
      if (action === "cancel") {

        await axios.post(
          `${API_URL}/bookings/${id}/cancel-by-owner`,
          {
            reason: "Cancelled by host",
          },
          { headers: authH() },
        );
      } else {

        await axios.patch(
          `${API_URL}/bookings/${id}/${action}`,
          {},
          { headers: authH() },
        );
      }
      toast.success(
        action === "confirm" ? "Booking confirmed!" : "Booking cancelled.",
      );
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    } finally {
      setActLoad((p) => ({ ...p, [id + action]: false }));
    }
  };

  const filtered = bookings.filter((b) => {
    const matchF = filter === "all" || b.status?.toLowerCase() === filter;
    const q = search.toLowerCase();
    const matchS =
      !q ||
      b.listing?.title?.toLowerCase().includes(q) ||
      b.user?.username?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q);
    return matchF && matchS;
  });

  const counts = ["all", "pending", "confirmed", "paid", "cancelled"].reduce(
    (acc, s) => ({
      ...acc,
      [s]:
        s === "all"
          ? bookings.length
          : bookings.filter((b) => b.status?.toLowerCase() === s).length,
    }),
    {},
  );

  const revenue = bookings
    .filter((b) => ["paid", "confirmed"].includes(b.status?.toLowerCase()))
    .reduce((s, b) => s + (b.totalAmount || b.total || 0), 0);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 280,
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid #F0C8C4",
            borderTopColor: "var(--red)",
            borderRadius: "50%",
          }}
          className="spin"
        />
        <span style={{ color: "var(--muted)", fontSize: 14 }}>
          Loading bookings…
        </span>
      </div>
    );

  return (
    <div>
<div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 14,
          marginBottom: 26,
        }}
      >
        {[
          {
            label: "Total Bookings",
            val: bookings.length,
            color: "#C0392B",
            bg: "#FDF0EF",
          },
          {
            label: "Pending Review",
            val: counts.pending,
            color: "#9A5D08",
            bg: "#FEF5E4",
          },
          {
            label: "Confirmed",
            val: counts.confirmed + counts.paid,
            color: "#1E7A41",
            bg: "#EAF7EF",
          },
          {
            label: "Revenue",
            val: `₹${fmt(revenue)}`,
            color: "#C0392B",
            bg: "#FDF0EF",
            txt: true,
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="sc"
          >
            <div className="sc-ico" style={{ background: s.bg }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: s.color,
                }}
              />
            </div>
            <div className="sc-val" style={{ fontSize: s.txt ? 20 : 26 }}>
              {s.val}
            </div>
            <div className="sc-lbl">{s.label}</div>
          </motion.div>
        ))}
      </div>
<div className="mb-hdr">
        <div className="mb-filters">
          {["all", "pending", "confirmed", "paid", "cancelled"].map((f) => (
            <button
              key={f}
              className={"mb-chip" + (filter === f ? " on" : "")}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {counts[f] > 0 && (
                <span style={{ marginLeft: 6, opacity: 0.75 }}>
                  ({counts[f]})
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mb-search">
          <I.Search
            className="mb-search-ico"
            style={{ width: 15, height: 15 }}
          />
          <input
            placeholder="Search guest or property…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
{filtered.length === 0 ? (
        <Empty
          icon={I.Users}
          title="No bookings found"
          sub="Try adjusting your filters or search term"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((b, i) => {
            const isExp = expanded === b._id;
            const ni = nights(b.checkIn, b.checkOut);
            const isPending = b.status?.toLowerCase() === "pending";
            const isConfirmed = ["confirmed", "paid"].includes(
              b.status?.toLowerCase(),
            );
            return (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1.5px solid var(--border)",
                  background: "#fff",
                }}
              >
<div className="br" style={{ borderRadius: 0, border: "none" }}>
                  <img
                    className="br-thumb"
                    src={imgOf(b.listing)}
                    alt={b.listing?.title}
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200";
                    }}
                  />

                  <div className="br-info">
                    <div className="br-title">
                      {b.listing?.title || "Unnamed property"}
                    </div>
                    <div className="br-meta">
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <I.Pin style={{ width: 12, height: 12 }} />
                        {b.listing?.location || "—"}
                      </span>
                      <span className="br-meta-dot" />
                      <span>
                        <I.Cal
                          style={{
                            width: 12,
                            height: 12,
                            display: "inline",
                            verticalAlign: "middle",
                            marginRight: 3,
                          }}
                        />
                        {fmtD(b.checkIn)} → {fmtD(b.checkOut)}
                      </span>
                      <span className="br-meta-dot" />
                      <span>
                        {ni} night{ni !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
<div className="br-guest">
                    <div className="br-gav">
                      {(b.user?.username || "G")[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {b.user?.username || "Guest"}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--sub)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 130,
                        }}
                      >
                        {b.user?.email || ""}
                      </div>
                    </div>
                  </div>
<div
                    style={{ textAlign: "right", flexShrink: 0, minWidth: 110 }}
                  >
                    <div
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 18,
                        color: "var(--red)",
                        marginBottom: 5,
                      }}
                    >
                      ₹{fmt(b.totalAmount || b.total)}
                    </div>
                    <Pill status={b.status} />
                  </div>
<div className="br-actions">
                    {isPending && (
                      <>
                        <button
                          className="btn btn-r btn-sm"
                          disabled={actLoad[b._id + "confirm"]}
                          onClick={() => act(b._id, "confirm")}
                          style={{ gap: 5 }}
                        >
                          {actLoad[b._id + "confirm"] ? (
                            <span
                              className="spin"
                              style={{
                                width: 14,
                                height: 14,
                                border: "2px solid rgba(255,255,255,.4)",
                                borderTopColor: "#fff",
                                borderRadius: "50%",
                                display: "inline-block",
                              }}
                            />
                          ) : (
                            <I.Check style={{ width: 13, height: 13 }} />
                          )}
                          Confirm
                        </button>
                        <button
                          className="btn btn-rl btn-sm"
                          disabled={actLoad[b._id + "cancel"]}
                          onClick={() => act(b._id, "cancel")}
                        >
                          <I.X style={{ width: 13, height: 13 }} /> Decline
                        </button>
                      </>
                    )}
                    {isConfirmed && (
                      <button
                        className="btn btn-rl btn-sm"
                        disabled={actLoad[b._id + "cancel"]}
                        onClick={() => act(b._id, "cancel")}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => setExpanded(isExp ? null : b._id)}
                      style={{
                        width: 32,
                        height: 32,
                        border: "1.5px solid var(--border)",
                        borderRadius: 8,
                        background: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--muted)",
                        transition: "all .15s",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--red)";
                        e.currentTarget.style.color = "var(--red)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--muted)";
                      }}
                    >
                      <I.ChevD
                        style={{
                          width: 14,
                          height: 14,
                          transform: isExp ? "rotate(180deg)" : "none",
                          transition: "transform .2s",
                        }}
                      />
                    </button>
                  </div>
                </div>
<AnimatePresence>
                  {isExp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="exp-panel">
                        <div className="exp-field">
                          <label>Booking ID</label>
                          <p
                            style={{
                              fontFamily: "monospace",
                              fontSize: 12,
                              color: "var(--sub)",
                            }}
                          >
                            {b._id?.slice(-10).toUpperCase()}
                          </p>
                        </div>
                        <div className="exp-field">
                          <label>Check-in</label>
                          <p>{fmtD(b.checkIn)}</p>
                        </div>
                        <div className="exp-field">
                          <label>Check-out</label>
                          <p>{fmtD(b.checkOut)}</p>
                        </div>
                        <div className="exp-field">
                          <label>Guests</label>
                          <p>
                            {b.guests || 1} guest
                            {(b.guests || 1) !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="exp-field">
                          <label>Booked On</label>
                          <p>{fmtD(b.createdAt)}</p>
                        </div>
                        <div className="exp-field">
                          <label>Payment</label>
                          <p>
                            {b.razorpay_payment_id ? (
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: 11,
                                }}
                              >
                                {b.razorpay_payment_id.slice(0, 18)}…
                              </span>
                            ) : (
                              "—"
                            )}
                          </p>
                        </div>
                        {b.specialRequests && (
                          <div
                            className="exp-field"
                            style={{ gridColumn: "1/-1" }}
                          >
                            <label>Special Requests</label>
                            <p style={{ fontSize: 13, color: "var(--muted)" }}>
                              {b.specialRequests}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MyBookings = ({ bookings, onView }) => {
  if (!bookings.length)
    return (
      <Empty
        icon={I.Receipt}
        title="No bookings yet"
        sub="Your upcoming stays will appear here"
      />
    );
  return (
    <div className="grid3">
      {bookings.map((b, i) => (
        <motion.div
          key={b._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="card"
        >
          <div className="cimg">
            <img
              src={imgOf(b.listing)}
              alt={b.listing?.title}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400";
              }}
            />
            <div className="cimg-ov" />
            <div style={{ position: "absolute", top: 11, right: 11 }}>
              <Pill status={b.status} />
            </div>
            <div className="cimg-title">{b.listing?.title || "Unnamed"}</div>
          </div>
          <div className="cbody">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "var(--muted)",
                fontSize: 12,
                marginBottom: 11,
              }}
            >
              <I.Pin style={{ width: 11, height: 11 }} />
              {b.listing?.location || "—"}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                background: "#FDF0EF",
                borderRadius: 10,
                padding: "11px 13px",
                marginBottom: 13,
              }}
            >
              {[
                ["Check-in", b.checkIn],
                ["Check-out", b.checkOut],
              ].map(([l, d]) => (
                <div key={l}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--sub)",
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                      marginBottom: 2,
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    {fmtD(d)}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 20,
                  color: "var(--red)",
                }}
              >
                ₹{fmt(b.totalAmount || b.total)}
              </span>
              <div style={{ display: "flex", gap: 7 }}>
                <button className="btn btn-w btn-sm" onClick={() => onView(b)}>
                  <I.Eye style={{ width: 12, height: 12 }} /> View
                </button>
                {["paid", "confirmed"].includes(b.status?.toLowerCase()) && (
                  <button
                    className="btn btn-r btn-sm"
                    onClick={() => onView(b)}
                  >
                    <I.Down style={{ width: 12, height: 12 }} /> Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const Transactions = ({ bookings, onView }) => {
  const txns = bookings.filter(
    (b) => b.totalAmount || b.total || b.razorpay_payment_id,
  );
  if (!txns.length)
    return (
      <Empty
        icon={I.Card}
        title="No transactions"
        sub="Your payment history will appear here"
      />
    );
  const statusColor = {
    paid: "#EAF7EF::#1E7A41",
    confirmed: "#EAF7EF::#1E7A41",
    pending: "#FEF5E4::#9A5D08",
    failed: "#FDF0EF::#C0392B",
    cancelled: "#FDF0EF::#C0392B",
    refunded: "#EBF3FD::#1650A8",
  };
  const totalPaid = txns
    .filter((t) => ["paid", "confirmed"].includes(t.status?.toLowerCase()))
    .reduce((s, t) => s + (t.totalAmount || t.total || 0), 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {txns.map((t, i) => {
        const [bg, col] = (
          statusColor[t.status?.toLowerCase()] || "#F2EDEB::#8C6460"
        ).split("::");
        const ni = nights(t.checkIn, t.checkOut);
        return (
          <motion.div
            key={t._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="tx-row"
          >
            <div className="tx-ico" style={{ background: bg }}>
              {["paid", "confirmed"].includes(t.status?.toLowerCase()) ? (
                <I.Check style={{ width: 17, height: 17, color: col }} />
              ) : (
                <I.Receipt style={{ width: 17, height: 17, color: col }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {t.listing?.title || "Booking"}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {fmtD(t.createdAt)} · {ni} night{ni !== 1 ? "s" : ""}
                {t.razorpay_payment_id && (
                  <span
                    style={{
                      marginLeft: 7,
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "var(--sub)",
                    }}
                  >
                    {t.razorpay_payment_id.slice(0, 16)}…
                  </span>
                )}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 19,
                  color: "var(--text)",
                  marginBottom: 5,
                }}
              >
                ₹{fmt(t.totalAmount || t.total)}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    background: bg,
                    color: col,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 9px",
                    borderRadius: 20,
                  }}
                >
                  {t.status}
                </span>
                <button
                  onClick={() => onView(t)}
                  style={{
                    fontSize: 12,
                    color: "var(--red)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  Details <I.Arr style={{ width: 11, height: 11 }} />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
      <div
        style={{
          marginTop: 6,
          padding: "14px 18px",
          background: "#FDF0EF",
          border: "1.5px solid var(--border)",
          borderRadius: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13, color: "var(--muted)" }}>
          {txns.length} transaction{txns.length !== 1 ? "s" : ""}
        </span>
        <span
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 18,
            color: "var(--red)",
          }}
        >
          ₹{fmt(totalPaid)} paid
        </span>
      </div>
    </div>
  );
};

const Wishlist = ({ wishlist, onRemove, onNav }) => {
  if (!wishlist.length)
    return (
      <Empty
        icon={I.Star}
        title="No favorites yet"
        sub="Save listings you love to book them later"
      />
    );
  return (
    <div className="grid3">
      {wishlist.map((l, i) => (
        <motion.div
          key={l._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="card"
        >
          <div className="cimg">
            <img
              src={imgOf(l)}
              alt={l.title}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400";
              }}
            />
            <div className="cimg-ov" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(l._id);
              }}
              style={{
                position: "absolute",
                top: 11,
                right: 11,
                width: 33,
                height: 33,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,.92)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,.15)",
              }}
            >
              <I.Star
                style={{
                  width: 16,
                  height: 16,
                  fill: "var(--red)",
                  color: "var(--red)",
                }}
              />
            </button>
            <div className="cimg-title">{l.title || "Unnamed"}</div>
          </div>
          <div className="cbody">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "var(--muted)",
                fontSize: 12,
                marginBottom: 11,
              }}
            >
              <I.Pin style={{ width: 11, height: 11 }} />
              {l.location || "—"}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 13,
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 19,
                  color: "var(--red)",
                }}
              >
                ₹{fmt(l.price)}
                <span style={{ fontSize: 11, color: "var(--sub)" }}>
                  /night
                </span>
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <I.Star
                  style={{
                    width: 12,
                    height: 12,
                    fill: "#E07B30",
                    color: "#E07B30",
                  }}
                />
                {l.reviews?.length || 0} reviews
              </span>
            </div>
            <button className="btn btn-r btn-full" onClick={() => onNav(l._id)}>
              View Listing
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const MyListings = ({ listings, onEdit, onDelete, onBlock }) => {
  if (!listings.length)
    return (
      <Empty
        icon={I.Home}
        title="No listings yet"
        sub="Start hosting — add your first property"
      />
    );
  return (
    <div className="grid3">
      {listings.map((l, i) => (
        <motion.div
          key={l._id || l.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="card"
        >
          <div className="cimg">
            <img
              src={imgOf(l)}
              alt={l.title}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400";
              }}
            />
            <div className="cimg-ov" />
            <div style={{ position: "absolute", top: 11, right: 11 }}>
              <Pill status={l.status || "active"} />
            </div>
            {l.unavailableDates?.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 11,
                  left: 11,
                  background: "#E07B30",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <I.Cal style={{ width: 10, height: 10 }} />
                {l.unavailableDates.length} blocked
              </div>
            )}
            <div className="cimg-title">{l.title}</div>
          </div>
          <div className="cbody">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "var(--muted)",
                }}
              >
                <I.Eye style={{ width: 12, height: 12 }} />
                {l.views || 0} views
              </span>
              {l.price && (
                <span
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 15,
                    color: "var(--red)",
                  }}
                >
                  ₹{fmt(l.price)}
                  <span
                    style={{
                      fontFamily: "'Manrope'",
                      fontSize: 11,
                      color: "var(--sub)",
                    }}
                  >
                    /night
                  </span>
                </span>
              )}
            </div>
            <div className="act-row">
              <button
                className="btn btn-w btn-sm"
                style={{ justifyContent: "center" }}
                onClick={() => onEdit(l._id || l.id)}
              >
                <I.Edit style={{ width: 13, height: 13 }} /> Edit
              </button>
              <button
                className="btn btn-sm"
                style={{
                  background: "#FDF0EF",
                  color: "#C0392B",
                  border: "1.5px solid #F0C8C4",
                  justifyContent: "center",
                }}
                onClick={() => onDelete(l._id || l.id)}
              >
                <I.Trash style={{ width: 13, height: 13 }} /> Delete
              </button>
            </div>
            <button
              className="btn btn-sm btn-full"
              style={{
                background: "#FEF5E4",
                color: "#9A5D08",
                border: "1.5px solid #F2CF85",
                justifyContent: "center",
              }}
              onClick={() => onBlock(l)}
            >
              <I.Cal style={{ width: 13, height: 13 }} /> Block Dates
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const Notifications = ({ notifications, markRead, markAll }) => {
  if (!notifications.length)
    return (
      <Empty
        icon={I.Bell}
        title="All clear!"
        sub="No notifications right now"
      />
    );
  const unread = notifications.filter((n) => !n.isRead).length;
  const icoCfg = {
    booking_confirmed: { ico: I.Check, bg: "#EAF7EF", col: "#1E7A41" },
    booking_cancelled: { ico: I.X, bg: "#FDF0EF", col: "#C0392B" },
    review: { ico: I.Star, bg: "#FEF5E4", col: "#9A5D08" },
  };
  return (
    <div>
      {unread > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          <button className="btn btn-w btn-sm" onClick={markAll}>
            Mark all as read
          </button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {notifications.map((n, i) => {
          const c = icoCfg[n.type] || {
            ico: I.Bell,
            bg: "#F2EDEB",
            col: "var(--muted)",
          };
          return (
            <motion.div
              key={n._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={"nf-row" + (n.isRead ? "" : " unread")}
            >
              <div className="nf-ico" style={{ background: c.bg }}>
                <c.ico style={{ width: 15, height: 15, color: c.col }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    {n.title}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--sub)",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {n.message}
                </p>
                {!n.isRead && (
                  <button
                    onClick={() => markRead(n._id)}
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "var(--red)",
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Mark as read →
                  </button>
                )}
              </div>
              {!n.isRead && (
                <div
                  className="pdot"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--red)",
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const Profile = ({ user, onEdit, onLogout }) => {
  if (!user) return null;
  const fields = [
    { label: "Username", val: user.username, ico: I.User },
    { label: "Email", val: user.email, ico: I.Mail },
    { label: "Phone", val: user.phoneNumber || "Not provided", ico: I.Phone },
    {
      label: "Member Since",
      val: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "—",
      ico: I.Clock,
    },
  ];
  return (
    <div>
      <div className="pf-hero">
        <div className="pf-avatar">
          <span className="pf-av-letter">
            {user.username?.[0]?.toUpperCase()}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 4,
            }}
          >
            <span className="pf-name">{user.username}</span>
            {user.verified && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "#EAF7EF",
                  color: "#1E7A41",
                  border: "1px solid #A5D9B5",
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <I.Shield style={{ width: 11, height: 11 }} /> Verified
              </span>
            )}
          </div>
          <div className="pf-email">{user.email}</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-r" onClick={onEdit}>
              <I.Edit style={{ width: 14, height: 14 }} /> Edit Profile
            </button>
            <button className="btn btn-w" onClick={onLogout}>
              <I.Logout style={{ width: 14, height: 14 }} /> Log Out
            </button>
          </div>
        </div>
      </div>
      <h3
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 17,
          fontWeight: 500,
          color: "var(--text)",
          marginBottom: 14,
        }}
      >
        Personal Information
      </h3>
      <div className="pf-fields">
        {fields.map(({ label, val, ico: Ico }) => (
          <div key={label} className="pf-field">
            <div className="pf-field-ico">
              <Ico style={{ width: 16, height: 16 }} />
            </div>
            <div>
              <div className="pf-field-lbl">{label}</div>
              <div className="pf-field-val">{val}</div>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "15px 19px",
          background: "#fff",
          border: "1.5px solid var(--border)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: "var(--text)",
              marginBottom: 2,
            }}
          >
            Email Notifications
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Booking updates and listing alerts
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            background: user.notification_preferences
              ? "var(--red)"
              : "#D4C8C6",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 3,
              left: user.notification_preferences ? 22 : 3,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#fff",
              transition: "left .2s",
              boxShadow: "0 1px 4px rgba(0,0,0,.2)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const BlockDatesModal = ({ open, onClose, listing, onBlock, onUnblock }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const doBlock = async () => {
    if (!from || !to) return toast.error("Select both dates");
    if (new Date(to) <= new Date(from))
      return toast.error("End must be after start");
    setBusy(true);
    await onBlock(listing._id || listing.id, from, to);
    setFrom("");
    setTo("");
    setBusy(false);
  };
  const doUnblock = async (idx) => {
    setBusy(true);
    await onUnblock(listing._id || listing.id, idx);
    setBusy(false);
  };

  if (!listing) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-ov"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="modal"
            style={{ maxWidth: 500, maxHeight: "85vh", overflowY: "auto" }}
            initial={{ scale: 0.93, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.93, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
<div
              style={{
                padding: "20px 24px 17px",
                borderBottom: "1.5px solid var(--border)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                background: "linear-gradient(135deg,var(--red-l) 0%,#fff 100%)",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 20,
                    color: "var(--text)",
                    marginBottom: 3,
                  }}
                >
                  <I.Cal
                    style={{ width: 19, height: 19, color: "var(--red)" }}
                  />{" "}
                  Block Dates
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  {listing.title}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background: "#FDF0EF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted)",
                }}
              >
                <I.X style={{ width: 14, height: 14 }} />
              </button>
            </div>
<div style={{ padding: "22px 24px" }}>
              <div
                style={{
                  background: "#FDF0EF",
                  border: "1.5px solid var(--border)",
                  borderRadius: 12,
                  padding: 17,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text)",
                    marginBottom: 13,
                  }}
                >
                  Block New Dates
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 11,
                    marginBottom: 13,
                  }}
                >
                  {[
                    ["From", from, setFrom, today],
                    ["To", to, setTo, from || today],
                  ].map(([l, v, s, m]) => (
                    <div key={l}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--muted)",
                          marginBottom: 6,
                        }}
                      >
                        {l} Date
                      </label>
                      <input
                        type="date"
                        className="inp"
                        value={v}
                        min={m}
                        onChange={(e) => s(e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-r btn-full"
                  onClick={doBlock}
                  disabled={busy || !from || !to}
                >
                  {busy ? "Blocking…" : "🔒 Block These Dates"}
                </button>
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 12,
                }}
              >
                Blocked Ranges ({listing.unavailableDates?.length || 0})
              </div>
              {!listing.unavailableDates?.length ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    background: "#FDF0EF",
                    borderRadius: 12,
                    border: "1.5px dashed var(--border)",
                  }}
                >
                  <p style={{ fontSize: 13, color: "var(--sub)" }}>
                    No blocked dates yet
                  </p>
                </div>
              ) : (
                listing.unavailableDates.map((r, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 13px",
                      background: "#fff",
                      border: "1.5px solid var(--border)",
                      borderRadius: 10,
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        {fmtD(r.from)} → {fmtD(r.to)}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--sub)" }}>
                        {Math.ceil(
                          (new Date(r.to) - new Date(r.from)) / 86400000,
                        )}{" "}
                        days blocked
                      </div>
                    </div>
                    <button
                      className="btn btn-rl btn-xs"
                      onClick={() => doUnblock(idx)}
                      disabled={busy}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EditModal = ({ open, onClose, form, setForm, onSubmit, busy }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="modal-ov"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="modal"
          style={{ maxWidth: 430 }}
          initial={{ scale: 0.93, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.93, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          <div
            style={{
              padding: "20px 24px 17px",
              borderBottom: "1.5px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 20,
                  color: "var(--text)",
                  marginBottom: 2,
                }}
              >
                Edit Profile
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                Update your personal information
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "none",
                background: "#FDF0EF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--muted)",
              }}
            >
              <I.X style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <form
            onSubmit={onSubmit}
            style={{
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {[
              {
                label: "Username",
                key: "username",
                type: "text",
                ph: "Your username",
              },
              {
                label: "Phone",
                key: "phoneNumber",
                type: "tel",
                ph: "+91 9876543210",
              },
            ].map(({ label, key, type, ph }) => (
              <div key={key}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                    marginBottom: 7,
                  }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  className="inp"
                  placeholder={ph}
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={key === "username"}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-w"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-r"
                style={{ flex: 1, justifyContent: "center" }}
                disabled={busy}
              >
                {busy ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", phoneNumber: "" });
  const [editBusy, setEditBusy] = useState(false);
  const [viewBooking, setViewBooking] = useState(null);
  const [blockListing, setBlockListing] = useState(null);
  const [sbOpen, setSbOpen] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [altModalOpen, setAltModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const t = token();
      if (!t) {
        setLoading(false);
        return;
      }
      try {
        const pr = await axios.get(`${API_URL}/auth/profile`, {
          headers: authH(),
        });
        const u = pr.data?.user;
        if (u) {
          setUser({
            email: u.email,
            username: u.username,
            phoneNumber: u.phoneNumber || "",
            notification_preferences: u.notification_preferences !== false,
            verified: u.verified || false,
            createdAt: u.createdAt || u.created_at,
          });
          setEditForm({
            username: u.username,
            phoneNumber: u.phoneNumber || "",
          });
        }
      } catch {}
      await Promise.allSettled([
        axios
          .get(`${API_URL}/listings/user`, { headers: authH() })
          .then((r) => setListings(r.data.data || [])),
        axios
          .get(`${API_URL}/bookings/my-bookings`, { headers: authH() })
          .then((r) => setBookings(Array.isArray(r.data) ? r.data : [])),
        axios
          .get(`${API_URL}/notifications`, { headers: authH() })
          .then((r) =>
            setNotifs(r.data.data || (Array.isArray(r.data) ? r.data : [])),
          ),
        axios
          .get(`${API_URL}/wishlist`, { headers: authH() })
          .then((r) =>
            setWishlist(r.data.data || (Array.isArray(r.data) ? r.data : [])),
          ),
        axios
          .get(`${API_URL}/api/alternative-bookings`, { headers: authH() })
          .then((r) => {
            const alts = r.data?.data || [];

            const now = new Date();
            const pendingAlts = alts.filter(
              (alt) =>
                alt.status === "pending_user_response" &&
                new Date(alt.expiresAt) > now
            );
            setAlternatives(pendingAlts);
            if (pendingAlts.length > 0) {

              setAltModalOpen(true);
              toast("You have alternative accommodations available!", {
                icon: "🏠",
              });
            }
          })
          .catch((err) => console.error("Error fetching alternatives:", err)),
      ]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const checkForNewAlternatives = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/alternative-bookings`, {
          headers: authH()
        });
        const alts = response.data?.data || [];
        const now = new Date();
        const pendingAlts = alts.filter(
          (alt) =>
            alt.status === "pending_user_response" &&
            new Date(alt.expiresAt) > now
        );

        if (pendingAlts.length > alternatives.length && pendingAlts.length > 0) {
          setAlternatives(pendingAlts);
          setAltModalOpen(true);
          toast("New alternative accommodations available!", {
            icon: "🏠",
            duration: 5000,
          });
        } else if (pendingAlts.length !== alternatives.length) {

          setAlternatives(pendingAlts);
        }
      } catch (err) {
        console.error("Error checking for alternatives:", err);
      }
    };

    const intervalId = setInterval(checkForNewAlternatives, 120000);

    return () => clearInterval(intervalId);
  }, [alternatives.length]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setEditBusy(true);
    try {
      const r = await axios.put(`${API_URL}/auth/profile-update`, editForm, {
        headers: { ...authH(), "Content-Type": "application/json" },
      });
      if (r.data?.user) {
        setUser((p) => ({ ...p, ...r.data.user }));
        toast.success("Profile updated!");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setEditBusy(false);
    }
  };

  const deleteListing = (id) => {
    toast(
      (t) => (
        <div style={{ textAlign: "center", padding: "8px 4px", minWidth: 260 }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "var(--text)",
              marginBottom: 6,
            }}
          >
            Delete this listing?
          </p>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
            This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-w"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="btn btn-r"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await axios.delete(`${API_URL}/listings/${id}`, {
                    headers: authH(),
                  });
                  setListings((p) => p.filter((l) => (l._id || l.id) !== id));
                  toast.success("Listing deleted.");
                } catch {
                  toast.error("Failed to delete.");
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        style: {
          maxWidth: 340,
          padding: "22px 18px",
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(0,0,0,.15)",
        },
      },
    );
  };

  const blockDates = async (lid, from, to) => {
    try {
      const cur = listings.find((l) => (l._id || l.id) === lid);
      const r = await axios.patch(
        `${API_URL}/listings/${lid}/unavailable-dates`,
        {
          unavailableDates: [
            ...(cur?.unavailableDates || []),
            {
              from: new Date(from).toISOString(),
              to: new Date(to).toISOString(),
              reason: "maintenance",
            },
          ],
        },
        { headers: { ...authH(), "Content-Type": "application/json" } },
      );
      const nd = r.data.data?.unavailableDates || [];
      setListings((p) => {
        const u = p.map((l) =>
          (l._id || l.id) === lid ? { ...l, unavailableDates: nd } : l,
        );
        const sel = u.find((l) => (l._id || l.id) === lid);
        if (sel) setBlockListing(sel);
        return u;
      });
      toast.success("Dates blocked!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to block dates");
    }
  };

  const unblockDate = async (lid, idx) => {
    try {
      const cur = listings.find((l) => (l._id || l.id) === lid);
      const upd = (cur?.unavailableDates || []).filter((_, i) => i !== idx);
      const r = await axios.patch(
        `${API_URL}/listings/${lid}/unavailable-dates`,
        { unavailableDates: upd },
        { headers: { ...authH(), "Content-Type": "application/json" } },
      );
      const nd = r.data.data?.unavailableDates || upd;
      setListings((p) => {
        const u = p.map((l) =>
          (l._id || l.id) === lid ? { ...l, unavailableDates: nd } : l,
        );
        const sel = u.find((l) => (l._id || l.id) === lid);
        if (sel) setBlockListing(sel);
        return u;
      });
      toast.success("Date unblocked!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(
        `${API_URL}/notifications/${id}/read`,
        {},
        { headers: authH() },
      );
      setNotifs((p) =>
        p.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch {}
  };
  const markAllRead = async () => {
    try {
      await axios.put(
        `${API_URL}/notifications/mark-all-read`,
        {},
        { headers: authH() },
      );
      setNotifs((p) => p.map((n) => ({ ...n, isRead: true })));
      toast.success("All read");
    } catch {
      toast.error("Failed");
    }
  };
  const removeWish = async (lid) => {
    try {
      const r = await axios.delete(`${API_URL}/wishlist/${lid}`, {
        headers: authH(),
      });
      if (r.status === 200 || r.status === 204) {
        setWishlist((p) => p.filter((l) => l._id !== lid));
        toast.success("Removed!");
      }
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/auth/login");
      } else toast.error("Failed to remove");
    }
  };
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  const unread = notifs.filter((n) => !n.isRead).length;
  const paid = bookings.filter((b) =>
    ["paid", "confirmed"].includes(b.status?.toLowerCase()),
  );
  const totalSpent = paid.reduce(
    (s, b) => s + (b.totalAmount || b.total || 0),
    0,
  );

  const NAV = [
    {
      group: "Guest",
      items: [
        {
          id: "bookings",
          label: "My Bookings",
          ico: I.Receipt,
          badge: bookings.length,
        },
        {
          id: "wishlist",
          label: "Favorites",
          ico: I.Star,
          badge: wishlist.length,
        },
        { id: "transactions", label: "Transactions", ico: I.Card, badge: 0 },
      ],
    },
    {
      group: "Host",
      items: [
        {
          id: "listings",
          label: "My Listings",
          ico: I.Home,
          badge: listings.length,
        },
        {
          id: "owner-bookings",
          label: "Manage Bookings",
          ico: I.Users,
          badge: 0,
        },
      ],
    },
    {
      group: "Account",
      items: [
        {
          id: "notifications",
          label: "Notifications",
          ico: I.Bell,
          badge: unread,
        },
        { id: "profile", label: "Profile", ico: I.User, badge: 0 },
      ],
    },
  ];

  const TITLES = {
    bookings: {
      eye: "Guest",
      title: "My Bookings",
      sub: "Your upcoming & past stays",
    },
    wishlist: {
      eye: "Guest",
      title: "Favorites",
      sub: "Properties you've saved",
    },
    transactions: {
      eye: "Guest",
      title: "Transactions",
      sub: "Full payment history",
    },
    listings: {
      eye: "Host",
      title: "My Listings",
      sub: "Properties you're hosting",
    },
    "owner-bookings": {
      eye: "Host",
      title: "Manage Bookings",
      sub: "Review and action guest reservations",
    },
    notifications: {
      eye: "Account",
      title: "Notifications",
      sub: "Stay in the loop",
    },
    profile: {
      eye: "Account",
      title: "Profile & Settings",
      sub: "Manage your account",
    },
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
        }}
      >
        <Styles />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              border: "3px solid #F0C8C4",
              borderTopColor: "var(--red)",
              borderRadius: "50%",
            }}
            className="spin"
          />
          <p
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 17,
              color: "var(--muted)",
            }}
          >
            Loading your account…
          </p>
        </div>
      </div>
    );

  return (
    <div style={{ background: "#fff", minHeight: "100vh", marginTop: 60 }}>
      <Styles />
<aside
        className={"sb" + (sbOpen ? " open" : "")}
        style={{ marginTop: 60 }}
      >
<div className="sb-logo">
          <div className="sb-logo-tag">Dashboard</div>
        </div>
{user && (
          <div className="sb-user">
            <div className="sb-av">{user.username?.[0]?.toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sb-uname">{user.username}</div>
              <div className="sb-uemail">{user.email}</div>
            </div>
          </div>
        )}
<nav className="sb-nav">
          {NAV.map(({ group, items }) => (
            <div key={group}>
              <div className="sb-grp">{group}</div>
              {items.map(({ id, label, ico: Ico, badge }) => (
                <button
                  key={id}
                  className={"nb" + (section === id ? " on" : "")}
                  onClick={() => {
                    setSection(id);
                    setSbOpen(false);
                  }}
                >
                  <Ico style={{ width: 17, height: 17 }} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge > 0 && <span className="nb-badge">{badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
<div className="sb-foot">
          <a href="/" className="sb-back">
            <I.Chev style={{ width: 15, height: 15 }} /> Back to Home
          </a>
        </div>
      </aside>
<div className="main">
<div
          style={{
            padding: "14px 20px",
            background: "#fff",
            borderBottom: "1.5px solid var(--border)",
            alignItems: "center",
            gap: 12,
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
          className="mobile-topbar"
        >
          <button
            onClick={() => setSbOpen((p) => !p)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "var(--text)",
              padding: 4,
            }}
          >
            <I.Menu style={{ width: 22, height: 22 }} />
          </button>
          <span
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 18,
              color: "var(--text)",
            }}
          >
            {TITLES[section]?.title}
          </span>
        </div>
<div className="ph">
          <div>
            <div className="ph-eye">{TITLES[section]?.eye}</div>
            <div className="ph-title">{TITLES[section]?.title}</div>
            <div className="ph-sub">{TITLES[section]?.sub}</div>
          </div>
{section === "bookings" && user && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
{alternatives.length > 0 && (
                <button
                  onClick={() => setAltModalOpen(true)}
                  style={{
                    padding: "12px 18px",
                    background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
                    animation: "pulse 2s infinite",
                  }}
                >
                  <I.Home style={{ width: 16, height: 16 }} />
                  View Alternative Bookings ({alternatives.length})
                </button>
              )}
              {[
                { l: "Bookings", v: bookings.length },
                { l: "Listings", v: listings.length },
                { l: "Spent", v: `₹${fmt(totalSpent)}` },
                { l: "Alerts", v: unread },
              ].map(({ l, v }) => (
                <div
                  key={l}
                  style={{
                    textAlign: "center",
                    padding: "10px 16px",
                    background: "var(--red-l)",
                    borderRadius: 12,
                    border: "1.5px solid #F0C8C4",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: 20,
                      color: "var(--red)",
                      lineHeight: 1,
                    }}
                  >
                    {v}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      marginTop: 3,
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
<div className="content">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {section === "bookings" && (
                <MyBookings bookings={bookings} onView={setViewBooking} />
              )}
              {section === "wishlist" && (
                <Wishlist
                  wishlist={wishlist}
                  onRemove={removeWish}
                  onNav={(id) => navigate(`/listings/${id}`)}
                />
              )}
              {section === "transactions" && (
                <Transactions bookings={bookings} onView={setViewBooking} />
              )}
              {section === "listings" && (
                <MyListings
                  listings={listings}
                  onEdit={(id) => navigate(`/listings/${id}/edit`)}
                  onDelete={deleteListing}
                  onBlock={(l) => {
                    setBlockListing(l);
                  }}
                />
              )}
              {section === "owner-bookings" && <ManageBookings />}
              {section === "notifications" && (
                <Notifications
                  notifications={notifs}
                  markRead={markRead}
                  markAll={markAllRead}
                />
              )}
              {section === "profile" && (
                <Profile
                  user={user}
                  onEdit={() => setEditOpen(true)}
                  onLogout={logout}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
<EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        form={editForm}
        setForm={setEditForm}
        onSubmit={saveProfile}
        busy={editBusy}
      />
      <BlockDatesModal
        open={!!blockListing}
        onClose={() => setBlockListing(null)}
        listing={blockListing}
        onBlock={blockDates}
        onUnblock={unblockDate}
      />
      {viewBooking && (
        <BookingDetailModal
          booking={viewBooking}
          user={user}
          onClose={() => setViewBooking(null)}
        />
      )}
<AlternativeBookingsModal
        isOpen={altModalOpen}
        onClose={() => {
          setAltModalOpen(false);
          setAlternatives([]);
        }}
        alternatives={alternatives}
        onAccept={(data) => {

          axios
            .get(`${API_URL}/bookings/my-bookings`, { headers: authH() })
            .then((r) => setBookings(Array.isArray(r.data) ? r.data : []));

          setAlternatives([]);
          setAltModalOpen(false);
        }}
      />
    </div>
  );
};

export default Account;