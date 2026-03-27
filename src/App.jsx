import { useState, useCallback, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// ─── Firebase ─────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app      = initializeApp(firebaseConfig);
const db       = getFirestore(app, "nojack");
const storage  = getStorage(app);

// ─── Static images ────────────────────────────────────────────────────────────
const STATIC_IMAGES = [
  { id: "s1", src: "IMG_7896.jpg",        title: "Good Kitty",                      category: "High IQ" },
  { id: "s2", src: "IMG_7897.jpg",        title: "Cavernous",                       category: "High IQ" },
  { id: "s3", src: "IMG_7898.jpg",        title: "I Like Turtles",                  category: "High IQ" },
  { id: "s4", src: "IMG_7899.jpg",        title: "Lets Go For A Swim",              category: "High IQ" },
  { id: "s5", src: "IMG_7900.jpg",        title: "Multi-Dimensional",               category: "MAXX IQ" },
  { id: "s6", src: "IMG_7901.jpg",        title: "Powered By More Than Wind",       category: "High IQ" },
  { id: "s7", src: "IMG_7903.JPG",        title: "Flat Earth",                      category: "High IQ" },
  { id: "s8", src: "IMG_7904.JPG",        title: "Galactic",                        category: "MAXX IQ" },
  { id: "s9", src: "OIP-804204961.jpg",   title: "Creedence Clearwater Intensifies",category: "MAXX IQ" },
];

// ─── Audio ────────────────────────────────────────────────────────────────────
let _audioCtx = null;
function getAudioContext() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === "suspended") _audioCtx.resume();
  return _audioCtx;
}

function playDeniedSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
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
  } catch (e) {}
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&family=Special+Elite&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:#0d0d0d;color:#f0ede8;min-height:100vh}

  /* Normal login */
  .login-root{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d0d0d}
  .login-card{display:flex;flex-direction:column;align-items:flex-start;padding:3rem 3.5rem;background:#111;border:1px solid #1e1e1e;border-radius:8px;width:100%;max-width:420px}
  .login-tag{font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:#c8b89a;margin-bottom:2rem;font-weight:400}
  .login-card h2{font-family:'DM Serif Display',serif;font-size:2rem;color:#f0ede8;margin-bottom:.4rem;line-height:1.2}
  .login-card .sub{font-size:.875rem;color:rgba(240,237,232,.4);margin-bottom:2.5rem;font-weight:300}
  .field-group{width:100%;margin-bottom:1.25rem}
  .field-group label{display:block;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(240,237,232,.5);margin-bottom:.6rem;font-weight:400}
  .field-group input{width:100%;padding:.9rem 1.1rem;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;color:#f0ede8;font-family:'DM Sans',sans-serif;font-size:.95rem;font-weight:300;outline:none;transition:border-color .2s}
  .field-group input:focus{border-color:#c8b89a}
  .field-group input::placeholder{color:rgba(240,237,232,.2)}
  .login-btn{width:100%;padding:.95rem;background:#c8b89a;border:none;border-radius:4px;color:#0d0d0d;font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:background .2s,transform .1s;margin-top:.25rem}
  .login-btn:hover{background:#d4c6ac}
  .login-btn:active{transform:scale(.99)}
  .hint{margin-top:1.25rem;font-size:.78rem;color:rgba(240,237,232,.2);font-weight:300}

  /* Drop */
  .dropping{animation:dropOut .7s cubic-bezier(.55,0,1,.45) forwards}
  @keyframes dropOut{0%{transform:translateY(0) rotate(0deg);opacity:1}60%{transform:translateY(60px) rotate(3deg);opacity:.6}100%{transform:translateY(120vh) rotate(8deg);opacity:0}}

  /* Scary login */
  .scary-root{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#060608;animation:scaryFadeIn 1s ease forwards}
  @keyframes scaryFadeIn{from{opacity:0}to{opacity:1}}
  .scary-card{display:flex;flex-direction:column;align-items:flex-start;padding:3rem 3.5rem;background:#0a0a0c;border:1px solid #3a0000;border-radius:4px;width:100%;max-width:420px;animation:scarySlideIn .8s cubic-bezier(.2,0,.3,1) forwards;box-shadow:0 0 60px rgba(180,0,0,.08)}
  @keyframes scarySlideIn{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
  .scary-tag{font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:#8b0000;margin-bottom:2rem;font-weight:400}
  .scary-card h2{font-family:'Special Elite',serif;font-size:1.9rem;color:#cc0000;margin-bottom:.5rem;line-height:1.2;text-shadow:0 0 20px rgba(200,0,0,.3)}
  .scary-card .sub{font-size:.875rem;color:rgba(200,50,50,.45);margin-bottom:2.5rem;font-weight:300}
  .scary-field{width:100%;margin-bottom:1.25rem}
  .scary-field label{display:block;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(200,50,50,.5);margin-bottom:.6rem;font-weight:400}
  .scary-field input{width:100%;padding:.9rem 1.1rem;background:#0f0005;border:1px solid #3a0000;border-radius:2px;color:#cc4444;font-family:'Special Elite',monospace;font-size:.95rem;outline:none;transition:border-color .2s,box-shadow .2s;caret-color:#cc0000}
  .scary-field input:focus{border-color:#8b0000;box-shadow:0 0 12px rgba(180,0,0,.2)}
  .scary-field input::placeholder{color:rgba(200,50,50,.15)}
  .scary-btn{width:100%;padding:.95rem;background:#1a0000;border:1px solid #5a0000;border-radius:2px;color:#cc0000;font-family:'Special Elite',serif;font-size:.85rem;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:background .2s;margin-top:.25rem}
  .scary-btn:hover{background:#2a0000}
  .scary-hint{margin-top:1.25rem;font-size:.75rem;color:rgba(200,50,50,.15);font-weight:300;font-family:'Special Elite',serif}

  /* Dialogs */
  .dialog-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;z-index:200;animation:fadeIn .15s ease}
  .dialog-box{background:#141414;border:1px solid #2e1a1a;border-radius:10px;padding:2.25rem 2.5rem;max-width:360px;width:90%;text-align:center;animation:popIn .2s ease}
  .dialog-icon{width:52px;height:52px;border-radius:50%;background:rgba(200,60,60,.12);border:1px solid rgba(200,60,60,.3);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem}
  .dialog-box h3{font-family:'DM Serif Display',serif;font-size:1.35rem;color:#f0ede8;margin-bottom:.6rem}
  .dialog-box p{font-size:.85rem;color:rgba(240,237,232,.45);font-weight:300;line-height:1.65;margin-bottom:1.75rem}
  .dialog-dismiss{padding:.6rem 2rem;background:transparent;border:1px solid #3a2020;border-radius:4px;color:#e07070;font-family:'DM Sans',sans-serif;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:background .2s}
  .dialog-dismiss:hover{background:rgba(200,60,60,.1)}
  .scary-dialog-box{background:#0a0005;border:1px solid #5a0000;border-radius:4px;padding:2.25rem 2.5rem;max-width:360px;width:90%;text-align:center;animation:popIn .2s ease;box-shadow:0 0 40px rgba(180,0,0,.15)}
  .scary-dialog-box h3{font-family:'Special Elite',serif;font-size:1.4rem;color:#cc0000;margin-bottom:.6rem}
  .scary-dialog-box p{font-size:.85rem;color:rgba(200,50,50,.5);font-weight:300;line-height:1.65;margin-bottom:1.75rem;font-family:'Special Elite',serif}
  .scary-dismiss{padding:.6rem 2rem;background:#1a0000;border:1px solid #5a0000;border-radius:2px;color:#cc0000;font-family:'Special Elite',serif;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}
  .scary-dismiss:hover{background:#2a0000}

  /* Game */
  .game-root{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#05050a;animation:scaryFadeIn .8s ease forwards}
  .game-card{display:flex;flex-direction:column;align-items:center;padding:3rem 3rem 2.5rem;background:#080810;border:1px solid #1a1a3a;border-radius:6px;width:100%;max-width:460px}
  .game-title{font-family:'Special Elite',serif;font-size:1.5rem;color:#8888cc;margin-bottom:.4rem;letter-spacing:.06em}
  .game-sub{font-size:.8rem;color:rgba(150,150,220,.4);margin-bottom:2rem;font-weight:300;text-align:center}
  .game-status{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(150,150,220,.5);margin-bottom:1.5rem;min-height:1.2rem;text-align:center}
  .game-status.wrong{color:#cc4444}
  .game-status.watching{color:#8888cc}
  .game-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:2rem}
  .game-btn{width:120px;height:120px;border-radius:6px;border:1px solid rgba(255,255,255,.08);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:2.2rem;opacity:.35;filter:brightness(.5);background:#0e0e1a;transition:transform .1s,filter .1s}
  .game-btn:hover:not(:disabled){opacity:.6}
  .game-btn.lit{opacity:1;filter:brightness(1.4);transform:scale(1.06)}
  .game-btn:disabled{cursor:default}
  .game-start-btn{padding:.85rem 2.5rem;background:#0e0e2a;border:1px solid #3a3a7a;border-radius:4px;color:#8888cc;font-family:'Special Elite',serif;font-size:.9rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}
  .game-start-btn:hover{background:#16163a}
  .game-round{font-size:.72rem;color:rgba(150,150,220,.3);letter-spacing:.12em;text-transform:uppercase;margin-top:1rem}
  .game-win-msg{font-family:'Special Elite',serif;font-size:1.1rem;color:#88ccaa;text-align:center;line-height:1.6;animation:fadeIn .5s ease}

  /* Gallery */
  .gallery-root{min-height:100vh;background:#0d0d0d}
  .gallery-header{display:flex;align-items:center;justify-content:space-between;padding:1.5rem 2.5rem;border-bottom:1px solid #1e1e1e}
  .gallery-header-left{display:flex;align-items:baseline;gap:1rem}
  .gallery-header-left h1{font-family:'DM Serif Display',serif;font-size:1.6rem;color:#f0ede8;line-height:1}
  .gallery-header-left span{font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:#c8b89a;font-weight:300}
  .welcome-pill{display:flex;align-items:center;gap:.75rem}
  .welcome-pill span{font-size:.82rem;color:rgba(240,237,232,.4);font-weight:300}
  .logout-btn{padding:.45rem 1rem;background:transparent;border:1px solid #2a2a2a;border-radius:3px;color:rgba(240,237,232,.5);font-family:'DM Sans',sans-serif;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:border-color .2s,color .2s}
  .logout-btn:hover{border-color:#c8b89a;color:#c8b89a}

  /* Tab bar */
  .tab-bar{display:flex;gap:0;border-bottom:1px solid #1a1a1a}
  .tab-btn{padding:1rem 2rem;background:transparent;border:none;border-bottom:2px solid transparent;color:rgba(240,237,232,.4);font-family:'DM Sans',sans-serif;font-size:.82rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .2s;margin-bottom:-1px}
  .tab-btn.active{color:#c8b89a;border-bottom-color:#c8b89a}
  .tab-btn:hover{color:rgba(240,237,232,.7)}

  /* Filter bar */
  .filter-bar{display:flex;align-items:center;gap:.5rem;padding:1.25rem 2.5rem;border-bottom:1px solid #1a1a1a}
  .filter-btn{padding:.35rem .9rem;background:transparent;border:1px solid #232323;border-radius:100px;color:rgba(240,237,232,.4);font-family:'DM Sans',sans-serif;font-size:.78rem;cursor:pointer;transition:all .15s;font-weight:300}
  .filter-btn:hover{border-color:#3a3a3a;color:rgba(240,237,232,.7)}
  .filter-btn.active{background:#c8b89a;border-color:#c8b89a;color:#0d0d0d;font-weight:500}

  /* Upload strip */
  .upload-strip{padding:1.25rem 2.5rem;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
  .upload-label{padding:.5rem 1.25rem;background:transparent;border:1px solid #2a2a2a;border-radius:4px;color:rgba(240,237,232,.5);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:border-color .2s,color .2s;white-space:nowrap}
  .upload-label:hover{border-color:#c8b89a;color:#c8b89a}
  .upload-input{display:none}
  .upload-title-input{flex:1;min-width:140px;padding:.5rem .85rem;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;color:#f0ede8;font-family:'DM Sans',sans-serif;font-size:.85rem;outline:none;transition:border-color .2s}
  .upload-title-input:focus{border-color:#c8b89a}
  .upload-title-input::placeholder{color:rgba(240,237,232,.2)}
  .upload-submit-btn{padding:.5rem 1.25rem;background:#c8b89a;border:none;border-radius:4px;color:#0d0d0d;font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:background .2s;white-space:nowrap}
  .upload-submit-btn:hover{background:#d4c6ac}
  .upload-submit-btn:disabled{opacity:.4;cursor:default}
  .upload-progress{font-size:.75rem;color:#c8b89a;font-weight:300}
  .upload-preview{width:48px;height:48px;object-fit:cover;border-radius:3px;border:1px solid #2a2a2a}

  /* Gallery grid */
  .gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:2px}
  .gallery-item{position:relative;aspect-ratio:3/2;overflow:hidden;background:#1a1a1a;cursor:pointer}
  .gallery-item img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease,filter .3s;filter:saturate(.85)}
  .gallery-item:hover img{transform:scale(1.04);filter:saturate(1.1)}
  .gallery-item-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(13,13,13,.85) 0%,transparent 50%);opacity:0;transition:opacity .3s;display:flex;flex-direction:column;justify-content:flex-end;padding:1.25rem}
  .gallery-item:hover .gallery-item-overlay{opacity:1}
  .gallery-item-overlay h3{font-family:'DM Serif Display',serif;font-size:1.1rem;color:#f0ede8;margin-bottom:.2rem}
  .gallery-item-overlay p{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:#c8b89a;font-weight:300}

  /* Lightbox */
  .lightbox{position:fixed;inset:0;background:rgba(13,13,13,.96);display:flex;align-items:center;justify-content:center;z-index:100;animation:fadeIn .2s ease}
  .lightbox-inner{position:relative;max-width:85vw;max-height:85vh;display:flex;flex-direction:column;align-items:center;gap:1rem}
  .lightbox-inner img{max-width:100%;max-height:75vh;object-fit:contain;border-radius:2px}
  .lightbox-meta h3{font-family:'DM Serif Display',serif;font-size:1.2rem;color:#f0ede8;text-align:center}
  .lightbox-meta p{font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#c8b89a;text-align:center;margin-top:.25rem;font-weight:300}
  .lightbox-close{position:fixed;top:1.5rem;right:2rem;background:none;border:none;color:rgba(240,237,232,.5);font-size:1.5rem;cursor:pointer;transition:color .2s;line-height:1}
  .lightbox-close:hover{color:#f0ede8}

  /* Comment wall */
  .comments-root{padding:2rem 2.5rem;max-width:720px}
  .comments-title{font-family:'DM Serif Display',serif;font-size:1.4rem;color:#f0ede8;margin-bottom:1.75rem}
  .comment-form{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2.5rem;padding:1.5rem;background:#111;border:1px solid #1e1e1e;border-radius:8px}
  .comment-input{width:100%;padding:.75rem 1rem;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;color:#f0ede8;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:300;outline:none;transition:border-color .2s;resize:none}
  .comment-input:focus{border-color:#c8b89a}
  .comment-input::placeholder{color:rgba(240,237,232,.2)}
  .comment-submit{align-self:flex-end;padding:.55rem 1.5rem;background:#c8b89a;border:none;border-radius:4px;color:#0d0d0d;font-family:'DM Sans',sans-serif;font-size:.8rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:background .2s}
  .comment-submit:hover{background:#d4c6ac}
  .comment-submit:disabled{opacity:.4;cursor:default}
  .comment-list{display:flex;flex-direction:column;gap:1rem}
  .comment-item{padding:1rem 1.25rem;background:#111;border:1px solid #1e1e1e;border-radius:6px}
  .comment-header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:.5rem}
  .comment-author{font-size:.82rem;font-weight:500;color:#c8b89a}
  .comment-time{font-size:.72rem;color:rgba(240,237,232,.25);font-weight:300}
  .comment-body{font-size:.88rem;color:rgba(240,237,232,.7);font-weight:300;line-height:1.6}
  .comments-empty{font-size:.85rem;color:rgba(240,237,232,.25);font-weight:300;font-style:italic}

  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
  @keyframes flicker{0%,100%{opacity:1}45%{opacity:.85}50%{opacity:.6}55%{opacity:.9}}

  /* Splash screen */
  .splash-root{position:fixed;inset:0;background:#0d0d0d;display:flex;align-items:center;justify-content:center;z-index:999;animation:splashFadeOut .4s ease 1.7s forwards}
  @keyframes splashFadeOut{from{opacity:1}to{opacity:0;pointer-events:none}}
  .splash-star{animation:splashPulse 1s ease-in-out infinite}
  @keyframes splashPulse{
    0%{transform:scale(1);opacity:.5}
    50%{transform:scale(1.18);opacity:1}
    100%{transform:scale(1);opacity:.5}
  }
`;

function playSquirtSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Squirt: rapid pitch-swept noise burst with a wet, bubbly character
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.35, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.25);
    filter.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.5, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    noise.connect(filter); filter.connect(g); g.connect(ctx.destination);
    noise.start(now); noise.stop(now + 0.35);

    // Secondary wet "blip" for extra squirtiness
    const osc = ctx.createOscillator(), og = ctx.createGain();
    osc.connect(og); og.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
    og.gain.setValueAtTime(0.3, now);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now); osc.stop(now + 0.22);
  } catch (e) {}
}

// ─── Splash Screen ────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  useEffect(() => {
    playSquirtSound();
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="splash-root">
      <style>{styles}</style>
      <svg className="splash-star" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M60 4 C60 4 63 40 80 60 C63 80 60 116 60 116 C60 116 57 80 40 60 C57 40 60 4 60 4Z"
          fill="#c8b89a"
        />
        <path
          d="M4 60 C4 60 40 57 60 40 C80 57 116 60 116 60 C116 60 80 63 60 80 C40 63 4 60 4 60Z"
          fill="#c8b89a"
        />
      </svg>
    </div>
  );
}

// ─── Dialogs ──────────────────────────────────────────────────────────────────
function AccessDeniedDialog({ onDismiss }) {
  return (
    <div className="dialog-backdrop" onClick={onDismiss}>
      <div className="dialog-box" onClick={e => e.stopPropagation()}>
        <div className="dialog-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#e07070" strokeWidth="1.5"/><path d="M12 7v6M12 16.5v.5" stroke="#e07070" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <h3>Access Denied</h3>
        <p>Your credentials could not be verified. Please check your username and try again.</p>
        <button className="dialog-dismiss" onClick={onDismiss}>Dismiss</button>
      </div>
    </div>
  );
}

// ─── Comment Wall ─────────────────────────────────────────────────────────────
function CommentWall({ username }) {
  const [comments, setComments] = useState([]);
  const [text, setText]         = useState("");
  const [posting, setPosting]   = useState(false);

  useEffect(() => {
    const q = query(collection(db, "comments"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, "comments"), {
        author: username,
        body: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (e) { console.error(e); }
    setPosting(false);
  };

  const fmt = (ts) => {
    if (!ts) return "";
    const d = ts.toDate();
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " +
           d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="comments-root">
      <style>{styles}</style>
      <div className="comments-title">Comment Wall</div>
      <div className="comment-form">
        <textarea
          className="comment-input"
          rows={3}
          placeholder="Say something..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button className="comment-submit" onClick={handlePost} disabled={posting || !text.trim()}>
          {posting ? "Posting..." : "Post"}
        </button>
      </div>
      <div className="comment-list">
        {comments.length === 0 && <p className="comments-empty">No comments yet. Be the first.</p>}
        {comments.map(c => (
          <div key={c.id} className="comment-item">
            <div className="comment-header">
              <span className="comment-author">{c.author}</span>
              <span className="comment-time">{fmt(c.createdAt)}</span>
            </div>
            <div className="comment-body">{c.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Gallery Page ─────────────────────────────────────────────────────────────
function GalleryPage({ username, onLogout }) {
  const [tab, setTab]           = useState("gallery");
  const [filter, setFilter]     = useState("All");
  const [lightbox, setLightbox] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [progress, setProgress] = useState(null);
  const fileRef = useRef();

  // Listen for uploaded images in Firestore
  useEffect(() => {
    const q = query(collection(db, "images"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q,
      snap => {
        console.log("Images snapshot:", snap.docs.length, "docs");
        setUploadedImages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      err => console.error("Images snapshot error:", err)
    );
    return unsub;
  }, []);

  const allImages = [...STATIC_IMAGES, ...uploadedImages];
  const categories = ["All", "High IQ", "MAXX IQ", "Community"];
  const filtered = filter === "All" ? allImages : allImages.filter(i => i.category === filter);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    console.log("Starting upload...");
    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    task.on("state_changed",
      snap => {
        const pct = Math.round(snap.bytesTransferred / snap.totalBytes * 100);
        console.log("Upload progress:", pct + "%");
        setProgress(pct);
      },
      err => {
        console.error("Storage error:", err);
        setProgress(null);
      },
      async () => {
        console.log("Upload complete, getting download URL...");
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          console.log("Download URL:", url);
          await addDoc(collection(db, "images"), {
            src: url,
            title: uploadTitle.trim() || "Untitled",
            category: "Community",
            uploadedBy: username,
            createdAt: serverTimestamp(),
          });
          console.log("Firestore doc written successfully!");
          setFile(null); setPreview(null); setUploadTitle(""); setProgress(null);
          if (fileRef.current) fileRef.current.value = "";
        } catch (e) {
          console.error("Firestore write error:", e);
        }
      }
    );
  };

  return (
    <div className="gallery-root">
      <style>{styles}</style>
      <header className="gallery-header">
        <div className="gallery-header-left">
          <h1>Gallery</h1>
          <span>— {filtered.length} photos</span>
        </div>
        <div className="welcome-pill">
          <span>Signed in as <strong style={{ color:"#c8b89a", fontWeight:400 }}>{username}</strong></span>
          <button className="logout-btn" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <div className="tab-bar">
        <button className={`tab-btn${tab==="gallery"?" active":""}`} onClick={() => setTab("gallery")}>Gallery</button>
        <button className={`tab-btn${tab==="comments"?" active":""}`} onClick={() => setTab("comments")}>Comments</button>
      </div>

      {tab === "gallery" && (
        <>
          <div className="filter-bar">
            {categories.map(cat => (
              <button key={cat} className={`filter-btn${filter===cat?" active":""}`} onClick={() => setFilter(cat)}>{cat}</button>
            ))}
          </div>

          <div className="upload-strip">
            <label className="upload-label">
              Choose Photo
              <input ref={fileRef} type="file" accept="image/*" className="upload-input" onChange={handleFileChange} />
            </label>
            {preview && <img src={preview} className="upload-preview" alt="preview" />}
            <input
              type="text" className="upload-title-input"
              placeholder="Give it a title..."
              value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
            />
            <button className="upload-submit-btn" onClick={handleUpload} disabled={!file || progress !== null}>
              {progress !== null ? `${progress}%` : "Upload"}
            </button>
            {progress !== null && <span className="upload-progress">Uploading...</span>}
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
        </>
      )}

      {tab === "comments" && <CommentWall username={username} />}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.title} />
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

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername]     = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [shaking, setShaking]       = useState(false);

  const handleLogin = useCallback(() => {
    if (!username.trim()) {
      playDeniedSound();
      setShaking(true); setTimeout(() => setShaking(false), 500);
      setTimeout(() => setShowDialog(true), 150);
      return;
    }
    onLogin(username);
  }, [username, onLogin]);

  return (
    <div className="login-root">
      <style>{styles}</style>
      <div className="login-card">
        <div className="login-tag">Member Access</div>
        <h2>Welcome</h2>
        <p className="sub">Sign in to continue.</p>
        <div className="field-group">
          <input type="text" placeholder="Username" value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleLogin()}
            style={shaking ? {animation:"shake 0.4s ease"} : {}} />
        </div>
        <button className="login-btn" onClick={handleLogin}>Enter</button>
      </div>
      {showDialog && <AccessDeniedDialog onDismiss={() => setShowDialog(false)} />}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [showSplash, setShowSplash] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  useEffect(() => {
    const unlock = () => {
      if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      _audioCtx.resume().then(() => {
        document.removeEventListener("touchstart", unlock);
        document.removeEventListener("touchend", unlock);
      });
    };
    document.addEventListener("touchstart", unlock);
    document.addEventListener("touchend", unlock);
    return () => {
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("touchend", unlock);
    };
  }, []);

  const handleLogin = (username) => {
    setPendingUser(username);
    setShowSplash(true);
  };

  const handleSplashDone = () => {
    setShowSplash(false);
    setUser(pendingUser);
  };

  if (showSplash) return <SplashScreen onDone={handleSplashDone} />;
  if (!user) return <LoginPage onLogin={handleLogin} />;
  return <GalleryPage username={user} onLogout={() => setUser(null)} />;
}
