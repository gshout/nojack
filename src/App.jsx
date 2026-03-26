import { useState, useCallback, useEffect } from "react";

const IMAGES = [
  { id: 1, src: "src/assets/IMG_7896.jpg", title: "Good Kitty", category: "High IQ" },
  { id: 2, src: "src/assets/IMG_7897.jpg", title: "Cavernous", category: "High IQ" },
  { id: 3, src: "src/assets/IMG_7898.jpg", title: "I Like Turtles", category: "High IQ" },
  { id: 4, src: "src/assets/IMG_7899.jpg", title: "Lets Go For A Swim", category: "High IQ" },
  { id: 5, src: "src/assets/IMG_7900.jpg", title: "Multi-Dimensional", category: "MAXX IQ" },
  { id: 6, src: "src/assets/IMG_7901.jpg", title: "Powered By More Than Wind", category: "High IQ" },
  { id: 7, src: "src/assets/IMG_7903.jpg", title: "Flat Earth", category: "High IQ" },
  { id: 8, src: "src/assets/IMG_7904.jpg", title: "Galactic", category: "MAXX IQ" },
  { id: 9, src: "src/assets/OIP-804204961.jpg", title: "Creedence Clearwater Intensifies", category: "MAXX IQ" },
];

// ─── Audio ────────────────────────────────────────────────────────────────────
function playDeniedSound(level = "normal") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    if (level === "normal") {
      const beep = (freq, start, dur, vol) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination); o.type = "square";
        o.frequency.setValueAtTime(freq, now + start);
        g.gain.setValueAtTime(0, now + start);
        g.gain.linearRampToValueAtTime(vol, now + start + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        o.start(now + start); o.stop(now + start + dur + 0.05);
      };
      beep(440, 0, 0.18, 0.3); beep(330, 0.22, 0.18, 0.3); beep(220, 0.44, 0.35, 0.35);
    } else if (level === "transition") {
      [[55, 28, 0.4, "sawtooth"], [58.27, 58.27, 0.25, "sawtooth"]].forEach(([f1, f2, vol, type]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination); o.type = type;
        o.frequency.setValueAtTime(f1, now); o.frequency.exponentialRampToValueAtTime(f2, now + 1.8);
        g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        o.start(now); o.stop(now + 1.9);
      });
      const gl = ctx.createOscillator(), glg = ctx.createGain();
      gl.connect(glg); glg.connect(ctx.destination); gl.type = "sine";
      gl.frequency.setValueAtTime(320, now + 0.1); gl.frequency.exponentialRampToValueAtTime(60, now + 1.4);
      glg.gain.setValueAtTime(0, now + 0.1); glg.gain.linearRampToValueAtTime(0.3, now + 0.2); glg.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      gl.start(now + 0.1); gl.stop(now + 1.7);
      const sc = ctx.createOscillator(), scg = ctx.createGain();
      sc.connect(scg); scg.connect(ctx.destination); sc.type = "sawtooth";
      sc.frequency.setValueAtTime(1800, now); sc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
      scg.gain.setValueAtTime(0.15, now); scg.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      sc.start(now); sc.stop(now + 0.4);
    } else if (level === "abyss") {
      const th = ctx.createOscillator(), thg = ctx.createGain(), thf = ctx.createBiquadFilter();
      th.connect(thf); thf.connect(thg); thg.connect(ctx.destination);
      th.type = "sine"; th.frequency.setValueAtTime(40, now); th.frequency.exponentialRampToValueAtTime(18, now + 2.5);
      thf.type = "lowpass"; thf.frequency.value = 120;
      thg.gain.setValueAtTime(0.7, now); thg.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      th.start(now); th.stop(now + 2.6);
      [29.14, 30.87, 32.70].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination); o.type = "sawtooth";
        o.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0, now + i * 0.08); g.gain.linearRampToValueAtTime(0.18, now + i * 0.08 + 0.1); g.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
        o.start(now + i * 0.08); o.stop(now + 2.9);
      });
      const mn = ctx.createOscillator(), mng = ctx.createGain(), mnf = ctx.createBiquadFilter();
      mn.connect(mnf); mnf.connect(mng); mng.connect(ctx.destination);
      mn.type = "sine"; mn.frequency.setValueAtTime(180, now + 0.3); mn.frequency.exponentialRampToValueAtTime(38, now + 2.8);
      mnf.type = "bandpass"; mnf.frequency.value = 200; mnf.Q.value = 1.5;
      mng.gain.setValueAtTime(0, now + 0.3); mng.gain.linearRampToValueAtTime(0.35, now + 0.6); mng.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
      mn.start(now + 0.3); mn.stop(now + 2.9);
      const cr = ctx.createOscillator(), crg = ctx.createGain();
      cr.connect(crg); crg.connect(ctx.destination); cr.type = "sawtooth";
      cr.frequency.setValueAtTime(3200, now); cr.frequency.exponentialRampToValueAtTime(800, now + 0.12);
      crg.gain.setValueAtTime(0.12, now); crg.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      cr.start(now); cr.stop(now + 0.15);
    }
  } catch (e) {}
}

function playGameTone(idx, wrong = false) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    if (wrong) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = "sawtooth";
      o.frequency.setValueAtTime(120, now); o.frequency.exponentialRampToValueAtTime(40, now + 0.6);
      g.gain.setValueAtTime(0.35, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      o.start(now); o.stop(now + 0.65);
    } else {
      const freqs = [220, 261.6, 311.1, 369.9];
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = "sine";
      o.frequency.setValueAtTime(freqs[idx], now);
      g.gain.setValueAtTime(0.3, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      o.start(now); o.stop(now + 0.45);
    }
  } catch (e) {}
}

function playWinSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [261.6, 329.6, 392, 523.2].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = "sine";
      o.frequency.setValueAtTime(freq, now + i * 0.15);
      g.gain.setValueAtTime(0, now + i * 0.15);
      g.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
      o.start(now + i * 0.15); o.stop(now + i * 0.15 + 0.45);
    });
  } catch (e) {}
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&family=Special+Elite&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #0d0d0d; color: #f0ede8; min-height: 100vh; }

  /* Normal login */
  .login-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0d0d0d; }
  .login-card { display: flex; flex-direction: column; align-items: flex-start; padding: 3rem 3.5rem; background: #111; border: 1px solid #1e1e1e; border-radius: 8px; width: 100%; max-width: 420px; }
  .login-tag { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: #c8b89a; margin-bottom: 2rem; font-weight: 400; }
  .login-card h2 { font-family: 'DM Serif Display', serif; font-size: 2rem; color: #f0ede8; margin-bottom: 0.4rem; line-height: 1.2; }
  .login-card .sub { font-size: 0.875rem; color: rgba(240,237,232,0.4); margin-bottom: 2.5rem; font-weight: 300; }
  .field-group { width: 100%; margin-bottom: 1.25rem; }
  .field-group label { display: block; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(240,237,232,0.5); margin-bottom: 0.6rem; font-weight: 400; }
  .field-group input { width: 100%; padding: 0.9rem 1.1rem; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 4px; color: #f0ede8; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 300; outline: none; transition: border-color 0.2s; }
  .field-group input:focus { border-color: #c8b89a; }
  .field-group input::placeholder { color: rgba(240,237,232,0.2); }
  .login-btn { width: 100%; padding: 0.95rem; background: #c8b89a; border: none; border-radius: 4px; color: #0d0d0d; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: background 0.2s, transform 0.1s; margin-top: 0.25rem; }
  .login-btn:hover { background: #d4c6ac; }
  .login-btn:active { transform: scale(0.99); }
  .hint { margin-top: 1.25rem; font-size: 0.78rem; color: rgba(240,237,232,0.2); font-weight: 300; }

  /* Drop animation */
  .dropping { animation: dropOut 0.7s cubic-bezier(0.55, 0, 1, 0.45) forwards; }
  @keyframes dropOut {
    0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
    60%  { transform: translateY(60px) rotate(3deg); opacity: 0.6; }
    100% { transform: translateY(120vh) rotate(8deg); opacity: 0; }
  }

  /* Scary login */
  .scary-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #060608; animation: scaryFadeIn 1s ease forwards; }
  @keyframes scaryFadeIn { from { opacity: 0; } to { opacity: 1; } }
  .scary-card { display: flex; flex-direction: column; align-items: flex-start; padding: 3rem 3.5rem; background: #0a0a0c; border: 1px solid #3a0000; border-radius: 4px; width: 100%; max-width: 420px; animation: scarySlideIn 0.8s cubic-bezier(0.2,0,0.3,1) forwards; box-shadow: 0 0 60px rgba(180,0,0,0.08), 0 0 120px rgba(180,0,0,0.04); }
  @keyframes scarySlideIn { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .scary-tag { font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; color: #8b0000; margin-bottom: 2rem; font-weight: 400; }
  .scary-card h2 { font-family: 'Special Elite', serif; font-size: 1.9rem; color: #cc0000; margin-bottom: 0.5rem; line-height: 1.2; text-shadow: 0 0 20px rgba(200,0,0,0.3); }
  .scary-card .sub { font-size: 0.875rem; color: rgba(200,50,50,0.45); margin-bottom: 2.5rem; font-weight: 300; }
  .scary-field { width: 100%; margin-bottom: 1.25rem; }
  .scary-field label { display: block; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(200,50,50,0.5); margin-bottom: 0.6rem; font-weight: 400; }
  .scary-field input { width: 100%; padding: 0.9rem 1.1rem; background: #0f0005; border: 1px solid #3a0000; border-radius: 2px; color: #cc4444; font-family: 'Special Elite', monospace; font-size: 0.95rem; outline: none; transition: border-color 0.2s, box-shadow 0.2s; caret-color: #cc0000; }
  .scary-field input:focus { border-color: #8b0000; box-shadow: 0 0 12px rgba(180,0,0,0.2); }
  .scary-field input::placeholder { color: rgba(200,50,50,0.15); }
  .scary-btn { width: 100%; padding: 0.95rem; background: #1a0000; border: 1px solid #5a0000; border-radius: 2px; color: #cc0000; font-family: 'Special Elite', serif; font-size: 0.85rem; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer; transition: background 0.2s, box-shadow 0.2s; margin-top: 0.25rem; text-shadow: 0 0 8px rgba(200,0,0,0.4); }
  .scary-btn:hover { background: #2a0000; box-shadow: 0 0 20px rgba(180,0,0,0.15); }
  .scary-hint { margin-top: 1.25rem; font-size: 0.75rem; color: rgba(200,50,50,0.15); font-weight: 300; font-family: 'Special Elite', serif; }

  /* Dialogs */
  .dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.72); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.15s ease; }
  .dialog-box { background: #141414; border: 1px solid #2e1a1a; border-radius: 10px; padding: 2.25rem 2.5rem; max-width: 360px; width: 90%; text-align: center; animation: popIn 0.2s ease; }
  .dialog-icon { width: 52px; height: 52px; border-radius: 50%; background: rgba(200,60,60,0.12); border: 1px solid rgba(200,60,60,0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
  .dialog-box h3 { font-family: 'DM Serif Display', serif; font-size: 1.35rem; color: #f0ede8; margin-bottom: 0.6rem; }
  .dialog-box p { font-size: 0.85rem; color: rgba(240,237,232,0.45); font-weight: 300; line-height: 1.65; margin-bottom: 1.75rem; }
  .dialog-dismiss { padding: 0.6rem 2rem; background: transparent; border: 1px solid #3a2020; border-radius: 4px; color: #e07070; font-family: 'DM Sans', sans-serif; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: background 0.2s, border-color 0.2s; }
  .dialog-dismiss:hover { background: rgba(200,60,60,0.1); border-color: #e07070; }
  .scary-dialog-box { background: #0a0005; border: 1px solid #5a0000; border-radius: 4px; padding: 2.25rem 2.5rem; max-width: 360px; width: 90%; text-align: center; animation: popIn 0.2s ease; box-shadow: 0 0 40px rgba(180,0,0,0.15); }
  .scary-dialog-box h3 { font-family: 'Special Elite', serif; font-size: 1.4rem; color: #cc0000; margin-bottom: 0.6rem; text-shadow: 0 0 12px rgba(200,0,0,0.4); }
  .scary-dialog-box p { font-size: 0.85rem; color: rgba(200,50,50,0.5); font-weight: 300; line-height: 1.65; margin-bottom: 1.75rem; font-family: 'Special Elite', serif; }
  .scary-dismiss { padding: 0.6rem 2rem; background: #1a0000; border: 1px solid #5a0000; border-radius: 2px; color: #cc0000; font-family: 'Special Elite', serif; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
  .scary-dismiss:hover { background: #2a0000; }

  /* Mini-game */
  .game-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #05050a; animation: scaryFadeIn 0.8s ease forwards; }
  .game-card { display: flex; flex-direction: column; align-items: center; padding: 3rem 3rem 2.5rem; background: #080810; border: 1px solid #1a1a3a; border-radius: 6px; width: 100%; max-width: 460px; }
  .game-title { font-family: 'Special Elite', serif; font-size: 1.5rem; color: #8888cc; margin-bottom: 0.4rem; letter-spacing: 0.06em; }
  .game-sub { font-size: 0.8rem; color: rgba(150,150,220,0.4); margin-bottom: 2rem; font-weight: 300; letter-spacing: 0.05em; text-align: center; }
  .game-status { font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(150,150,220,0.5); margin-bottom: 1.5rem; min-height: 1.2rem; text-align: center; }
  .game-status.wrong { color: #cc4444; }
  .game-status.watching { color: #8888cc; }
  .game-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 2rem; }
  .game-btn {
    width: 120px; height: 120px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);
    cursor: pointer; transition: transform 0.1s, filter 0.1s;
    display: flex; align-items: center; justify-content: center;
    font-size: 2.2rem; opacity: 0.35; filter: brightness(0.5);
    background: #0e0e1a;
  }
  .game-btn:hover:not(:disabled) { opacity: 0.6; }
  .game-btn.lit { opacity: 1; filter: brightness(1.4); transform: scale(1.06); }
  .game-btn:disabled { cursor: default; }
  .game-start-btn { padding: 0.85rem 2.5rem; background: #0e0e2a; border: 1px solid #3a3a7a; border-radius: 4px; color: #8888cc; font-family: 'Special Elite', serif; font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
  .game-start-btn:hover { background: #16163a; }
  .game-round { font-size: 0.72rem; color: rgba(150,150,220,0.3); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 1rem; }
  .game-win-msg { font-family: 'Special Elite', serif; font-size: 1.1rem; color: #88ccaa; text-align: center; line-height: 1.6; animation: fadeIn 0.5s ease; }

  /* Gallery */
  .gallery-root { min-height: 100vh; background: #0d0d0d; }
  .gallery-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 2.5rem; border-bottom: 1px solid #1e1e1e; }
  .gallery-header-left { display: flex; align-items: baseline; gap: 1rem; }
  .gallery-header-left h1 { font-family: 'DM Serif Display', serif; font-size: 1.6rem; color: #f0ede8; line-height: 1; }
  .gallery-header-left span { font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; color: #c8b89a; font-weight: 300; }
  .welcome-pill { display: flex; align-items: center; gap: 0.75rem; }
  .welcome-pill span { font-size: 0.82rem; color: rgba(240,237,232,0.4); font-weight: 300; }
  .logout-btn { padding: 0.45rem 1rem; background: transparent; border: 1px solid #2a2a2a; border-radius: 3px; color: rgba(240,237,232,0.5); font-family: 'DM Sans', sans-serif; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
  .logout-btn:hover { border-color: #c8b89a; color: #c8b89a; }
  .filter-bar { display: flex; align-items: center; gap: 0.5rem; padding: 1.25rem 2.5rem; border-bottom: 1px solid #1a1a1a; }
  .filter-btn { padding: 0.35rem 0.9rem; background: transparent; border: 1px solid #232323; border-radius: 100px; color: rgba(240,237,232,0.4); font-family: 'DM Sans', sans-serif; font-size: 0.78rem; cursor: pointer; transition: all 0.15s; font-weight: 300; }
  .filter-btn:hover { border-color: #3a3a3a; color: rgba(240,237,232,0.7); }
  .filter-btn.active { background: #c8b89a; border-color: #c8b89a; color: #0d0d0d; font-weight: 500; }
  .gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; padding: 2px; }
  .gallery-item { position: relative; aspect-ratio: 3/2; overflow: hidden; background: #1a1a1a; cursor: pointer; }
  .gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease, filter 0.3s; filter: saturate(0.85); }
  .gallery-item:hover img { transform: scale(1.04); filter: saturate(1.1); }
  .gallery-item-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(13,13,13,0.85) 0%, transparent 50%); opacity: 0; transition: opacity 0.3s; display: flex; flex-direction: column; justify-content: flex-end; padding: 1.25rem; }
  .gallery-item:hover .gallery-item-overlay { opacity: 1; }
  .gallery-item-overlay h3 { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: #f0ede8; margin-bottom: 0.2rem; }
  .gallery-item-overlay p { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: #c8b89a; font-weight: 300; }
  .lightbox { position: fixed; inset: 0; background: rgba(13,13,13,0.96); display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn 0.2s ease; }
  .lightbox-inner { position: relative; max-width: 85vw; max-height: 85vh; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .lightbox-inner img { max-width: 100%; max-height: 75vh; object-fit: contain; border-radius: 2px; }
  .lightbox-meta h3 { font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: #f0ede8; text-align: center; }
  .lightbox-meta p { font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: #c8b89a; text-align: center; margin-top: 0.25rem; font-weight: 300; }
  .lightbox-close { position: fixed; top: 1.5rem; right: 2rem; background: none; border: none; color: rgba(240,237,232,0.5); font-size: 1.5rem; cursor: pointer; transition: color 0.2s; line-height: 1; }
  .lightbox-close:hover { color: #f0ede8; }

  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes popIn   { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  @keyframes shake   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
  @keyframes flicker { 0%,100%{opacity:1} 45%{opacity:0.85} 50%{opacity:0.6} 55%{opacity:0.9} }
`;

// ─── Simon Says game ──────────────────────────────────────────────────────────
const SYMBOLS    = ["☽", "✦", "⬡", "⌖"];
const BTN_COLORS = ["#5a3fcf", "#c97c20", "#20997a", "#993030"];
const TARGET_ROUNDS = 4;

function SimonGame({ onWin }) {
  const [phase, setPhase]       = useState("intro");   // intro | watch | input | wrong | won
  const [sequence, setSequence] = useState([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [lit, setLit]           = useState(null);
  const [round, setRound]       = useState(0);

  const flashSequence = useCallback((seq) => {
    setPhase("watch");
    setLit(null);
    let i = 0;
    const tick = () => {
      if (i >= seq.length) {
        setTimeout(() => { setLit(null); setPhase("input"); setPlayerIdx(0); }, 400);
        return;
      }
      setTimeout(() => {
        setLit(seq[i]);
        playGameTone(seq[i]);
        setTimeout(() => { setLit(null); i++; tick(); }, 650);
      }, 300);
    };
    setTimeout(tick, 500);
  }, []);

  const startRound = useCallback((r, prev) => {
    const next = [...prev, Math.floor(Math.random() * 4)];
    setSequence(next);
    setRound(r);
    flashSequence(next);
  }, [flashSequence]);

  const handlePress = (idx) => {
    if (phase !== "input") return;
    playGameTone(idx);
    setLit(idx);
    setTimeout(() => setLit(null), 250);

    if (idx !== sequence[playerIdx]) {
      playGameTone(idx, true);
      setPhase("wrong");
      setTimeout(() => flashSequence(sequence), 1000);
      return;
    }

    const next = playerIdx + 1;
    if (next === sequence.length) {
      if (round >= TARGET_ROUNDS) {
        playWinSound();
        setPhase("won");
        setTimeout(() => onWin(), 2000);
      } else {
        setPhase("watch");
        setTimeout(() => startRound(round + 1, sequence), 700);
      }
    } else {
      setPlayerIdx(next);
    }
  };

  const statusText = () => {
    if (phase === "intro")  return "";
    if (phase === "watch")  return "watch carefully...";
    if (phase === "input")  return `your turn — step ${playerIdx + 1} of ${sequence.length}`;
    if (phase === "wrong")  return "wrong. watch again.";
    if (phase === "won")    return "access granted.";
    return "";
  };

  return (
    <div className="game-root">
      <style>{styles}</style>
      <div className="game-card">
        <div className="game-title">Prove You're Not Jack and Beat the Game</div>
        <div className="game-sub">repeat the sequence to gain entry</div>

        <div className={`game-status${phase === "wrong" ? " wrong" : phase === "watch" ? " watching" : ""}`}>
          {statusText()}
        </div>

        <div className="game-grid">
          {SYMBOLS.map((sym, i) => (
            <button
              key={i}
              className={`game-btn${lit === i ? " lit" : ""}`}
              style={{ borderColor: lit === i ? BTN_COLORS[i] : "rgba(255,255,255,0.06)", color: BTN_COLORS[i], boxShadow: lit === i ? `0 0 24px ${BTN_COLORS[i]}88` : "none" }}
              onClick={() => handlePress(i)}
              disabled={phase !== "input"}
            >
              {sym}
            </button>
          ))}
        </div>

        {phase === "intro" && (
          <button className="game-start-btn" onClick={() => startRound(1, [])}>begin</button>
        )}

        {phase === "won" && (
          <div className="game-win-msg">the gates open.<br/>welcome.</div>
        )}

        {phase !== "intro" && phase !== "won" && (
          <div className="game-round">round {round} / {TARGET_ROUNDS}</div>
        )}
      </div>
    </div>
  );
}

// ─── Dialogs ──────────────────────────────────────────────────────────────────
function AccessDeniedDialog({ scary, onDismiss }) {
  if (scary) {
    return (
      <div className="dialog-backdrop" onClick={onDismiss}>
        <div className="scary-dialog-box" onClick={e => e.stopPropagation()}>
          <div className="dialog-icon" style={{ borderColor: "rgba(180,0,0,0.4)", background: "rgba(180,0,0,0.08)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#cc0000" strokeWidth="1.5"/>
              <path d="M12 7v6M12 16.5v.5" stroke="#cc0000" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h3>You Should Not Be Here</h3>
          <p>This intrusion has been logged. Further attempts are inadvisable.</p>
          <button className="scary-dismiss" onClick={onDismiss}>leave now</button>
        </div>
      </div>
    );
  }
  return (
    <div className="dialog-backdrop" onClick={onDismiss}>
      <div className="dialog-box" onClick={e => e.stopPropagation()}>
        <div className="dialog-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#e07070" strokeWidth="1.5"/>
            <path d="M12 7v6M12 16.5v.5" stroke="#e07070" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h3>Access Denied</h3>
        <p>You are Jack. Please do not be Jack and try again!</p>
        <button className="dialog-dismiss" onClick={onDismiss}>Dismiss</button>
      </div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
// stage: "normal" | "scary" | "game"
function LoginPage({ onLogin }) {
  const [username, setUsername]   = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [shaking, setShaking]     = useState(false);
  const [dropping, setDropping]   = useState(false);
  const [stage, setStage]         = useState("normal");
  const [normalFails, setNormalFails] = useState(0);
  const [scaryFails, setScaryFails]   = useState(0);

  const triggerDrop = (nextStage, delay = 750) => {
    setDropping(true);
    setTimeout(() => {
      setDropping(false);
      setUsername("");
      setStage(nextStage);
    }, delay);
  };

  const handleLogin = useCallback(() => {
    if (!username.trim() || !username.endsWith("!")) {
      if (stage === "normal") {
        const fails = normalFails + 1;
        setNormalFails(fails);
        if (fails >= 5) {
          playDeniedSound("transition");
          triggerDrop("scary");
        } else {
          playDeniedSound("normal");
          setShaking(true); setTimeout(() => setShaking(false), 500);
          setTimeout(() => setShowDialog(true), 150);
        }
      } else if (stage === "scary") {
        const fails = scaryFails + 1;
        setScaryFails(fails);
        if (fails >= 3) {
          playDeniedSound("transition");
          triggerDrop("game");
        } else {
          playDeniedSound("abyss");
          setShaking(true); setTimeout(() => setShaking(false), 500);
          setTimeout(() => setShowDialog(true), 150);
        }
      }
      return;
    }
    onLogin(username);
  }, [username, stage, normalFails, scaryFails, onLogin]);

  // Minigame win → log in as "intruder"
  if (stage === "game") {
    return <SimonGame onWin={() => onLogin("JACK")} />;
  }

  if (stage === "scary") {
    return (
      <div className="scary-root">
        <style>{styles}</style>
        <div className={`scary-card${dropping ? " dropping" : ""}`}>
          <div className="scary-tag" style={{ animation: "flicker 3s infinite" }}>Restricted jAccess!</div>
          <h2>Are you Jack?!</h2>
          <p className="sub">You have failed too many times and it seems like you are Jack!</p>
          <div className="scary-field">
            <label>Identify Yourself!</label>
            <input
              type="text" placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={shaking ? { animation: "shake 0.4s ease" } : {}}
              autoFocus
            />
          </div>
          <button className="scary-btn" onClick={handleLogin}>attempt entry</button>
          <p className="scary-hint">you know what you must do!</p>
        </div>
        {showDialog && <AccessDeniedDialog scary onDismiss={() => setShowDialog(false)} />}
      </div>
    );
  }

  return (
    <div className="login-root">
      <style>{styles}</style>
      <div className={`login-card${dropping ? " dropping" : ""}`}>
        <div className="login-tag">Member Access</div>
        <h2>Welcome</h2>
        <p className="sub">No Jacks Allowed!</p>
        <div className="field-group">
          <input
            type="text" placeholder="User Name"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={shaking ? { animation: "shake 0.4s ease" } : {}}
          />
        </div>
        <button className="login-btn" onClick={handleLogin}>Enter Gallery</button>
        <p className="hint">Hint: user must not be jack!</p>
      </div>
      {showDialog && <AccessDeniedDialog scary={false} onDismiss={() => setShowDialog(false)} />}
    </div>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
function GalleryPage({ username, onLogout }) {
  const [filter, setFilter]   = useState("All");
  const [lightbox, setLightbox] = useState(null);
  const categories = ["All", "High IQ", "MAXX IQ"];
  const filtered = filter === "All" ? IMAGES : IMAGES.filter(i => i.category === filter);

  return (
    <div className="gallery-root">
      <style>{styles}</style>
      <header className="gallery-header">
        <div className="gallery-header-left">
          <h1>Corgi Butt Gallery</h1>
          <span>— {filtered.length} buns</span>
        </div>
        <div className="welcome-pill">
          <span>Signed in as <strong style={{ color: "#c8b89a", fontWeight: 400 }}>{username}</strong></span>
          <button className="logout-btn" onClick={onLogout}>Sign out</button>
        </div>
      </header>
      <div className="filter-bar">
        {categories.map(cat => (
          <button key={cat} className={`filter-btn${filter === cat ? " active" : ""}`} onClick={() => setFilter(cat)}>{cat}</button>
        ))}
      </div>
      <div className="gallery-grid">
        {filtered.map(img => (
          <div key={img.id} className="gallery-item" onClick={() => setLightbox(img)}>
            <img src={img.src} alt={img.title} loading="lazy" />
            <div className="gallery-item-overlay">
              <h3>{img.title}</h3>
              <p>{img.category}</p>
            </div>
          </div>
        ))}
      </div>
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={lightbox.src.replace("600/400", "900/600")} alt={lightbox.title} />
            <div className="lightbox-meta">
              <h3>{lightbox.title}</h3>
              <p>{lightbox.category}</p>
            </div>
          </div>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  if (!user) return <LoginPage onLogin={setUser} />;
  return <GalleryPage username={user} onLogout={() => setUser(null)} />;
}
