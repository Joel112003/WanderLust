import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Star, Home, Clock, CreditCard, Camera, Lock, Users, FileText, ArrowRight, ArrowUpRight } from 'lucide-react';

const MARQUEE = ['Global Reach', 'Secure Payments', 'Flexible Dates', 'Top Support', '190+ Countries', '97% Revenue', 'Free Photos', 'Smart Guests'];

const Counter = ({ target, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const num = parseFloat(target);
        const duration = 1600;
        const steps = 60;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          const ease = 1 - Math.pow(1 - progress, 4);
          setCount(Math.round(num * ease * 10) / 10);
          if (step >= steps) clearInterval(timer);
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

export default function FrontPageOfCreateListings() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) { navigate('/listings/new'); return; }
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 400);
    const t3 = setTimeout(() => setPhase(3), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const goLogin = () => navigate('/auth/login', { state: { from: '/listings/new' } });
  const goSignup = () => navigate('/auth/signup', { state: { from: '/listings/new' } });

  return (

    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", background: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink: #0A0A08;
          --charcoal: #1A1A17;
          --muted: #7A7A70;
          --lighter: #A8A89E;
          --accent: #C8382A;
          --accent2: #E85D50;
          --blush: #FAF0EE;
          --cream: #FDFCFA;
          --white: #FFFFFF;
          --border: #EBEBЕ7;
          --border2: #F0F0EC;
          --sans: 'Outfit', sans-serif;
          --serif: 'Cormorant Garamond', serif;
        }

        /* Stagger animations */
        .reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1); }
        .reveal.p1 { transition-delay: 0s; }
        .reveal.p2 { transition-delay: 0.15s; }
        .reveal.p3 { transition-delay: 0.3s; }
        .reveal.p4 { transition-delay: 0.45s; }
        .reveal.p5 { transition-delay: 0.6s; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

        .reveal-left { opacity: 0; transform: translateX(-30px); transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1); }
        .reveal-left.visible { opacity: 1; transform: translateX(0); }
        .reveal-right { opacity: 0; transform: translateX(30px); transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1); transition-delay: 0.2s; }
        .reveal-right.visible { opacity: 1; transform: translateX(0); }
        .reveal-scale { opacity: 0; transform: scale(0.94); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .reveal-scale.visible { opacity: 1; transform: scale(1); }

        /* Marquee */
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .marquee-inner { animation: marquee 28s linear infinite; display: flex; width: max-content; gap: 0; }
        .marquee-outer { overflow: hidden; }
        .marquee-inner:hover { animation-play-state: paused; }

        /* Hover cards */
        .feat-card {
          background: var(--white);
          border: 1px solid #EBEBЕ7;
          border-radius: 20px;
          padding: 36px 28px;
          cursor: default;
          position: relative;
          overflow: hidden;
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.3s;
        }
        .feat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--blush) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .feat-card:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 32px 80px rgba(10,10,8,0.1); border-color: rgba(200,56,42,0.3); }
        .feat-card:hover::before { opacity: 1; }
        .feat-card > * { position: relative; z-index: 1; }

        /* Stat card */
        .stat-cell { padding: 56px 44px; text-align: center; position: relative; transition: background 0.3s; }
        .stat-cell:hover { background: var(--blush); }
        .stat-cell + .stat-cell { border-left: 1px solid #EBEBЕ7; }

        /* Float cards */
        @keyframes floatA { 0%,100% { transform: translateY(0px) rotate(-1deg); } 50% { transform: translateY(-10px) rotate(-1deg); } }
        @keyframes floatB { 0%,100% { transform: translateY(0px) rotate(1.5deg); } 50% { transform: translateY(-14px) rotate(1.5deg); } }
        @keyframes floatC { 0%,100% { transform: translateY(0px) rotate(-0.5deg); } 50% { transform: translateY(-8px) rotate(-0.5deg); } }
        .float-a { animation: floatA 6s ease-in-out infinite; }
        .float-b { animation: floatB 7s ease-in-out infinite 0.8s; }
        .float-c { animation: floatC 5s ease-in-out infinite 1.6s; }

        /* Buttons */
        .btn-main {
          display: inline-flex; align-items: center; gap: 10px;
          background: var(--ink); color: #fff; border: none;
          font-family: var(--sans); font-weight: 600; font-size: 14px; letter-spacing: 0.03em;
          padding: 16px 34px; border-radius: 100px; cursor: pointer;
          position: relative; overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s;
        }
        .btn-main::after {
          content: ''; position: absolute; inset: 0; background: var(--accent);
          transform: translateX(-102%); transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
          border-radius: inherit;
        }
        .btn-main:hover::after { transform: translateX(0); }
        .btn-main:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(200,56,42,0.35); }
        .btn-main span, .btn-main svg { position: relative; z-index: 1; }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: var(--ink);
          border: 1.5px solid #D0D0C8; font-family: var(--sans); font-weight: 500;
          font-size: 14px; padding: 15px 30px; border-radius: 100px; cursor: pointer;
          transition: border-color 0.3s, background 0.3s, color 0.3s, transform 0.3s;
        }
        .btn-outline:hover { border-color: var(--ink); background: var(--ink); color: #fff; transform: translateY(-2px); }

        /* Line decoration */
        .eyebrow-line { display: flex; align-items: center; gap: 14px; }
        .eyebrow-line::before { content: ''; width: 40px; height: 1.5px; background: var(--accent); flex-shrink: 0; }

        /* Scroll fade in via JS class */
        .scroll-reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .scroll-reveal.in-view { opacity: 1; transform: translateY(0); }

        /* Tag pill */
        .tag-pill { display: inline-flex; align-items: center; gap: 8px; background: #F4F4F0; border-radius: 100px; padding: 8px 18px; font-family: var(--sans); font-size: 12.5px; font-weight: 500; color: var(--muted); letter-spacing: 0.01em; }

        @media (max-width: 900px) {
          .hero-two-col { grid-template-columns: 1fr !important; }
          .hero-visuals { display: none !important; }
          .stats-row { grid-template-columns: 1fr !important; }
          .stats-row .stat-cell + .stat-cell { border-left: none !important; border-top: 1px solid #EBEBЕ7; }
          .features-two-col { grid-template-columns: 1fr !important; }
          .feat-sticky { position: static !important; }
          .features-grid-inner { grid-template-columns: 1fr !important; }
          .cta-inner { padding: 56px 32px !important; }
        }

        /* Number shimmer on hover */
        @keyframes shimmer { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        .num-shimmer:hover {
          background: linear-gradient(90deg, var(--ink), var(--accent), var(--ink));
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: shimmer 1.5s ease infinite;
        }

        /* Visual card in hero */
        .hero-vis-card { background: white; border-radius: 18px; padding: 22px 24px; box-shadow: 0 12px 40px rgba(10,10,8,0.08); border: 1px solid #F0F0EC; }
      `}</style>
<section ref={heroRef} style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(80px,10vw,120px) clamp(20px,5vw,60px) 80px', position: 'relative' }}>
<div style={{
          position: 'absolute', right: -60, top: -40, width: 600, height: 600, pointerEvents: 'none', zIndex: 0,
          background: `radial-gradient(ellipse at ${50 + mousePos.x * 12}% ${50 + mousePos.y * 12}%, #FAE8E5 0%, #FFF5F4 40%, transparent 70%)`,
          transition: 'background 0.6s ease', borderRadius: '50%',
        }} />

        <div className={`hero-two-col`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px,6vw,100px)', alignItems: 'center', position: 'relative', zIndex: 1 }}>
<div>
            <div className={`reveal p1 ${phase >= 1 ? 'visible' : ''}`} style={{ marginBottom: 28 }}>
              <span className="tag-pill">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
                50,000+ hosts earning worldwide
              </span>
            </div>

            <h1 className={`reveal p2 ${phase >= 1 ? 'visible' : ''}`} style={{
              fontFamily: 'var(--serif)', fontWeight: 700,
              fontSize: 'clamp(52px,7vw,84px)', lineHeight: 1.04,
              color: 'var(--ink)', letterSpacing: '-0.025em', marginBottom: 30
            }}>
              Share your<br />space,{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 300 }}>earn<br />beautifully.</em>
            </h1>

            <p className={`reveal p3 ${phase >= 1 ? 'visible' : ''}`} style={{
              fontFamily: 'var(--sans)', fontSize: 16, lineHeight: 1.8, color: 'var(--muted)',
              maxWidth: 400, marginBottom: 48, fontWeight: 400
            }}>
              Unlock the earning potential of your home. Join thousands of hosts welcoming travelers from 190+ countries.
            </p>

            <div className={`reveal p4 ${phase >= 1 ? 'visible' : ''}`} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 60 }}>
              <button className="btn-main" onClick={goSignup}>
                <span>Start hosting</span>
                <ArrowRight size={15} />
              </button>
              <button className="btn-outline" onClick={goLogin}>
                I have an account
              </button>
            </div>

            <div className={`reveal p5 ${phase >= 1 ? 'visible' : ''}`} style={{ display: 'flex', gap: 0, borderTop: '1px solid #F0F0EC', paddingTop: 32 }}>
              {[
                { val: '97%', label: 'Revenue kept' },
                { val: '4.9★', label: 'Host rating' },
                { val: '10min', label: 'Setup time' },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, paddingRight: 28, borderRight: i < 2 ? '1px solid #F0F0EC' : 'none', marginRight: i < 2 ? 28 : 0 }}>
                  <div className="num-shimmer" style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 28, color: 'var(--ink)', cursor: 'default', transition: 'all 0.2s', display: 'inline-block' }}>{s.val}</div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--lighter)', marginTop: 4, fontWeight: 400 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
<div className={`hero-visuals reveal-right ${phase >= 2 ? 'visible' : ''}`} style={{ position: 'relative', height: 540, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
<div style={{ position: 'absolute', inset: 20, borderRadius: 28, background: 'linear-gradient(145deg, #FFF5F3 0%, #FDF8F7 50%, #F5F5F2 100%)', border: '1px solid #F0EDE9' }} />
<div className="hero-vis-card float-a" style={{ position: 'absolute', left: '8%', top: '12%', width: 200, zIndex: 3 }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600, color: 'var(--lighter)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>This month</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 38, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>$3,240</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#22C55E', marginTop: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>↑</span> 18% vs last month
              </div>
            </div>
<div className="hero-vis-card float-b" style={{ position: 'absolute', right: '6%', top: '22%', width: 190, zIndex: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏡</div>
                <div>
                  <div style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>New booking</div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--lighter)' }}>just now</div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>Marcus T. booked 5 nights · <strong style={{ color: 'var(--accent)' }}>$890</strong></div>
            </div>
<div className="hero-vis-card float-c" style={{ position: 'absolute', left: '12%', bottom: '16%', width: 170, zIndex: 3 }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--lighter)', marginBottom: 8, fontWeight: 500 }}>Guest review</div>
              <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: '#F59E0B', fontSize: 16 }}>★</span>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--charcoal)', lineHeight: 1.5, fontStyle: 'italic' }}>"Absolutely stunning view, 10/10!"</div>
            </div>
<div className="hero-vis-card float-b" style={{ position: 'absolute', right: '4%', bottom: '18%', width: 150, zIndex: 3, textAlign: 'center', padding: '20px 16px' }}>
              <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 32, color: 'var(--ink)', lineHeight: 1 }}>190+</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--muted)', marginTop: 6, fontWeight: 400 }}>Countries<br />represented</div>
            </div>
          </div>
        </div>
      </section>
<div style={{ borderTop: '1px solid #F0F0EC', borderBottom: '1px solid #F0F0EC', padding: '14px 0', overflow: 'hidden', background: '#FAFAF8' }}>
        <div className="marquee-outer">
          <div className="marquee-inner">
            {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((w, i) => (
              <span key={i} style={{
                fontFamily: 'var(--serif)', fontStyle: 'italic',
                fontSize: 20, letterSpacing: '0.01em',
                color: i % 5 === 0 ? 'var(--accent)' : i % 3 === 1 ? 'var(--charcoal)' : 'var(--lighter)',
                padding: '0 36px',
                transition: 'color 0.2s',
              }}>
                {w}
                <span style={{ marginLeft: 36, color: '#D0D0C8', fontSize: 8 }}>◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
<StatsSection />
<FeaturesSection />
<ProcessSection />
<CtaSection goSignup={goSignup} goLogin={goLogin} />
    </div>
  );
}

function StatsSection() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section ref={ref} style={{ maxWidth: 1240, margin: '0 auto', padding: '80px clamp(20px,5vw,60px)' }}>
      <div style={{ borderRadius: 28, border: '1px solid #EBEBЕ7', overflow: 'hidden', boxShadow: '0 2px 40px rgba(10,10,8,0.04)' }}>
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[
            { label: 'Active listings worldwide', val: '50', suf: 'K+', pre: '' },
            { label: 'Earned by hosts last month', val: '2.5', suf: 'M+', pre: '$' },
            { label: 'Average host satisfaction', val: '4.9', suf: '★', pre: '' },
          ].map((s, i) => (
            <div key={i} className="stat-cell" style={{ padding: '56px 44px', textAlign: 'center', borderLeft: i > 0 ? '1px solid #EBEBЕ7' : 'none' }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
                fontSize: 'clamp(44px,6vw,68px)', color: 'var(--ink)', lineHeight: 1,
                opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.7s ${i * 0.15}s, transform 0.7s ${i * 0.15}s`,
              }}>
                {vis && <Counter target={s.val} suffix={s.suf} prefix={s.pre} />}
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--lighter)', marginTop: 10, fontWeight: 400 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Clock, title: 'Flexible scheduling', desc: 'Block dates, set rules, and adjust availability at any time with ease.' },
  { icon: CreditCard, title: 'Keep 97% earnings', desc: 'Set your own prices and keep nearly all of every booking.' },
  { icon: Camera, title: 'Professional photos', desc: 'Free professional photography included for all new listings.' },
  { icon: Lock, title: 'Guaranteed payouts', desc: 'Secure, reliable payouts deposited directly to your bank account.' },
  { icon: Users, title: 'Smart guest vetting', desc: 'Algorithms surface verified, high-quality guests for your space.' },
  { icon: FileText, title: 'Legal & tax guidance', desc: 'Full support navigating local short-term rental regulations.' },
];

function FeaturesSection() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section ref={sectionRef} style={{ padding: '0 clamp(20px,5vw,60px) 120px', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div className="features-two-col" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 80, alignItems: 'start' }}>
          <div className="feat-sticky" style={{ position: 'sticky', top: 120 }}>
            <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s, transform 0.8s' }}>
              <div className="eyebrow-line" style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>Why Wanderlust</span>
              </div>
              <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 'clamp(36px,4vw,52px)', color: 'var(--ink)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 20 }}>
                Built for<br />hosts who{' '}
                <em style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--accent)' }}>care.</em>
              </h2>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--muted)', lineHeight: 1.8, fontWeight: 400, marginBottom: 32 }}>
                Everything you need to list, manage, and grow — without the complexity.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['No hidden fees', 'Cancel anytime', '24/7 host support'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--charcoal)', fontWeight: 400 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#F0FAF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#22C55E', fontSize: 12 }}>✓</span>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="features-grid-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 4 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feat-card" style={{
                opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.7s ${0.1 + i * 0.08}s, transform 0.7s ${0.1 + i * 0.08}s, box-shadow 0.5s, border-color 0.3s, transform 0.5s`
              }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: '#FAF0EE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                  <f.icon size={20} color="var(--accent)" strokeWidth={1.5} />
                </div>
                <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 20, color: 'var(--ink)', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, fontWeight: 400 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { num: '01', title: 'Create your listing', desc: 'Add your space details, photos, and set your own price in minutes.' },
  { num: '02', title: 'Get discovered', desc: 'Your listing is shown to verified travelers in 190+ countries.' },
  { num: '03', title: 'Welcome guests', desc: 'Accept bookings on your terms. You\'re always in control.' },
  { num: '04', title: 'Earn & grow', desc: 'Receive guaranteed payouts and build your hosting reputation.' },
];

function ProcessSection() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section ref={ref} style={{ background: '#FAFAF8', padding: '100px clamp(20px,5vw,60px)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div className="eyebrow-line" style={{ justifyContent: 'center', marginBottom: 20 }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>How it works</span>
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 'clamp(36px,5vw,54px)', color: 'var(--ink)', letterSpacing: '-0.025em', lineHeight: 1.1, opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s, transform 0.7s' }}>
            Up and running in{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 300 }}>10 minutes</em>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)',
              transition: `opacity 0.7s ${i * 0.1}s, transform 0.7s ${i * 0.1}s`,
              padding: '32px 28px', borderRadius: 20, background: 'white', border: '1px solid #F0F0EC',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 72, fontWeight: 700, color: '#F5F5F1', position: 'absolute', top: -10, right: 16, lineHeight: 1, letterSpacing: '-0.04em', userSelect: 'none' }}>{s.num}</div>
              <div style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 17, color: 'var(--accent)', marginBottom: 14, letterSpacing: '-0.01em' }}>{s.num}</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{s.title}</h3>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, fontWeight: 400 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ goSignup, goLogin }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section ref={ref} style={{ padding: '0 clamp(20px,5vw,60px) 100px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div className="cta-inner" style={{
          borderRadius: 32, padding: '88px 72px', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #0F0F0D 0%, #1C1916 60%, #140D0C 100%)',
          opacity: inView ? 1 : 0, transform: inView ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.98)',
          transition: 'opacity 0.9s, transform 0.9s',
        }}>
<div style={{ position: 'absolute', right: -80, top: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(200,56,42,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: -40, bottom: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(200,56,42,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 60, alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(200,56,42,0.8)', marginBottom: 20 }}>
                ◆ &nbsp;Start today
              </div>
              <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 'clamp(36px,5vw,62px)', color: '#FFFFFF', lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 20 }}>
                Ready to start<br />
                <em style={{ fontStyle: 'italic', fontWeight: 300, color: '#F5A49B' }}>earning today?</em>
              </h3>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontWeight: 300, maxWidth: 460 }}>
                Join thousands of hosts already making real income on Wanderlust. Your first listing takes 10 minutes.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 210 }}>
              <button onClick={goSignup} style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14, letterSpacing: '0.02em',
                padding: '16px 32px', borderRadius: 100, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'transform 0.3s, box-shadow 0.3s, background 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(200,56,42,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                Create your listing <ArrowUpRight size={15} />
              </button>
              <button onClick={goLogin} style={{
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'var(--sans)',
                fontWeight: 400, fontSize: 14, padding: '15px 32px', borderRadius: 100, cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              >
                Sign in to my account
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
