'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

/* Spinosaurus easter egg — flat geometric style like the Chrome dino.
   Sometimes walks on land with grass, sometimes swims through water.
   Appears at random 12-40s intervals. */

type Mode = 'walk' | 'swim';

/* ── Flat-style bipedal Spinosaurus (land) ── */
function SpinoWalk() {
  return (
    <svg width="80" height="70" viewBox="0 0 80 70" fill="none">
      {/* tail */}
      <polygon points="22,30 4,20 6,26 18,34" fill="#34d399" />
      <polygon points="18,34 6,26 2,30 14,36" fill="#059669" />
      {/* body */}
      <polygon points="22,24 42,18 48,22 48,38 40,42 22,40" fill="#059669" />
      {/* belly */}
      <polygon points="26,38 40,42 48,38 48,34 38,36 26,36" fill="#a5b4fc" />
      {/* sail */}
      <polygon points="24,24 28,4 34,2 38,4 42,18 36,20 30,20" fill="#34d399" />
      <polygon points="28,18 30,8 34,6 36,8 38,18" fill="#a5b4fc" opacity="0.5" />
      {/* neck */}
      <polygon points="48,22 56,12 60,14 52,26 48,26" fill="#059669" />
      {/* head */}
      <polygon points="56,8 70,6 72,10 70,14 60,16 56,14" fill="#059669" />
      {/* lower jaw */}
      <polygon points="60,14 72,12 74,14 70,16 60,16" fill="#7c3aed" />
      {/* eye */}
      <circle cx="64" cy="9" r="2.5" fill="white" />
      <circle cx="64.8" cy="8.6" r="1.3" fill="#1e1b4b" />
      {/* nostril */}
      <circle cx="70" cy="8" r="0.8" fill="#047857" />
      {/* mouth line */}
      <line x1="62" y1="14" x2="72" y2="13" stroke="#047857" strokeWidth="0.8" />
      {/* tiny arms */}
      <polygon points="46,28 50,34 48,36 44,32" fill="#047857" />
      <polygon points="48,36 52,38 50,40 46,38" fill="#047857" />
      {/* RIGHT LEG (front stride) */}
      <g className="spino-leg-right">
        {/* thigh */}
        <polygon points="38,38 42,40 44,54 38,52" fill="#047857" />
        {/* shin */}
        <polygon points="38,52 44,54 48,62 42,60" fill="#047857" />
        {/* foot */}
        <polygon points="42,60 48,62 54,64 48,66 40,64" fill="#34d399" />
      </g>
      {/* LEFT LEG (back stride) */}
      <g className="spino-leg-left">
        {/* thigh */}
        <polygon points="26,38 30,40 28,54 24,52" fill="#4338ca" />
        {/* shin */}
        <polygon points="24,52 28,54 24,62 20,60" fill="#4338ca" />
        {/* foot */}
        <polygon points="20,60 24,62 28,64 22,66 16,64" fill="#059669" />
      </g>
    </svg>
  );
}

/* ── Flat-style swimming Spinosaurus ── */
function SpinoSwim() {
  return (
    <svg width="86" height="48" viewBox="0 0 86 48" fill="none">
      {/* tail */}
      <polygon points="14,24 2,18 4,22 12,28" fill="#34d399" />
      <polygon points="12,28 4,22 2,26 10,30" fill="#059669" />
      {/* body — horizontal */}
      <polygon points="14,20 48,16 52,20 52,32 44,36 14,34" fill="#059669" />
      {/* belly */}
      <polygon points="18,32 44,36 52,32 52,28 42,30 18,30" fill="#a5b4fc" />
      {/* sail — sticking up */}
      <polygon points="18,20 22,2 28,0 34,2 40,16 34,18 24,18" fill="#34d399" />
      <polygon points="22,14 26,4 30,3 32,5 36,14" fill="#a5b4fc" opacity="0.5" />
      {/* neck — more horizontal */}
      <polygon points="52,20 62,14 66,16 56,24 52,24" fill="#059669" />
      {/* head */}
      <polygon points="62,10 76,8 78,12 76,16 66,18 62,16" fill="#059669" />
      <polygon points="66,16 78,14 80,16 76,18 66,18" fill="#7c3aed" />
      {/* eye */}
      <circle cx="70" cy="11" r="2.2" fill="white" />
      <circle cx="70.7" cy="10.6" r="1.1" fill="#1e1b4b" />
      <circle cx="76" cy="10" r="0.7" fill="#047857" />
      <line x1="68" y1="16" x2="78" y2="15" stroke="#047857" strokeWidth="0.8" />
      {/* paddle legs peeking below body */}
      <g className="spino-paddle-r">
        <polygon points="40,34 44,36 46,42 40,40" fill="#047857" />
      </g>
      <g className="spino-paddle-l">
        <polygon points="24,34 28,36 26,42 22,40" fill="#4338ca" />
      </g>
    </svg>
  );
}

/* ── Scrolling ground with grass ── */
function GrassScenery() {
  return (
    <div className="spino-scenery">
      <svg width="100%" height="20" viewBox="0 0 450 20" preserveAspectRatio="none" fill="none">
        <line x1="0" y1="6" x2="450" y2="6" stroke="#d1d5db" strokeWidth="1.5" />
        {[8,28,52,70,95,115,140,162,188,210,235,258,282,305,330,352,378,400,425].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="6" x2={x-2} y2={1-(i%3)} stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" />
            <line x1={x+2} y1="6" x2={x+4} y2={2-(i%2)} stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
            <line x1={x+1} y1="6" x2={x+1} y2={0-(i%3)} stroke="#22c55e" strokeWidth="1" strokeLinecap="round" />
          </g>
        ))}
        <circle cx="45" cy="8" r="1" fill="#d1d5db" />
        <circle cx="130" cy="8.5" r="0.8" fill="#d1d5db" />
        <circle cx="220" cy="8" r="1.2" fill="#d1d5db" />
        <circle cx="340" cy="8.5" r="0.7" fill="#d1d5db" />
      </svg>
    </div>
  );
}

/* ── Scrolling water with waves ── */
function WaterScenery() {
  return (
    <div className="spino-scenery">
      <svg width="100%" height="24" viewBox="0 0 450 24" preserveAspectRatio="none" fill="none">
        <rect x="0" y="6" width="450" height="18" fill="#bfdbfe" opacity="0.4" />
        <path d="M0 8 Q12 4 24 8 Q36 12 48 8 Q60 4 72 8 Q84 12 96 8 Q108 4 120 8 Q132 12 144 8 Q156 4 168 8 Q180 12 192 8 Q204 4 216 8 Q228 12 240 8 Q252 4 264 8 Q276 12 288 8 Q300 4 312 8 Q324 12 336 8 Q348 4 360 8 Q372 12 384 8 Q396 4 408 8 Q420 12 432 8 Q444 4 450 8" stroke="#60a5fa" strokeWidth="1.5" fill="none" />
        <path d="M0 14 Q15 11 30 14 Q45 17 60 14 Q75 11 90 14 Q105 17 120 14 Q135 11 150 14 Q165 17 180 14 Q195 11 210 14 Q225 17 240 14 Q255 11 270 14 Q285 17 300 14 Q315 11 330 14 Q345 17 360 14 Q375 11 390 14 Q405 17 420 14 Q435 11 450 14" stroke="#93c5fd" strokeWidth="1" fill="none" />
        <circle cx="35" cy="7" r="0.8" fill="white" opacity="0.7" />
        <circle cx="110" cy="9" r="0.6" fill="white" opacity="0.5" />
        <circle cx="200" cy="6" r="0.8" fill="white" opacity="0.7" />
        <circle cx="290" cy="8" r="0.6" fill="white" opacity="0.5" />
        <circle cx="380" cy="7" r="0.7" fill="white" opacity="0.6" />
      </svg>
    </div>
  );
}

export default function WalkingSpino() {
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState<Mode>('walk');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const scheduleNext = useCallback(() => {
    const delay = 12000 + Math.random() * 28000;
    timerRef.current = setTimeout(() => {
      setMode(Math.random() < 0.35 ? 'swim' : 'walk');
      setActive(true);
    }, delay);
  }, []);

  useEffect(() => {
    scheduleNext();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [scheduleNext]);

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    // Only react to the crossing animation finishing, not child animations
    if (e.animationName === 'spino-cross') {
      setActive(false);
      scheduleNext();
    }
  };

  if (!active) return null;

  const isSwim = mode === 'swim';

  return (
    <div
      className="spino-scene"
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: isSwim ? 56 : 90, pointerEvents: 'none' }}
    >
      {/* scenery at the very bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '200%' }}>
        {isSwim ? <WaterScenery /> : <GrassScenery />}
      </div>
      {/* dino crossing */}
      <div
        className="spino-cross"
        onAnimationEnd={handleAnimationEnd}
        style={{ position: 'absolute', bottom: isSwim ? 6 : 14, left: 0 }}
      >
        <div className={isSwim ? 'spino-swim-bob' : 'spino-walk-bounce'}>
          {isSwim ? <SpinoSwim /> : <SpinoWalk />}
        </div>
      </div>
    </div>
  );
}
