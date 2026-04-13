import { useEffect, useRef, useState, useCallback } from "react";

/* ─── CSS-in-JS styles ────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --green-950: #0f1f0f;
      --green-900: #1a3320;
      --green-800: #254d30;
      --green-700: #2f6640;
      --green-600: #3a7a50;
      --green-500: #4a9463;
      --green-400: #6ab87e;
      --green-200: #b8dfc4;
      --green-100: #d8f0e0;
      --green-50:  #eef8f2;
      --terra:     #c47c3b;
      --terra-lt:  #e8a96a;
      --terra-dk:  #8a5520;
      --cream:     #f9f5ee;
      --cream-dk:  #ede7da;
      --white:     #ffffff;
      --char:      #111814;
      --mid:       #4a5c50;
      --muted:     #8a9e90;
      --font-display: 'Cormorant Garamond', Georgia, serif;
      --font-body: 'Outfit', system-ui, sans-serif;
      --r: 16px;
      --rs: 10px;
      --ease: cubic-bezier(0.16, 1, 0.3, 1);
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: var(--font-body);
      background: var(--cream);
      color: var(--char);
      overflow-x: hidden;
      line-height: 1.6;
      cursor: none;
    }

    /* ── CUSTOM CURSOR ────────────────────────────────────────── */
    .cursor-dot {
      position: fixed; top: 0; left: 0;
      width: 8px; height: 8px;
      background: var(--terra-lt);
      border-radius: 50%;
      pointer-events: none; z-index: 9999;
      transform: translate(-50%, -50%);
      transition: width 0.25s var(--ease), height 0.25s var(--ease),
                  background 0.25s ease, opacity 0.3s ease;
      will-change: transform;
    }
    .cursor-ring {
      position: fixed; top: 0; left: 0;
      width: 36px; height: 36px;
      border: 1.5px solid rgba(196,124,59,0.5);
      border-radius: 50%;
      pointer-events: none; z-index: 9998;
      transform: translate(-50%, -50%);
      transition: width 0.35s var(--ease), height 0.35s var(--ease),
                  border-color 0.3s ease, opacity 0.3s ease;
      will-change: transform;
    }
    body:has(a:hover, button:hover, .feature-item:hover, .pricing-card:hover, .testimonial-card:hover) .cursor-dot {
      width: 16px; height: 16px;
      background: var(--terra);
    }
    body:has(a:hover, button:hover, .feature-item:hover, .pricing-card:hover) .cursor-ring {
      width: 56px; height: 56px;
      border-color: rgba(196,124,59,0.8);
    }

    /* ── NAV ───────────────────────────────────────────────────── */
    .nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 40px;
      transition: background 0.4s ease, padding 0.3s ease, backdrop-filter 0.4s ease;
    }
    .nav.scrolled {
      background: rgba(249,245,238,0.88);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      padding: 14px 40px;
      border-bottom: 1px solid rgba(58,122,80,0.1);
      box-shadow: 0 2px 20px rgba(0,0,0,0.06);
    }
    .nav-logo {
      font-family: var(--font-display);
      font-size: 22px; font-weight: 700;
      color: var(--white); letter-spacing: -0.01em;
      transition: color 0.4s;
    }
    .nav.scrolled .nav-logo { color: var(--green-800); }
    .nav-logo span { color: var(--terra-lt); }
    .nav.scrolled .nav-logo span { color: var(--terra); }
    .nav-links { display: flex; gap: 32px; align-items: center; }
    .nav-links a {
      font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.82);
      text-decoration: none; letter-spacing: 0.01em;
      position: relative; padding-bottom: 2px;
      transition: color 0.2s;
    }
    .nav-links a::after {
      content: ''; position: absolute; bottom: 0; left: 0;
      width: 0; height: 1.5px;
      background: var(--terra-lt);
      transition: width 0.3s var(--ease);
    }
    .nav-links a:hover::after { width: 100%; }
    .nav.scrolled .nav-links a { color: var(--mid); }
    .nav-links a:hover { color: var(--white); }
    .nav.scrolled .nav-links a:hover { color: var(--green-700); }
    .nav.scrolled .nav-links a::after { background: var(--terra); }
    .nav-cta {
      background: var(--terra); color: var(--white) !important;
      padding: 9px 22px; border-radius: 50px;
      font-weight: 600 !important; font-size: 13px !important;
      transition: background 0.2s, transform 0.2s var(--ease), box-shadow 0.2s, color 0.2s !important;
      box-shadow: 0 2px 12px rgba(196,124,59,0.3);
    }
    .nav-cta:hover {
      background: var(--terra-dk) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 24px rgba(196,124,59,0.45) !important;
    }
    .nav-cta::after { display: none !important; }

    /* ── HERO VIDEO SCROLL ────────────────────────────────────── */
    .hero-scroll-container {
      position: relative;
      height: 350vh;
    }
    .hero-sticky {
      position: sticky; top: 0;
      width: 100%; height: 100vh;
      overflow: hidden;
    }
    .hero-video {
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      z-index: 0;
      pointer-events: none;
    }

    /* ── ANIMATED CSS FALLBACK (when video fails / Netlify limit) ── */
    .hero-fallback {
      position: absolute; inset: 0; z-index: 0;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(47,102,64,0.6) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 20%, rgba(74,148,99,0.5) 0%, transparent 50%),
        radial-gradient(ellipse at 60% 80%, rgba(196,124,59,0.25) 0%, transparent 45%),
        linear-gradient(135deg, #0f1f0f 0%, #1a3320 40%, #254d30 70%, #0f1f0f 100%);
      overflow: hidden;
    }
    /* Animated mesh grid */
    .hero-fallback::before {
      content: '';
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(106,184,126,0.07) 1px, transparent 1px),
        linear-gradient(90deg, rgba(106,184,126,0.07) 1px, transparent 1px);
      background-size: 72px 72px;
      animation: grid-move 20s linear infinite;
    }
    @keyframes grid-move {
      from { background-position: 0 0; }
      to   { background-position: 72px 72px; }
    }
    /* Floating orbs */
    .hero-fallback::after {
      content: '';
      position: absolute; inset: 0;
      background:
        radial-gradient(circle 180px at 15% 25%, rgba(106,184,126,0.18) 0%, transparent 70%),
        radial-gradient(circle 240px at 85% 60%, rgba(74,148,99,0.15) 0%, transparent 70%),
        radial-gradient(circle 120px at 50% 85%, rgba(196,124,59,0.12) 0%, transparent 70%);
      animation: orbs-drift 12s ease-in-out infinite alternate;
    }
    @keyframes orbs-drift {
      from { opacity: 0.6; transform: scale(1) translateY(0); }
      to   { opacity: 1;   transform: scale(1.08) translateY(-12px); }
    }
    /* Floating food emojis */
    .food-float {
      position: absolute;
      font-size: 1.6rem;
      opacity: 0;
      animation: food-rise linear infinite;
      pointer-events: none;
      filter: brightness(0.9);
    }
    @keyframes food-rise {
      0%   { transform: translateY(110vh) rotate(0deg);   opacity: 0; }
      8%   { opacity: 0.18; }
      92%  { opacity: 0.18; }
      100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
    }

    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(15,31,15,0.5) 0%,
        rgba(15,31,15,0.25) 50%,
        rgba(15,31,15,0.70) 100%
      );
      z-index: 1;
    }
    .hero-content {
      position: relative; z-index: 2;
      height: 100%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      text-align: center; padding: 0 24px;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.25);
      backdrop-filter: blur(10px);
      color: var(--green-100); font-size: 12px; font-weight: 500;
      padding: 6px 16px; border-radius: 50px;
      margin-bottom: 28px; letter-spacing: 0.05em; text-transform: uppercase;
      animation: fadeUp 0.8s 0.1s var(--ease) both;
      transition: transform 0.3s var(--ease), box-shadow 0.3s;
    }
    .hero-badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(106,184,126,0.25);
    }
    .hero-badge::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%;
      background: var(--green-400); animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

    .hero-title {
      font-family: var(--font-display);
      font-size: clamp(42px, 7vw, 90px);
      font-weight: 700; color: var(--white);
      line-height: 1.08; letter-spacing: -0.02em;
      margin-bottom: 24px; max-width: 900px;
      animation: fadeUp 0.8s 0.25s var(--ease) both;
    }
    .hero-title em { color: var(--terra-lt); font-style: normal; }
    .hero-sub {
      font-size: clamp(16px, 2vw, 20px);
      color: rgba(255,255,255,0.78);
      max-width: 560px; line-height: 1.65;
      margin-bottom: 40px; font-weight: 300;
      animation: fadeUp 0.8s 0.4s var(--ease) both;
    }
    .hero-actions {
      display: flex; gap: 14px; align-items: center;
      flex-wrap: wrap; justify-content: center;
      animation: fadeUp 0.8s 0.55s var(--ease) both;
    }

    /* ── SCROLL PROGRESS ─────────────────────────────────────── */
    .scroll-progress-bar {
      position: fixed; top: 0; left: 0; height: 2px;
      background: linear-gradient(90deg, var(--green-500), var(--terra-lt));
      z-index: 2000; transition: width 0.1s linear;
      pointer-events: none;
    }

    /* ── VIDEO LOAD INDICATOR ───────────────────────────────── */
    .video-loading {
      position: absolute; inset: 0; z-index: 3;
      display: flex; align-items: center; justify-content: center;
      background: var(--green-950);
      transition: opacity 0.6s ease;
    }
    .video-loading.hidden { opacity: 0; pointer-events: none; }
    .video-spinner {
      width: 40px; height: 40px;
      border: 2px solid rgba(106,184,126,0.2);
      border-top-color: var(--green-400);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── SCROLL HINT ─────────────────────────────────────────── */
    .hero-scroll-hint {
      position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
      z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 8px;
      color: rgba(255,255,255,0.5); font-size: 11px; letter-spacing: 0.08em;
      text-transform: uppercase; animation: bounce 2s 1s infinite both;
    }
    .scroll-line {
      width: 1px; height: 40px;
      background: linear-gradient(to bottom, rgba(255,255,255,0.5), transparent);
    }
    @keyframes bounce {
      0%,100%{transform:translateX(-50%) translateY(0)}
      50%{transform:translateX(-50%) translateY(8px)}
    }

    /* ── BUTTONS ─────────────────────────────────────────────── */
    .btn-primary {
      background: var(--terra); color: var(--white);
      padding: 15px 32px; border-radius: 50px;
      font-size: 15px; font-weight: 600; font-family: var(--font-body);
      border: none; cursor: pointer; text-decoration: none;
      display: inline-flex; align-items: center; gap: 8px;
      transition: background 0.2s, transform 0.25s var(--ease), box-shadow 0.25s;
      box-shadow: 0 4px 24px rgba(196,124,59,0.4);
      position: relative; overflow: hidden;
    }
    .btn-primary::before {
      content: ''; position: absolute; inset: 0;
      background: rgba(255,255,255,0.15);
      transform: translateX(-110%) skewX(-15deg);
      transition: transform 0.4s var(--ease);
    }
    .btn-primary:hover::before { transform: translateX(110%) skewX(-15deg); }
    .btn-primary:hover {
      background: var(--terra-dk);
      transform: translateY(-3px);
      box-shadow: 0 12px 36px rgba(196,124,59,0.55);
    }
    .btn-primary:active { transform: translateY(-1px); }

    .btn-ghost {
      background: transparent; color: var(--white);
      padding: 15px 32px; border-radius: 50px;
      font-size: 15px; font-weight: 500; font-family: var(--font-body);
      border: 1.5px solid rgba(255,255,255,0.4); cursor: pointer; text-decoration: none;
      display: inline-flex; align-items: center; gap: 8px;
      transition: all 0.25s var(--ease);
    }
    .btn-ghost:hover {
      border-color: rgba(255,255,255,0.9);
      background: rgba(255,255,255,0.1);
      transform: translateY(-2px);
    }
    .hero-trust {
      margin-top: 24px; font-size: 12px;
      color: rgba(255,255,255,0.45); font-weight: 400;
      animation: fadeUp 0.8s 0.7s var(--ease) both;
    }

    /* ── SECTIONS SHARED ─────────────────────────────────────── */
    section { padding: 100px 40px; }
    .container { max-width: 1160px; margin: 0 auto; }

    /* ── METRICS BAR ──────────────────────────────────────────── */
    .metrics-bar {
      background: var(--green-900);
      padding: 60px 40px;
    }
    .metrics-grid {
      max-width: 1000px; margin: 0 auto;
      display: grid; grid-template-columns: repeat(3,1fr); gap: 1px;
      background: rgba(255,255,255,0.08);
      border-radius: var(--r); overflow: hidden;
    }
    .metric-item {
      padding: 40px 32px; text-align: center;
      background: var(--green-900);
      transition: background 0.3s;
    }
    .metric-item:hover { background: var(--green-800); }
    .metric-num {
      font-family: var(--font-display);
      font-size: 52px; font-weight: 700;
      color: var(--green-400); line-height: 1;
      margin-bottom: 10px;
      transition: color 0.3s, transform 0.3s var(--ease);
    }
    .metric-item:hover .metric-num {
      color: var(--terra-lt);
      transform: scale(1.06);
    }
    .metric-label { font-size: 14px; color: var(--green-200); font-weight: 300; line-height: 1.5; }

    /* ── SECTION LABELS ────────────────────────────────────────── */
    .section-label {
      display: inline-block;
      font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
      text-transform: uppercase; color: var(--green-600);
      margin-bottom: 16px;
    }
    .section-title {
      font-family: var(--font-display);
      font-size: clamp(32px, 4vw, 52px);
      font-weight: 700; line-height: 1.12;
      letter-spacing: -0.02em; color: var(--char);
      margin-bottom: 20px;
    }
    .section-title em { color: var(--green-700); font-style: normal; }
    .section-sub {
      font-size: 17px; color: var(--mid);
      max-width: 520px; line-height: 1.7; font-weight: 300;
    }

    /* ── PROBLEM / SOLUTION ────────────────────────────────────── */
    .problem-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 64px;
    }
    .problem-card {
      background: var(--white); border-radius: var(--r);
      padding: 40px; border: 1px solid var(--cream-dk);
      transition: transform 0.35s var(--ease), box-shadow 0.35s, border-color 0.3s;
    }
    .problem-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 24px 60px rgba(0,0,0,0.08);
    }
    .problem-card.solution {
      border-color: var(--green-200); background: var(--green-50);
    }
    .problem-card.solution:hover {
      border-color: var(--green-400);
      box-shadow: 0 24px 60px rgba(74,148,99,0.12);
    }
    .card-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; margin-bottom: 20px;
      transition: transform 0.4s var(--ease);
    }
    .problem-card:hover .card-icon { transform: scale(1.15) rotate(-5deg); }
    .problem-card .card-icon { background: #fef3f2; }
    .problem-card.solution .card-icon { background: var(--green-100); }
    .card-title {
      font-family: var(--font-display);
      font-size: 22px; font-weight: 600; margin-bottom: 20px; color: var(--char);
    }
    .pain-list, .gain-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
    .pain-list li, .gain-list li {
      display: flex; align-items: flex-start; gap: 12px;
      font-size: 14px; color: var(--mid); line-height: 1.55;
      transition: color 0.2s, transform 0.2s;
    }
    .pain-list li:hover { color: #e57373; transform: translateX(4px); }
    .gain-list li:hover { color: var(--green-700); transform: translateX(4px); }
    .pain-list li::before {
      content: '✕'; color: #e57373; font-weight: 700;
      flex-shrink: 0; margin-top: 1px;
    }
    .gain-list li::before {
      content: '✓'; color: var(--green-600); font-weight: 700;
      flex-shrink: 0; margin-top: 1px;
    }

    /* ── FEATURES ──────────────────────────────────────────────── */
    .features-section { background: var(--green-950); }
    .features-section .section-title { color: var(--white); }
    .features-section .section-label { color: var(--green-400); }
    .features-section .section-sub { color: var(--green-200); }
    .features-grid {
      display: grid; grid-template-columns: repeat(3,1fr); gap: 2px;
      margin-top: 64px; background: rgba(255,255,255,0.05);
      border-radius: var(--r); overflow: hidden;
    }
    .feature-item {
      background: var(--green-950); padding: 36px 32px;
      transition: background 0.3s, transform 0.3s var(--ease);
      cursor: default;
      position: relative; overflow: hidden;
    }
    .feature-item::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--green-500), transparent);
      transform: scaleX(0);
      transition: transform 0.4s var(--ease);
    }
    .feature-item:hover { background: var(--green-900); }
    .feature-item:hover::after { transform: scaleX(1); }
    .feature-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: var(--green-900);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; margin-bottom: 20px;
      transition: transform 0.4s var(--ease), background 0.3s, box-shadow 0.3s;
    }
    .feature-item:hover .feature-icon {
      transform: translateY(-4px) scale(1.08);
      background: var(--green-800);
      box-shadow: 0 8px 24px rgba(106,184,126,0.2);
    }
    .feature-title {
      font-family: var(--font-display);
      font-size: 19px; font-weight: 600;
      color: var(--white); margin-bottom: 10px;
      transition: color 0.2s;
    }
    .feature-item:hover .feature-title { color: var(--green-200); }
    .feature-desc { font-size: 13px; color: var(--green-200); line-height: 1.65; font-weight: 300; }

    /* ── MOCKUP ───────────────────────────────────────────────── */
    .mockup-section { background: var(--cream); }
    .mockup-wrap {
      margin-top: 56px; position: relative;
      background: var(--green-900); border-radius: 24px;
      padding: 48px 48px 0; overflow: hidden;
      transition: transform 0.4s var(--ease), box-shadow 0.4s;
    }
    .mockup-wrap:hover {
      transform: translateY(-4px);
      box-shadow: 0 32px 80px rgba(15,31,15,0.2);
    }
    .mockup-bar { display: flex; gap: 6px; margin-bottom: 20px; }
    .mockup-dot {
      width: 12px; height: 12px; border-radius: 50%;
      transition: transform 0.2s;
    }
    .mockup-wrap:hover .mockup-dot { transform: scale(1.2); }
    .mockup-screen {
      background: var(--cream); border-radius: 12px 12px 0 0;
      min-height: 320px; padding: 24px;
      display: grid; grid-template-columns: 200px 1fr; gap: 20px;
    }
    .mockup-sidebar {
      background: var(--green-800); border-radius: 8px; padding: 20px 16px;
    }
    .sidebar-logo {
      font-family: var(--font-display); font-size: 16px;
      color: var(--white); font-weight: 700; margin-bottom: 24px;
    }
    .sidebar-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 10px; border-radius: 6px;
      font-size: 12px; color: rgba(255,255,255,0.6);
      margin-bottom: 4px;
      transition: background 0.2s, color 0.2s, transform 0.2s;
      cursor: pointer;
    }
    .sidebar-item:hover:not(.active) {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.85);
      transform: translateX(3px);
    }
    .sidebar-item.active { background: rgba(255,255,255,0.12); color: var(--white); }
    .mockup-main { display: flex; flex-direction: column; gap: 16px; }
    .mockup-stat-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
    .mockup-stat {
      background: var(--white); border-radius: 10px; padding: 14px 16px;
      border: 1px solid var(--cream-dk);
      transition: transform 0.25s var(--ease), box-shadow 0.25s;
    }
    .mockup-stat:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .mockup-stat .num { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--green-700); }
    .mockup-stat .lbl { font-size: 10px; color: var(--muted); margin-top: 2px; }
    .mockup-chart {
      background: var(--white); border-radius: 10px; padding: 16px;
      border: 1px solid var(--cream-dk); flex: 1;
      display: flex; flex-direction: column; gap: 8px;
    }
    .chart-title { font-size: 12px; font-weight: 600; color: var(--char); }
    .chart-bars { display: flex; align-items: flex-end; gap: 8px; height: 80px; padding-top: 8px; }
    .chart-bar {
      flex: 1; border-radius: 4px 4px 0 0;
      transition: opacity 0.2s, transform 0.2s var(--ease);
      transform-origin: bottom;
    }
    .chart-bar:hover { opacity: 1 !important; transform: scaleY(1.08); }

    /* ── PRICING ─────────────────────────────────────────────── */
    .pricing-section { background: var(--white); }
    .pricing-grid {
      display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 64px;
    }
    .pricing-card {
      border: 1px solid var(--cream-dk);
      border-radius: var(--r); padding: 36px 32px;
      position: relative;
      transition: transform 0.35s var(--ease), box-shadow 0.35s, border-color 0.3s;
      background: var(--white);
    }
    .pricing-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 28px 70px rgba(0,0,0,0.1);
    }
    .pricing-card.featured {
      border-color: var(--green-600); border-width: 2px;
      background: var(--green-50);
    }
    .pricing-card.featured:hover {
      box-shadow: 0 28px 70px rgba(74,148,99,0.2);
    }
    .popular-tag {
      position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
      background: var(--green-700); color: var(--white);
      font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
      padding: 4px 16px; border-radius: 50px; white-space: nowrap;
    }
    .plan-name {
      font-size: 13px; font-weight: 600; color: var(--muted);
      letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 12px;
    }
    .plan-price {
      font-family: var(--font-display);
      font-size: 52px; font-weight: 700; color: var(--char);
      line-height: 1; margin-bottom: 4px;
      transition: color 0.3s;
    }
    .pricing-card:hover .plan-price { color: var(--green-700); }
    .plan-price sup { font-size: 22px; vertical-align: top; margin-top: 12px; }
    .plan-period { font-size: 13px; color: var(--muted); margin-bottom: 28px; }
    .plan-divider { height: 1px; background: var(--cream-dk); margin-bottom: 24px; }
    .plan-features { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
    .plan-features li {
      display: flex; align-items: center; gap: 10px;
      font-size: 13px; color: var(--mid);
      transition: color 0.2s, transform 0.2s;
    }
    .plan-features li:hover { color: var(--green-700); transform: translateX(3px); }
    .plan-features li::before { content: '✓'; color: var(--green-600); font-weight: 700; flex-shrink: 0; }
    .plan-btn {
      width: 100%; padding: 13px; border-radius: 50px;
      font-size: 14px; font-weight: 600; font-family: var(--font-body);
      cursor: pointer; border: none;
      transition: all 0.25s var(--ease);
      position: relative; overflow: hidden;
    }
    .plan-btn::before {
      content: ''; position: absolute; inset: 0;
      background: rgba(255,255,255,0.12);
      transform: translateX(-110%) skewX(-15deg);
      transition: transform 0.4s var(--ease);
    }
    .plan-btn:hover::before { transform: translateX(110%) skewX(-15deg); }
    .plan-btn-outline {
      background: transparent; border: 1.5px solid var(--green-400, #6ab87e);
      color: var(--green-700);
    }
    .plan-btn-outline:hover {
      background: var(--green-50);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(74,148,99,0.15);
    }
    .plan-btn-filled { background: var(--green-700); color: var(--white); }
    .plan-btn-filled:hover {
      background: var(--green-800);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(47,102,64,0.4);
    }

    .addons-box {
      margin-top: 40px; border: 1px solid var(--cream-dk);
      border-radius: var(--r); padding: 36px; background: var(--cream);
      transition: box-shadow 0.3s;
    }
    .addons-box:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.06); }
    .addons-title {
      font-family: var(--font-display); font-size: 20px; font-weight: 600;
      color: var(--char); margin-bottom: 24px;
    }
    .addons-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .addon-item {
      background: var(--white); border-radius: var(--rs);
      padding: 24px; border: 1px solid var(--cream-dk);
      transition: transform 0.3s var(--ease), box-shadow 0.3s, border-color 0.3s;
    }
    .addon-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.08);
      border-color: var(--terra-lt);
    }
    .addon-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .addon-name { font-size: 15px; font-weight: 600; color: var(--char); }
    .addon-price {
      font-family: var(--font-display); font-size: 20px; font-weight: 700;
      color: var(--terra); white-space: nowrap;
    }
    .addon-desc { font-size: 13px; color: var(--mid); line-height: 1.6; }

    /* ── TESTIMONIALS ─────────────────────────────────────────── */
    .testimonials-section { background: var(--cream); }
    .testimonials-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin-top: 56px; }
    .testimonial-card {
      background: var(--white); border-radius: var(--r);
      padding: 32px; border: 1px solid var(--cream-dk);
      transition: transform 0.35s var(--ease), box-shadow 0.35s, border-color 0.3s;
    }
    .testimonial-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 56px rgba(0,0,0,0.09);
      border-color: var(--green-200);
    }
    .stars { color: var(--terra); font-size: 16px; margin-bottom: 16px; }
    .testimonial-text {
      font-size: 14px; color: var(--mid); line-height: 1.75;
      font-style: italic; margin-bottom: 24px;
    }
    .testimonial-author { display: flex; align-items: center; gap: 12px; }
    .author-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--green-700); display: flex; align-items: center; justify-content: center;
      font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--white);
      flex-shrink: 0;
      transition: transform 0.3s var(--ease), box-shadow 0.3s;
    }
    .testimonial-card:hover .author-avatar {
      transform: scale(1.1);
      box-shadow: 0 4px 16px rgba(47,102,64,0.3);
    }
    .author-name { font-size: 13px; font-weight: 600; color: var(--char); }
    .author-role { font-size: 12px; color: var(--muted); margin-top: 2px; }

    /* ── FAQ ──────────────────────────────────────────────────── */
    .faq-section { background: var(--white); }
    .faq-list { margin-top: 56px; max-width: 720px; margin-left: auto; margin-right: auto; }
    .faq-item {
      border-bottom: 1px solid var(--cream-dk); overflow: hidden;
    }
    .faq-q {
      width: 100%; background: none; border: none; cursor: pointer;
      display: flex; justify-content: space-between; align-items: center;
      padding: 22px 0; font-family: var(--font-body);
      font-size: 15px; font-weight: 500; color: var(--char);
      text-align: left; gap: 16px;
      transition: color 0.2s;
    }
    .faq-q:hover { color: var(--green-700); }
    .faq-arrow {
      font-size: 20px; color: var(--muted);
      transition: transform 0.3s var(--ease), color 0.2s;
      flex-shrink: 0;
    }
    .faq-arrow.open { transform: rotate(45deg); color: var(--green-600); }
    .faq-a {
      font-size: 14px; color: var(--mid); line-height: 1.75;
      max-height: 0; overflow: hidden;
      transition: max-height 0.4s var(--ease), padding 0.3s ease;
      padding-bottom: 0;
    }
    .faq-a.open { max-height: 200px; padding-bottom: 20px; }

    /* ── CTA FINAL ────────────────────────────────────────────── */
    .cta-section {
      background: var(--green-900);
      text-align: center; padding: 120px 40px;
    }
    .cta-section .section-title { color: var(--white); }
    .cta-section .section-sub { color: var(--green-200); margin: 0 auto 40px; }

    /* ── FOOTER ───────────────────────────────────────────────── */
    footer { background: var(--green-950); padding: 48px 40px; }
    .footer-inner {
      max-width: 1160px; margin: 0 auto;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 20px;
    }
    .footer-logo {
      font-family: var(--font-display); font-size: 18px;
      font-weight: 700; color: var(--white);
      transition: color 0.2s;
    }
    .footer-logo:hover { color: var(--terra-lt); }
    .footer-logo span { color: var(--terra-lt); }
    .footer-links { display: flex; gap: 24px; }
    .footer-links a {
      font-size: 13px; color: rgba(255,255,255,0.4); text-decoration: none;
      transition: color 0.2s, transform 0.2s;
      display: inline-block;
    }
    .footer-links a:hover { color: rgba(255,255,255,0.85); transform: translateY(-2px); }
    .footer-copy { font-size: 12px; color: rgba(255,255,255,0.25); }

    /* ── REVEAL ───────────────────────────────────────────────── */
    .reveal {
      opacity: 0; transform: translateY(28px);
      transition: opacity 0.75s var(--ease), transform 0.75s var(--ease);
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }

    /* ── RESPONSIVE ───────────────────────────────────────────── */
    @media (max-width: 900px) {
      body { cursor: auto; }
      .cursor-dot, .cursor-ring { display: none; }
      section { padding: 72px 24px; }
      .nav { padding: 16px 24px; }
      .nav.scrolled { padding: 12px 24px; }
      .nav-links { display: none; }
      .problem-grid, .features-grid, .pricing-grid,
      .testimonials-grid, .addons-grid { grid-template-columns: 1fr; }
      .metrics-grid { grid-template-columns: 1fr; }
      .mockup-screen { grid-template-columns: 1fr; }
      .mockup-sidebar { display: none; }
      .mockup-stat-row { grid-template-columns: repeat(2,1fr); }
    }
  `}</style>
);

/* ─── DATA ────────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: "👥", title: "Gestión de pacientes", desc: "Historial completo, datos antropométricos, seguimiento de peso y entrevistas iniciales personalizadas." },
  { icon: "🗓", title: "Planificador semanal", desc: "Arrastra recetas a cualquier día y comida. Genera la semana entera en minutos, no horas." },
  { icon: "📋", title: "Plantillas reutilizables", desc: "Crea una dieta una vez, úsala con cualquier paciente. Personaliza en segundos." },
  { icon: "🛒", title: "Lista de la compra automática", desc: "Generada al instante desde el plan semanal. Con márgenes de seguridad y agrupada por categorías." },
  { icon: "📄", title: "PDF profesional con tu marca", desc: "Portada personalizada con tu logo, paleta y datos de contacto. Listo para entregar al paciente." },
  { icon: "📊", title: "Dashboard y facturación", desc: "Métricas de consulta, evolución por plan y facturación acumulada. Todo en un vistazo." },
];

const PLANS = [
  {
    name: "Básico", price: 10, featured: false,
    features: ["Hasta 20 pacientes", "Planificador semanal", "Exportar PDF", "Soporte email"],
  },
  {
    name: "Pro", price: 25, featured: true,
    features: ["Pacientes ilimitados", "Todo lo de Básico", "Plantillas reutilizables", "Estadísticas de consulta", "Soporte prioritario"],
  },
  {
    name: "Premium", price: 50, featured: false,
    features: ["Todo lo de Pro", "PDF con marca blanca", "API de acceso", "Account manager"],
  },
];

const TESTIMONIALS = [
  { initials: "AG", name: "Ana García", role: "Nutricionista clínica · Madrid", text: "Antes tardaba casi 2 horas por paciente entre la dieta y la lista de la compra. Ahora lo tengo en 10 minutos. Literalmente he doblado mi cartera de clientes en 3 meses." },
  { initials: "MR", name: "Marc Ribera", role: "Nutricionista deportivo · Barcelona", text: "La función de plantillas es un antes y un después. Tengo mis protocolos guardados y los adapto en segundos. El PDF que sale es tan profesional que los clientes lo comentan." },
  { initials: "LM", name: "Laura Martínez", role: "Dietista · Valencia", text: "Por fin una herramienta hecha para nutricionistas, no para hospitales. Es intuitiva, rápida y el soporte responde de verdad. Me ha devuelto tiempo para lo que me gusta: mis pacientes." },
];

const FAQS = [
  { q: "¿Puedo cancelar en cualquier momento?", a: "Sí, sin permanencia ni penalizaciones. Cancelas desde tu panel y no se renueva el siguiente ciclo. Conservas el acceso hasta el final del período pagado." },
  { q: "¿Los PDF tienen mi marca y logotipo?", a: "Sí. En la sección Exportar puedes configurar tu nombre, logo, especialidad, email y web. Cada PDF generado incluye una portada profesional con tus datos." },
  { q: "¿Funciona para nutricionistas independientes sin clínica?", a: "Perfectamente. Está diseñado justo para ese perfil: autónomos y pequeñas consultas que quieren trabajar con eficiencia sin depender de software corporativo caro." },
  { q: "¿Qué pasa si supero los 20 pacientes del plan Básico?", a: "Puedes hacer upgrade a Pro en cualquier momento desde tu panel. El cambio es inmediato y se prorratea el precio restante del mes en curso." },
  { q: "¿El chatbot nutricional entiende restricciones alimentarias?", a: "Sí. El add-on de chatbot tiene en cuenta alergias, intolerancias, preferencias y alimentos disponibles en casa para adaptar la dieta en tiempo real." },
];

/* ─── FAQ ITEM ─────────────────────────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-q" onClick={() => setOpen(!open)}>
        {q}
        <span className={`faq-arrow ${open ? "open" : ""}`}>+</span>
      </button>
      <div className={`faq-a ${open ? "open" : ""}`}>{a}</div>
    </div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────────────────────────────── */
export default function LandingPage({ onLogin = () => {}, onRegister = () => {}, onSelectPlan = () => {} }) {
  const videoRef          = useRef(null);
  const heroContainerRef  = useRef(null);
  const foodTimersRef     = useRef([]);
  const [scrolled, setScrolled]         = useState(false);
  const [videoReady, setVideoReady]     = useState(false);
  const [videoError, setVideoError]     = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // ── Service Worker cleanup (fixes 503 on Netlify) ──────────────────────
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.update().catch(() => reg.unregister()));
      });
    }
  }, []);

  // ── Cursor tracking ─────────────────────────────────────────────────────
  useEffect(() => {
    const dot  = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    if (!dot || !ring) return;

    let ringX = 0, ringY = 0;
    let dotX  = 0, dotY  = 0;
    let raf;

    const onMove = (e) => {
      dotX = e.clientX; dotY = e.clientY;
    };
    const animate = () => {
      // Dot follows instantly
      dot.style.left  = dotX + "px";
      dot.style.top   = dotY + "px";
      // Ring follows with lerp
      ringX += (dotX - ringX) * 0.11;
      ringY += (dotY - ringY) * 0.11;
      ring.style.left = ringX + "px";
      ring.style.top  = ringY + "px";
      raf = requestAnimationFrame(animate);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ── Video scroll scrubbing — THE FIX ────────────────────────────────────
  useEffect(() => {
    const video     = videoRef.current;
    const container = heroContainerRef.current;
    if (!video || !container) return;

    // ① State machine: track pending seek
    let isSeeking   = false;
    let targetTime  = 0;

    // ② When seek finishes, apply the latest targetTime if it changed
    const onSeeked = () => {
      isSeeking = false;
      const diff = Math.abs(video.currentTime - targetTime);
      if (diff > 0.033) { // >1 frame difference → seek again
        isSeeking = true;
        try { video.currentTime = targetTime; } catch (_) {}
      }
    };
    video.addEventListener("seeked", onSeeked);

    // ③ When video metadata is ready, mark it usable
    const onReady = () => setVideoReady(true);
    video.addEventListener("loadedmetadata", onReady);
    // Also handle already-loaded case
    if (video.readyState >= 1) setVideoReady(true);

    // ④ Scroll handler — only updates targetTime + kicks off seek if idle
    let raf = null;
    const handleScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 60);

        // Global scroll progress for progress bar
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(totalScroll > 0 ? window.scrollY / totalScroll : 0);

        // Video scrub progress within hero container
        const rect        = container.getBoundingClientRect();
        const containerH  = container.offsetHeight;
        const viewportH   = window.innerHeight;
        const scrolled    = -rect.top;
        const scrollable  = containerH - viewportH;
        const progress    = Math.max(0, Math.min(1, scrolled / scrollable));

        if (video.duration && isFinite(video.duration)) {
          targetTime = progress * video.duration;
          if (!isSeeking) {
            isSeeking = true;
            try { video.currentTime = targetTime; } catch (_) {}
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // ⑤ Force preload: trigger a tiny seek to prime the buffer
    video.load();
    const primeVideo = () => {
      video.currentTime = 0.001;
    };
    video.addEventListener("loadeddata", primeVideo, { once: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadedmetadata", onReady);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── Reveal on scroll ────────────────────────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const chartBars = [
    { h: 40, color: "#4a9463" }, { h: 55, color: "#4a9463" },
    { h: 48, color: "#4a9463" }, { h: 72, color: "#4a9463" },
    { h: 65, color: "#4a9463" }, { h: 88, color: "#3a7a50" },
    { h: 95, color: "#2f6640" },
  ];

  return (
    <>
      <GlobalStyles />

      {/* CURSOR */}
      <div id="cursor-dot"  className="cursor-dot"  style={{ position: "fixed", pointerEvents: "none", zIndex: 9999 }} />
      <div id="cursor-ring" className="cursor-ring" style={{ position: "fixed", pointerEvents: "none", zIndex: 9998 }} />

      {/* SCROLL PROGRESS BAR */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      {/* NAV */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-logo">Nutri<span>Planner</span> Pro</div>
        <div className="nav-links">
          <a href="#features">Funcionalidades</a>
          <a href="#pricing">Precios</a>
          <a href="#faq">FAQ</a>
          <button
            onClick={onLogin}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: scrolled ? "var(--mid)" : "rgba(255,255,255,.75)",
              fontSize: "0.875rem", fontWeight: 500, padding: "8px 12px",
              fontFamily: "inherit", transition: "color 0.2s",
            }}
          >
            Iniciar sesión
          </button>
          <button onClick={onRegister} className="nav-cta">Empezar gratis</button>
        </div>
      </nav>

      {/* ── HERO — scroll-driven video ── */}
      <div ref={heroContainerRef} className="hero-scroll-container">
        <div className="hero-sticky">

          {/* Loading overlay — hides once video is ready */}
          <div className={`video-loading ${videoReady ? "hidden" : ""}`}>
            <div className="video-spinner" />
          </div>

          {/*
            VIDEO NOTES:
            • Place the file at:  public/Salad_elements_falling_202604121850.mp4
            • For best scrubbing: encode with `ffmpeg -i input.mp4 -movflags +faststart output.mp4`
            • preload="auto" + muted + playsInline are all required
          */}
          <video
            ref={videoRef}
            className="hero-video"
            src="/Salad_elements_falling_202604121850.mp4"
            preload="auto"
            muted
            playsInline
            onError={() => setVideoError(true)}
            style={{ display: videoError ? "none" : "block" }}
          />

          {/* CSS animated fallback — shown when video can't load (Netlify size limit, 503, 404) */}
          {videoError && (
            <div className="hero-fallback" aria-hidden="true">
              {[
                { e:"🥑", l:"8%",  d:"14s", delay:"0s"   },
                { e:"🥗", l:"18%", d:"18s", delay:"3s"   },
                { e:"🍎", l:"30%", d:"12s", delay:"1.5s" },
                { e:"🥦", l:"42%", d:"16s", delay:"5s"   },
                { e:"🍊", l:"55%", d:"20s", delay:"2s"   },
                { e:"🫐", l:"65%", d:"13s", delay:"7s"   },
                { e:"🥝", l:"75%", d:"17s", delay:"4s"   },
                { e:"🍋", l:"85%", d:"11s", delay:"6s"   },
                { e:"🥕", l:"92%", d:"15s", delay:"0.5s" },
                { e:"🌿", l:"25%", d:"19s", delay:"8s"   },
                { e:"🍓", l:"50%", d:"14s", delay:"9s"   },
                { e:"🫑", l:"72%", d:"16s", delay:"2.5s" },
              ].map((f, i) => (
                <span
                  key={i}
                  className="food-float"
                  style={{
                    left: f.l,
                    animationDuration: f.d,
                    animationDelay: f.delay,
                    fontSize: `${1.2 + (i % 3) * 0.4}rem`,
                  }}
                >
                  {f.e}
                </span>
              ))}
            </div>
          )}

          <div className="hero-overlay" />

          <div className="hero-content">
            <div className="hero-badge">Prueba gratuita 14 días</div>
            <h1 className="hero-title">
              Tu consulta de nutrición,<br />en <em>piloto automático.</em>
            </h1>
            <p className="hero-sub">
              Gestiona más pacientes, genera dietas personalizadas y entrega listas
              de la compra profesionales en minutos. No en horas.
            </p>
            <div className="hero-actions">
              <button onClick={onRegister} className="btn-primary">
                Prueba 14 días gratis →
              </button>
              <a href="#features" className="btn-ghost">
                Ver cómo funciona
              </a>
            </div>
            <p className="hero-trust">Sin tarjeta de crédito · Cancela cuando quieras</p>
          </div>

          <div className="hero-scroll-hint">
            <div className="scroll-line" />
            Scroll
          </div>
        </div>
      </div>

      {/* METRICS BAR */}
      <div className="metrics-bar">
        <div className="metrics-grid reveal">
          {[
            { num: "2.4h", label: "ahorradas por semana\ny paciente de media" },
            { num: "100%", label: "de las listas de compra\ngeneradas automáticamente" },
            { num: "14d",  label: "de prueba gratuita\nsin compromiso" },
          ].map((m, i) => (
            <div key={i} className="metric-item">
              <div className="metric-num">{m.num}</div>
              <div className="metric-label" style={{ whiteSpace: "pre-line" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEM / SOLUTION */}
      <section>
        <div className="container">
          <div className="reveal">
            <div className="section-label">El problema</div>
            <h2 className="section-title">
              El tiempo que pierdes<br /><em>es tiempo que no facturas.</em>
            </h2>
            <p className="section-sub">
              Los nutricionistas gastan más tiempo en papeleo que con sus pacientes.
              NutriPlanner Pro lo invierte.
            </p>
          </div>
          <div className="problem-grid">
            <div className="problem-card reveal">
              <div className="card-icon">⏳</div>
              <div className="card-title">Antes de NutriPlanner</div>
              <ul className="pain-list">
                <li>Crear dietas desde cero para cada paciente</li>
                <li>Listas de la compra artesanales en Word o papel</li>
                <li>Seguimiento disperso en hojas de Excel</li>
                <li>PDFs con aspecto poco profesional</li>
                <li>Sin tiempo para escalar la consulta</li>
              </ul>
            </div>
            <div className="problem-card solution reveal">
              <div className="card-icon">⚡</div>
              <div className="card-title">Con NutriPlanner Pro</div>
              <ul className="gain-list">
                <li>Dietas listas en minutos con plantillas reutilizables</li>
                <li>Lista de la compra generada y enviada en un clic</li>
                <li>Panel central con historial completo de cada paciente</li>
                <li>PDFs con tu marca, logo y datos de contacto</li>
                <li>Más pacientes, menos horas. Más ingresos.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="reveal">
            <div className="section-label">Funcionalidades</div>
            <h2 className="section-title" style={{ color: "var(--white)" }}>
              Todo lo que necesitas.<br /><em style={{ color: "var(--green-400)" }}>Nada de lo que no.</em>
            </h2>
            <p className="section-sub">Diseñado por y para nutricionistas. Sin funciones de relleno.</p>
          </div>
          <div className="features-grid reveal">
            {FEATURES.map((f, i) => (
              <div className="feature-item" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOCKUP */}
      <section className="mockup-section" id="demo">
        <div className="container">
          <div className="reveal" style={{ textAlign: "center" }}>
            <div className="section-label">La plataforma</div>
            <h2 className="section-title">Todo en un solo lugar.</h2>
            <p className="section-sub" style={{ margin: "0 auto" }}>
              Tu consulta entera en una pantalla. Rápido, limpio, profesional.
            </p>
          </div>
          <div className="mockup-wrap reveal">
            <div className="mockup-bar">
              <div className="mockup-dot" style={{ background: "#ff5f57" }} />
              <div className="mockup-dot" style={{ background: "#febc2e" }} />
              <div className="mockup-dot" style={{ background: "#28c840" }} />
            </div>
            <div className="mockup-screen">
              <div className="mockup-sidebar">
                <div className="sidebar-logo">NutriPlanner</div>
                {["📊 Dashboard","👥 Pacientes","📋 Recetas","🗓 Planificador","🛒 Compra","⬇️ Exportar"].map((item, i) => (
                  <div key={i} className={`sidebar-item ${i === 0 ? "active" : ""}`}>{item}</div>
                ))}
              </div>
              <div className="mockup-main">
                <div className="mockup-stat-row">
                  <div className="mockup-stat"><div className="num">28</div><div className="lbl">Pacientes activos</div></div>
                  <div className="mockup-stat"><div className="num">14</div><div className="lbl">Plan Básico</div></div>
                  <div className="mockup-stat"><div className="num">10</div><div className="lbl">Plan Pro</div></div>
                  <div className="mockup-stat"><div className="num" style={{ color: "var(--terra)" }}>695€</div><div className="lbl">Facturado este mes</div></div>
                </div>
                <div className="mockup-chart">
                  <div className="chart-title">Usuarios activos por semana</div>
                  <div className="chart-bars">
                    {chartBars.map((b, i) => (
                      <div key={i} className="chart-bar"
                        style={{ height: `${b.h}%`, background: b.color, opacity: 0.7 + i * 0.04 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="reveal" style={{ textAlign: "center" }}>
            <div className="section-label">Precios</div>
            <h2 className="section-title">Sin sorpresas.<br /><em>Sin letra pequeña.</em></h2>
            <p className="section-sub" style={{ margin: "0 auto" }}>
              14 días gratis en todos los planes. Sin tarjeta de crédito.
            </p>
          </div>
          <div className="pricing-grid reveal">
            {PLANS.map((plan, i) => (
              <div key={i} className={`pricing-card ${plan.featured ? "featured" : ""}`}>
                {plan.featured && <div className="popular-tag">⭐ Más popular</div>}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price"><sup>€</sup>{plan.price}</div>
                <div className="plan-period">por mes · IVA no incluido</div>
                <div className="plan-divider" />
                <ul className="plan-features">
                  {plan.features.map((f, j) => <li key={j}>{f}</li>)}
                </ul>
                <button
                  className={`plan-btn ${plan.featured ? "plan-btn-filled" : "plan-btn-outline"}`}
                  onClick={() => onSelectPlan(plan.name)}
                >
                  {plan.featured ? "Empezar con Pro →" : `Empezar con ${plan.name}`}
                </button>
              </div>
            ))}
          </div>

          <div className="addons-box reveal">
            <div className="addons-title">Add-ons disponibles — compatibles con cualquier plan</div>
            <div className="addons-grid">
              <div className="addon-item">
                <div className="addon-header">
                  <div className="addon-name">🛒 Lista de la compra premium</div>
                  <div className="addon-price">+59€/mes</div>
                </div>
                <div className="addon-desc">Listas 100% adaptadas al perfil nutricional, presupuesto y supermercados habituales de cada paciente. Entregable profesional al instante.</div>
              </div>
              <div className="addon-item">
                <div className="addon-header">
                  <div className="addon-name">🤖 Chatbot nutricional IA</div>
                  <div className="addon-price">+59€/mes</div>
                </div>
                <div className="addon-desc">IA que adapta las dietas en tiempo real según los alimentos disponibles en casa del paciente. Respeta restricciones y preferencias automáticamente.</div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }} className="reveal">
            <button onClick={onRegister} className="btn-primary">
              Empieza gratis 14 días — sin tarjeta →
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="container">
          <div className="reveal" style={{ textAlign: "center" }}>
            <div className="section-label">Testimonios</div>
            <h2 className="section-title">Lo que dicen<br /><em>los que ya lo usan.</em></h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card reveal">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.initials}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="container">
          <div className="reveal" style={{ textAlign: "center" }}>
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Preguntas frecuentes</h2>
          </div>
          <div className="faq-list reveal">
            {FAQS.map((item, i) => <FaqItem key={i} {...item} />)}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-section">
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">
              Recupera 10 horas al mes<br />
              <em style={{ color: "var(--green-400)" }}>desde el primer día.</em>
            </h2>
            <p className="section-sub">
              Únete a los nutricionistas que ya gestionan su consulta con inteligencia.
            </p>
            <button onClick={onRegister} className="btn-primary">
              Empieza tu prueba gratuita →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-logo">Nutri<span>Planner</span> Pro</div>
          <div className="footer-links">
            <a href="/privacy">Privacidad</a>
            <a href="/terms">Términos</a>
            <a href="/cookies">Cookies</a>
          </div>
          <div className="footer-copy">© 2025 NutriPlanner Pro</div>
        </div>
      </footer>
    </>
  );
}
