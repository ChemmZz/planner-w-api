'use client';

/**
 * Conservatory scene — progressively grows based on accumulated work minutes.
 * 150-minute timeline: barren soil → rain → grass → rain → pond → garden.
 *
 * Thresholds (minutes):
 *   0   — barren brown soil, sky, dusty stone path
 *   5   — first rain starts, ground transitions brown → green
 *  12   — grass established, rain stops
 *  15   — second rain starts, pond begins filling
 *  22   — pond complete, rain stops
 *  25   — construction crane arrives
 *  28   — greenhouse frame being built
 *  34   — crane fades, greenhouse complete
 *  36   — first sprout
 *  42   — small fern
 *  50   — pink flower
 *  58   — yellow flower + lily pads
 *  68   — bush + bird on roof
 *  80   — palm tree + bunny by pond
 *  95   — purple & orange flowers + butterfly
 * 115   — fern cluster + fish ripple
 * 135   — flying bird + golden butterfly + tall grass
 * 150   — couple having a picnic with cucumber, carrots & Tajín
 *
 * Reset → meteorite destroys everything back to barren soil.
 */

import { type AnimationEvent } from 'react';

interface Props {
  workMinutes: number;
  isResetting: boolean;
  onResetComplete: () => void;
}

/* ── Color interpolation helper ── */
function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  };
  const clamped = Math.max(0, Math.min(1, t));
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(ar + (br - ar) * clamped);
  const g = Math.round(ag + (bg - ag) * clamped);
  const bl = Math.round(ab + (bb - ab) * clamped);
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
}

/* ── Rain drops — staggered positions and delays ── */
const RAIN_DROPS = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 19 + 7) % 400,
  delay: ((i * 0.13 + i * i * 0.017) % 1).toFixed(2),
  duration: (0.8 + (i % 5) * 0.12).toFixed(2),
  length: 8 + (i % 4) * 2,
}));

export default function ConservatoryScene({ workMinutes, isResetting, onResetComplete }: Props) {
  const m = workMinutes;

  /* ── Ground color transition: brown → green during first rain (5–12 min) ── */
  const grassProgress = m < 5 ? 0 : m >= 12 ? 1 : (m - 5) / 7;
  const groundPrimary = lerpColor('#b45309', '#86efac', grassProgress);
  const groundSecondary = lerpColor('#92400e', '#4ade80', grassProgress);
  const groundShadow = lerpColor('#78350f', '#d1d5db', grassProgress);
  const stoneTint = lerpColor('#a8a29e', '#d1d5db', grassProgress);

  /* ── Pond: fades in during second rain (15–22 min) ── */
  const pondOpacity = m < 15 ? 0 : Math.min((m - 15) / 7, 1);

  /* ── Rain intensity: ramps up, peaks, tapers ── */
  const rain1Opacity = m < 5 ? 0 : m < 7 ? (m - 5) / 2 : m < 10 ? 1 : m < 12 ? 1 - (m - 10) / 2 : 0;
  const rain2Opacity = m < 15 ? 0 : m < 17 ? (m - 15) / 2 : m < 20 ? 1 : m < 22 ? 1 - (m - 20) / 2 : 0;

  /* ── Crane & greenhouse ── */
  const craneOpacity = m < 25 ? 0 : m < 27 ? (m - 25) / 2 : m < 32 ? 1 : m < 34 ? 1 - (m - 32) / 2 : 0;
  const greenhouseOpacity = m < 28 ? 0 : Math.min((m - 28) / 4, 1);

  function handleAnimationEnd(e: AnimationEvent) {
    if (e.animationName === 'dust-cover') {
      onResetComplete();
    }
  }

  return (
    <svg
      viewBox="0 0 400 260"
      className="w-full max-w-md"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Defs */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#eff6ff" />
        </linearGradient>
        <linearGradient id="pond-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Background — always visible */}
      <rect width="400" height="260" fill="url(#sky)" rx="16" />

      {/* Ground — transitions brown → green */}
      <ellipse cx="200" cy="255" rx="210" ry="40" fill={groundShadow} opacity="0.3" />
      <rect x="0" y="220" width="400" height="40" fill={groundPrimary} opacity="0.3" />
      <rect x="0" y="230" width="400" height="30" fill={groundSecondary} opacity="0.2" />

      {/* Stone path */}
      <ellipse cx="200" cy="245" rx="30" ry="6" fill={stoneTint} opacity="0.5" />
      <ellipse cx="220" cy="250" rx="20" ry="5" fill={stoneTint} opacity="0.4" />
      <ellipse cx="180" cy="250" rx="18" ry="4" fill={stoneTint} opacity="0.4" />

      {/* Pond — fades in during second rain (15–22 min) */}
      {pondOpacity > 0 && (
        <g opacity={pondOpacity}>
          <ellipse cx="290" cy="235" rx="55" ry="18" fill="url(#pond-grad)" opacity="0.5" />
          <ellipse cx="290" cy="233" rx="45" ry="13" fill="#93c5fd" opacity="0.3" />
        </g>
      )}

      {/* === RAIN (first: 5–12 min, second: 15–22 min) === */}
      {!isResetting && rain1Opacity > 0 && (
        <g opacity={rain1Opacity}>
          {RAIN_DROPS.map((d, i) => (
            <line
              key={`r1-${i}`}
              x1={d.x} y1={0} x2={d.x} y2={d.length}
              stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round"
              className="rain-drop"
              style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.duration}s` }}
            />
          ))}
        </g>
      )}
      {!isResetting && rain2Opacity > 0 && (
        <g opacity={rain2Opacity}>
          {RAIN_DROPS.map((d, i) => (
            <line
              key={`r2-${i}`}
              x1={(d.x + 11) % 400} y1={0} x2={(d.x + 11) % 400} y2={d.length}
              stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round"
              className="rain-drop"
              style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.duration}s` }}
            />
          ))}
        </g>
      )}

      {/* === CONSTRUCTION CRANE (25–34 min) === */}
      {craneOpacity > 0 && (
        <g opacity={craneOpacity}>
          <rect x="355" y="60" width="4" height="165" fill="#f59e0b" rx="1" />
          {[80, 110, 140, 170, 200].map((y) => (
            <g key={y}>
              <line x1="355" y1={y} x2="359" y2={y - 15} stroke="#d97706" strokeWidth="0.7" />
              <line x1="359" y1={y} x2="355" y2={y - 15} stroke="#d97706" strokeWidth="0.7" />
            </g>
          ))}
          <rect x="280" y="58" width="79" height="3" fill="#f59e0b" rx="1" />
          <rect x="359" y="58" width="30" height="3" fill="#f59e0b" rx="1" />
          <rect x="382" y="55" width="10" height="10" fill="#6b7280" rx="1" />
          <line x1="310" y1="61" x2="310" y2={m < 28 ? 130 : 105} stroke="#374151" strokeWidth="0.8" />
          <circle cx="310" cy={m < 28 ? 133 : 108} r="2.5" fill="none" stroke="#374151" strokeWidth="1" />
          {m < 32 && (
            <rect x="303" y={m < 28 ? 136 : 111} width="14" height="3" fill="#9ca3af" rx="0.5" />
          )}
          <rect x="353" y="62" width="8" height="10" fill="#fbbf24" rx="1" />
          <rect x="354" y="63" width="3" height="4" fill="#fef3c7" rx="0.5" />
        </g>
      )}

      {/* === GREENHOUSE (builds from 28 min) === */}
      {greenhouseOpacity > 0 && (
        <g opacity={greenhouseOpacity}>
          <path
            d="M 100 220 L 100 120 Q 200 70 300 120 L 300 220"
            fill="url(#glass)" stroke="#93c5fd" strokeWidth="1.5" opacity="0.6"
          />
          <line x1="150" y1="220" x2="150" y2="97" stroke="#93c5fd" strokeWidth="0.8" opacity="0.4" />
          <line x1="200" y1="220" x2="200" y2="82" stroke="#93c5fd" strokeWidth="0.8" opacity="0.4" />
          <line x1="250" y1="220" x2="250" y2="97" stroke="#93c5fd" strokeWidth="0.8" opacity="0.4" />
          <path d="M 100 170 Q 200 150 300 170" fill="none" stroke="#93c5fd" strokeWidth="0.8" opacity="0.3" />
          <rect x="188" y="205" width="24" height="30" rx="2" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.5" />
          <line x1="200" y1="205" x2="200" y2="235" stroke="#93c5fd" strokeWidth="0.5" opacity="0.4" />
        </g>
      )}

      {/* === PROGRESSIVE GARDEN ELEMENTS === */}

      {/* 36 min: first sprout */}
      {m >= 36 && (
        <g opacity={Math.min((m - 36) / 3, 1)}>
          <line x1="160" y1="225" x2="160" y2="210" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="157" cy="210" rx="4" ry="6" fill="#4ade80" transform="rotate(-20 157 210)" />
          <ellipse cx="163" cy="212" rx="4" ry="5" fill="#22c55e" transform="rotate(15 163 212)" />
        </g>
      )}

      {/* 42 min: small fern */}
      {m >= 42 && (
        <g opacity={Math.min((m - 42) / 4, 1)}>
          <line x1="200" y1="225" x2="200" y2="195" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
          {[-30, -15, 0, 15, 30].map((angle, i) => (
            <ellipse
              key={i} cx="200" cy={200 + i * 2} rx="3" ry="8" fill="#22c55e"
              transform={`rotate(${angle} 200 ${200 + i * 2})`} opacity={0.7 + i * 0.05}
            />
          ))}
        </g>
      )}

      {/* 50 min: pink flower */}
      {m >= 50 && (
        <g opacity={Math.min((m - 50) / 4, 1)}>
          <line x1="140" y1="225" x2="140" y2="200" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse key={angle} cx="140" cy="195" rx="4" ry="7" fill="#f472b6"
              transform={`rotate(${angle} 140 195)`} opacity="0.8" />
          ))}
          <circle cx="140" cy="195" r="3" fill="#fbbf24" />
        </g>
      )}

      {/* 58 min: yellow flower + lily pads */}
      {m >= 58 && (
        <g opacity={Math.min((m - 58) / 4, 1)}>
          <line x1="240" y1="225" x2="240" y2="198" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse key={angle} cx="240" cy="193" rx="3" ry="6" fill="#fbbf24"
              transform={`rotate(${angle} 240 193)`} opacity="0.85" />
          ))}
          <circle cx="240" cy="193" r="2.5" fill="#f97316" />
          <ellipse cx="275" cy="232" rx="8" ry="4" fill="#4ade80" opacity="0.6" />
          <ellipse cx="305" cy="230" rx="7" ry="3.5" fill="#22c55e" opacity="0.5" />
        </g>
      )}

      {/* 68 min: bush + bird on roof */}
      {m >= 68 && greenhouseOpacity > 0 && (
        <g opacity={Math.min((m - 68) / 5, 1)}>
          <ellipse cx="115" cy="222" rx="16" ry="10" fill="#22c55e" opacity="0.7" />
          <ellipse cx="110" cy="218" rx="11" ry="9" fill="#4ade80" opacity="0.6" />
          <ellipse cx="122" cy="219" rx="9" ry="7" fill="#16a34a" opacity="0.6" />
          <g transform="translate(200, 78)">
            <ellipse cx="0" cy="0" rx="5" ry="3.5" fill="#6b7280" />
            <circle cx="5" cy="-1.5" r="2.5" fill="#6b7280" />
            <circle cx="6" cy="-2" r="0.8" fill="white" />
            <circle cx="6.3" cy="-2" r="0.4" fill="#1f2937" />
            <polygon points="8,-2 10,-1.5 8,-1" fill="#f59e0b" />
            <polygon points="-5,0 -9,-2 -5,1" fill="#9ca3af" />
          </g>
        </g>
      )}

      {/* 80 min: palm tree + bunny */}
      {m >= 80 && (
        <g opacity={Math.min((m - 80) / 5, 1)}>
          <line x1="280" y1="225" x2="278" y2="165" stroke="#854d0e" strokeWidth="3" strokeLinecap="round" />
          {[-50, -25, 0, 25, 50].map((angle) => (
            <ellipse key={angle} cx="278" cy="167" rx="5" ry="20" fill="#22c55e"
              transform={`rotate(${angle} 278 167)`} opacity="0.7" />
          ))}
          <g transform="translate(255, 238)">
            <ellipse cx="0" cy="0" rx="6" ry="5" fill="#e5e7eb" />
            <circle cx="5" cy="-3" r="4" fill="#e5e7eb" />
            <ellipse cx="3" cy="-9" rx="2" ry="5" fill="#e5e7eb" />
            <ellipse cx="3.5" cy="-9" rx="1" ry="4" fill="#fecaca" opacity="0.5" />
            <ellipse cx="7" cy="-9" rx="2" ry="5" fill="#e5e7eb" />
            <ellipse cx="7.5" cy="-9" rx="1" ry="4" fill="#fecaca" opacity="0.5" />
            <circle cx="7" cy="-3.5" r="0.8" fill="#1f2937" />
            <circle cx="9" cy="-2.5" r="0.5" fill="#f9a8d4" />
            <circle cx="-6" cy="-1" r="2" fill="white" />
          </g>
        </g>
      )}

      {/* 95 min: more flowers + butterfly */}
      {m >= 95 && (
        <g opacity={Math.min((m - 95) / 5, 1)}>
          <line x1="175" y1="225" x2="175" y2="190" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse key={angle} cx="175" cy="186" rx="3.5" ry="6" fill="#a78bfa"
              transform={`rotate(${angle} 175 186)`} opacity="0.8" />
          ))}
          <circle cx="175" cy="186" r="2.5" fill="#fbbf24" />
          <line x1="220" y1="225" x2="220" y2="195" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse key={angle} cx="220" cy="191" rx="3" ry="5.5" fill="#fb923c"
              transform={`rotate(${angle} 220 191)`} opacity="0.8" />
          ))}
          <g transform="translate(190, 140)">
            <ellipse cx="-6" cy="0" rx="5" ry="7" fill="#c084fc" opacity="0.7" />
            <ellipse cx="6" cy="0" rx="5" ry="7" fill="#c084fc" opacity="0.7" />
            <ellipse cx="-4" cy="4" rx="3.5" ry="5" fill="#e9d5ff" opacity="0.6" />
            <ellipse cx="4" cy="4" rx="3.5" ry="5" fill="#e9d5ff" opacity="0.6" />
            <line x1="0" y1="-3" x2="0" y2="8" stroke="#7c3aed" strokeWidth="1" />
            <circle cx="-2" cy="-5" r="0.8" fill="#7c3aed" />
            <circle cx="2" cy="-5" r="0.8" fill="#7c3aed" />
          </g>
        </g>
      )}

      {/* 115 min: fern cluster + fish ripple */}
      {m >= 115 && (
        <g opacity={Math.min((m - 115) / 5, 1)}>
          {[-40, -20, 0, 20, 40].map((angle) => (
            <ellipse key={angle} cx="120" cy="208" rx="4" ry="14" fill="#15803d"
              transform={`rotate(${angle} 120 222)`} opacity="0.6" />
          ))}
          <ellipse cx="290" cy="233" rx="10" ry="3" fill="none" stroke="#60a5fa" strokeWidth="0.5" opacity="0.6" />
          <ellipse cx="290" cy="233" rx="18" ry="5" fill="none" stroke="#60a5fa" strokeWidth="0.3" opacity="0.4" />
          <circle cx="195" cy="237" r="3" fill="#f87171" opacity="0.8" />
          <circle cx="195" cy="237" r="1.5" fill="#fbbf24" />
        </g>
      )}

      {/* 135 min: flying bird + golden butterfly + tall grass */}
      {m >= 135 && (
        <g opacity={Math.min((m - 135) / 5, 1)}>
          <g transform="translate(160, 60)">
            <path d="M 0 0 Q -8 -6 -14 0" fill="none" stroke="#6b7280" strokeWidth="1.5" />
            <path d="M 0 0 Q 8 -6 14 0" fill="none" stroke="#6b7280" strokeWidth="1.5" />
            <circle cx="0" cy="1" r="2" fill="#6b7280" />
          </g>
          <g transform="translate(260, 155)">
            <ellipse cx="-5" cy="0" rx="4" ry="6" fill="#fbbf24" opacity="0.8" />
            <ellipse cx="5" cy="0" rx="4" ry="6" fill="#fbbf24" opacity="0.8" />
            <ellipse cx="-3" cy="3" rx="3" ry="4" fill="#fde68a" opacity="0.6" />
            <ellipse cx="3" cy="3" rx="3" ry="4" fill="#fde68a" opacity="0.6" />
            <line x1="0" y1="-2" x2="0" y2="6" stroke="#d97706" strokeWidth="0.8" />
          </g>
          {[320, 325, 330, 335].map((x, i) => (
            <line key={i} x1={x} y1="225" x2={x + (i % 2 === 0 ? -3 : 3)} y2={207 - i * 3}
              stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          ))}
        </g>
      )}

      {/* 150 min: COUPLE HAVING A PICNIC WITH CUCUMBER, CARROTS & TAJÍN */}
      {m >= 150 && (
        <g opacity={Math.min((m - 150) / 5, 1)}>
          <g transform="translate(30, 225)">
            <ellipse cx="25" cy="8" rx="30" ry="10" fill="#fca5a5" opacity="0.7" />
            {[0, 1, 2, 3].map((col) =>
              [0, 1].map((row) => (
                <rect key={`${col}-${row}`} x={8 + col * 10} y={2 + row * 7}
                  width="8" height="6" fill={(col + row) % 2 === 0 ? '#ef4444' : '#fef2f2'}
                  opacity="0.5" rx="0.5" />
              ))
            )}
          </g>
          <g transform="translate(30, 210)">
            <ellipse cx="0" cy="8" rx="5" ry="7" fill="#6366f1" />
            <circle cx="0" cy="-2" r="5" fill="#fcd34d" />
            <ellipse cx="0" cy="-5" rx="5" ry="3" fill="#92400e" />
            <circle cx="-1.5" cy="-2" r="0.7" fill="#1f2937" />
            <circle cx="1.5" cy="-2" r="0.7" fill="#1f2937" />
            <path d="M -1.5 0 Q 0 1.5 1.5 0" fill="none" stroke="#1f2937" strokeWidth="0.5" />
            <line x1="5" y1="5" x2="12" y2="2" stroke="#fcd34d" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="12" y="0" width="6" height="2" fill="#4ade80" rx="1" />
            <rect x="13" y="0.3" width="4" height="1.4" fill="#86efac" rx="0.5" />
            <circle cx="14" cy="0.5" r="0.3" fill="#ef4444" />
            <circle cx="15.5" cy="0.8" r="0.3" fill="#ef4444" />
          </g>
          <g transform="translate(58, 210)">
            <ellipse cx="0" cy="8" rx="5" ry="7" fill="#ec4899" />
            <circle cx="0" cy="-2" r="5" fill="#fcd34d" />
            <ellipse cx="0" cy="-4" rx="5.5" ry="4" fill="#1f2937" />
            <ellipse cx="-4" cy="0" rx="2" ry="5" fill="#1f2937" transform="rotate(-10 -4 0)" />
            <ellipse cx="4" cy="0" rx="2" ry="5" fill="#1f2937" transform="rotate(10 4 0)" />
            <circle cx="-1.5" cy="-2" r="0.7" fill="#1f2937" />
            <circle cx="1.5" cy="-2" r="0.7" fill="#1f2937" />
            <path d="M -1.5 0 Q 0 1.5 1.5 0" fill="none" stroke="#1f2937" strokeWidth="0.5" />
            <line x1="-5" y1="5" x2="-12" y2="1" stroke="#fcd34d" strokeWidth="1.5" strokeLinecap="round" />
            <polygon points="-12,0 -19,1.5 -12,2" fill="#fb923c" />
            <line x1="-12" y1="0" x2="-10" y2="-2" stroke="#22c55e" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="-12" y1="0.5" x2="-10.5" y2="-1.5" stroke="#4ade80" strokeWidth="0.6" strokeLinecap="round" />
            <circle cx="-15" cy="1" r="0.3" fill="#ef4444" />
            <circle cx="-16.5" cy="1.3" r="0.3" fill="#ef4444" />
          </g>
          <g transform="translate(44, 222)">
            <rect x="-3" y="-8" width="6" height="8" fill="#ef4444" rx="1" />
            <rect x="-2" y="-10" width="4" height="2.5" fill="#1f2937" rx="0.5" />
            <rect x="-2.5" y="-6" width="5" height="3" fill="#fef2f2" rx="0.5" />
            <text x="0" y="-3.5" textAnchor="middle" fontSize="2.5" fill="#ef4444" fontWeight="bold">T</text>
          </g>
          <g transform="translate(44, 232)">
            <ellipse cx="0" cy="0" rx="8" ry="3" fill="#f3f4f6" />
            <ellipse cx="0" cy="-0.5" rx="7" ry="2.5" fill="white" />
            <circle cx="-3" cy="-0.5" r="1.5" fill="#4ade80" />
            <circle cx="-3" cy="-0.5" r="0.8" fill="#86efac" />
            <rect x="0" y="-1.5" width="4" height="1" fill="#fb923c" rx="0.5" />
            <rect x="1" y="0" width="3.5" height="1" fill="#fdba74" rx="0.5" />
          </g>
        </g>
      )}

      {/* === METEORITE RESET ANIMATION === */}
      {isResetting && (
        <g>
          {/* Meteorite rock with fire trail */}
          <g className="meteorite-rock">
            {/* Fire trail glow */}
            <ellipse cx="0" cy="0" rx="18" ry="6" fill="#f97316" opacity="0.4" />
            <ellipse cx="8" cy="0" rx="12" ry="4" fill="#fbbf24" opacity="0.3" />
            {/* Rock body */}
            <circle cx="0" cy="0" r="8" fill="#78350f" />
            <circle cx="-1" cy="-1" r="6" fill="#92400e" />
            <circle cx="2" cy="2" r="3" fill="#451a03" opacity="0.5" />
            {/* Fire fragments */}
            <circle cx="-10" cy="-3" r="3" fill="#ef4444" opacity="0.7" />
            <circle cx="-8" cy="4" r="2" fill="#fbbf24" opacity="0.8" />
            <circle cx="-14" cy="1" r="2.5" fill="#f97316" opacity="0.6" />
          </g>

          {/* Impact flash — white circle at ground center */}
          <circle cx="200" cy="220" r="30" fill="white" className="impact-flash" />

          {/* Shockwave ring */}
          <circle cx="200" cy="220" r="30" fill="none" stroke="#fbbf24" strokeWidth="3"
            className="impact-shockwave" />

          {/* Dust cover — fills scene with brown (matches barren state) */}
          <rect
            width="400" height="260" rx="16"
            fill="#b45309" opacity="0"
            className="dust-cover"
            onAnimationEnd={handleAnimationEnd}
          />
        </g>
      )}
    </svg>
  );
}
