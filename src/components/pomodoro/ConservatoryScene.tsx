'use client';

/**
 * Conservatory scene inspired by Lincoln Park Conservatory, Chicago.
 * Elements progressively appear based on accumulated work minutes.
 *
 * Thresholds (minutes):
 *  0  — glass greenhouse frame, stone path, empty pond
 *  3  — first sprout
 *  6  — sprout grows into a small fern
 * 10  — flower blooms (pink)
 * 15  — second flower (yellow), lily pads on pond
 * 20  — small bush, bird on roof
 * 30  — palm tree, bunny by pond
 * 45  — more flowers, second bird, butterfly
 * 60  — large fern cluster, pond fish ripple
 * 90  — golden butterflies, full lush scene
 */

interface Props {
  workMinutes: number;
}

export default function ConservatoryScene({ workMinutes }: Props) {
  const m = workMinutes;

  return (
    <svg
      viewBox="0 0 400 260"
      className="w-full max-w-md"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sky gradient */}
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

      {/* Background */}
      <rect width="400" height="260" fill="url(#sky)" rx="16" />

      {/* Ground */}
      <ellipse cx="200" cy="255" rx="210" ry="40" fill="#d1d5db" opacity="0.3" />
      <rect x="0" y="220" width="400" height="40" fill="#86efac" opacity="0.3" rx="0" />
      <rect x="0" y="230" width="400" height="30" fill="#4ade80" opacity="0.2" />

      {/* Stone path */}
      <ellipse cx="200" cy="245" rx="30" ry="6" fill="#d1d5db" opacity="0.5" />
      <ellipse cx="220" cy="250" rx="20" ry="5" fill="#d1d5db" opacity="0.4" />
      <ellipse cx="180" cy="250" rx="18" ry="4" fill="#d1d5db" opacity="0.4" />

      {/* Glass greenhouse frame */}
      <path
        d="M 60 220 L 60 100 Q 200 30 340 100 L 340 220"
        fill="url(#glass)"
        stroke="#93c5fd"
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* Frame ribs */}
      <line x1="130" y1="220" x2="130" y2="72" stroke="#93c5fd" strokeWidth="0.8" opacity="0.4" />
      <line x1="200" y1="220" x2="200" y2="55" stroke="#93c5fd" strokeWidth="0.8" opacity="0.4" />
      <line x1="270" y1="220" x2="270" y2="72" stroke="#93c5fd" strokeWidth="0.8" opacity="0.4" />
      {/* Cross bar */}
      <path d="M 60 160 Q 200 130 340 160" fill="none" stroke="#93c5fd" strokeWidth="0.8" opacity="0.3" />

      {/* Pond (always visible) */}
      <ellipse cx="290" cy="235" rx="55" ry="18" fill="url(#pond-grad)" opacity="0.5" />
      <ellipse cx="290" cy="233" rx="45" ry="13" fill="#93c5fd" opacity="0.3" />

      {/* === PROGRESSIVE ELEMENTS === */}

      {/* 3 min: first sprout */}
      {m >= 3 && (
        <g opacity={Math.min((m - 3) / 2, 1)}>
          <line x1="120" y1="225" x2="120" y2="210" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="117" cy="210" rx="4" ry="6" fill="#4ade80" transform="rotate(-20 117 210)" />
          <ellipse cx="123" cy="212" rx="4" ry="5" fill="#22c55e" transform="rotate(15 123 212)" />
        </g>
      )}

      {/* 6 min: small fern */}
      {m >= 6 && (
        <g opacity={Math.min((m - 6) / 3, 1)}>
          <line x1="160" y1="225" x2="160" y2="195" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
          {[-30, -15, 0, 15, 30].map((angle, i) => (
            <ellipse
              key={i}
              cx="160"
              cy={200 + i * 2}
              rx="3"
              ry="8"
              fill="#22c55e"
              transform={`rotate(${angle} 160 ${200 + i * 2})`}
              opacity={0.7 + i * 0.05}
            />
          ))}
        </g>
      )}

      {/* 10 min: pink flower */}
      {m >= 10 && (
        <g opacity={Math.min((m - 10) / 3, 1)}>
          <line x1="100" y1="225" x2="100" y2="200" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="100"
              cy="195"
              rx="4"
              ry="7"
              fill="#f472b6"
              transform={`rotate(${angle} 100 195)`}
              opacity="0.8"
            />
          ))}
          <circle cx="100" cy="195" r="3" fill="#fbbf24" />
        </g>
      )}

      {/* 15 min: yellow flower + lily pads */}
      {m >= 15 && (
        <g opacity={Math.min((m - 15) / 3, 1)}>
          {/* Yellow flower */}
          <line x1="240" y1="225" x2="240" y2="198" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cx="240"
              cy="193"
              rx="3"
              ry="6"
              fill="#fbbf24"
              transform={`rotate(${angle} 240 193)`}
              opacity="0.85"
            />
          ))}
          <circle cx="240" cy="193" r="2.5" fill="#f97316" />

          {/* Lily pads */}
          <ellipse cx="275" cy="232" rx="8" ry="4" fill="#4ade80" opacity="0.6" />
          <ellipse cx="305" cy="230" rx="7" ry="3.5" fill="#22c55e" opacity="0.5" />
        </g>
      )}

      {/* 20 min: bush + bird on roof */}
      {m >= 20 && (
        <g opacity={Math.min((m - 20) / 4, 1)}>
          {/* Bush */}
          <ellipse cx="80" cy="222" rx="18" ry="12" fill="#22c55e" opacity="0.7" />
          <ellipse cx="75" cy="218" rx="12" ry="10" fill="#4ade80" opacity="0.6" />
          <ellipse cx="88" cy="218" rx="10" ry="8" fill="#16a34a" opacity="0.6" />

          {/* Bird on greenhouse roof */}
          <g transform="translate(190, 52)">
            <ellipse cx="0" cy="0" rx="5" ry="3.5" fill="#6b7280" />
            <circle cx="5" cy="-1.5" r="2.5" fill="#6b7280" />
            <circle cx="6" cy="-2" r="0.8" fill="white" />
            <circle cx="6.3" cy="-2" r="0.4" fill="#1f2937" />
            <polygon points="8,-2 10,-1.5 8,-1" fill="#f59e0b" />
            {/* Tail */}
            <polygon points="-5,0 -9,-2 -5,1" fill="#9ca3af" />
          </g>
        </g>
      )}

      {/* 30 min: palm tree + bunny */}
      {m >= 30 && (
        <g opacity={Math.min((m - 30) / 5, 1)}>
          {/* Palm/tall plant */}
          <line x1="320" y1="225" x2="318" y2="160" stroke="#854d0e" strokeWidth="3" strokeLinecap="round" />
          {[-50, -25, 0, 25, 50].map((angle) => (
            <ellipse
              key={angle}
              cx="318"
              cy="162"
              rx="5"
              ry="22"
              fill="#22c55e"
              transform={`rotate(${angle} 318 162)`}
              opacity="0.7"
            />
          ))}

          {/* Bunny by pond */}
          <g transform="translate(255, 238)">
            {/* Body */}
            <ellipse cx="0" cy="0" rx="6" ry="5" fill="#e5e7eb" />
            {/* Head */}
            <circle cx="5" cy="-3" r="4" fill="#e5e7eb" />
            {/* Ears */}
            <ellipse cx="3" cy="-9" rx="2" ry="5" fill="#e5e7eb" />
            <ellipse cx="3.5" cy="-9" rx="1" ry="4" fill="#fecaca" opacity="0.5" />
            <ellipse cx="7" cy="-9" rx="2" ry="5" fill="#e5e7eb" />
            <ellipse cx="7.5" cy="-9" rx="1" ry="4" fill="#fecaca" opacity="0.5" />
            {/* Eye */}
            <circle cx="7" cy="-3.5" r="0.8" fill="#1f2937" />
            {/* Nose */}
            <circle cx="9" cy="-2.5" r="0.5" fill="#f9a8d4" />
            {/* Tail */}
            <circle cx="-6" cy="-1" r="2" fill="white" />
          </g>
        </g>
      )}

      {/* 45 min: more flowers + butterfly */}
      {m >= 45 && (
        <g opacity={Math.min((m - 45) / 5, 1)}>
          {/* Purple flower */}
          <line x1="140" y1="225" x2="140" y2="190" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="140"
              cy="186"
              rx="3.5"
              ry="6"
              fill="#a78bfa"
              transform={`rotate(${angle} 140 186)`}
              opacity="0.8"
            />
          ))}
          <circle cx="140" cy="186" r="2.5" fill="#fbbf24" />

          {/* Orange flower */}
          <line x1="210" y1="225" x2="210" y2="195" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cx="210"
              cy="191"
              rx="3"
              ry="5.5"
              fill="#fb923c"
              transform={`rotate(${angle} 210 191)`}
              opacity="0.8"
            />
          ))}

          {/* Butterfly */}
          <g transform="translate(175, 140)">
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

      {/* 60 min: large fern cluster + fish ripple */}
      {m >= 60 && (
        <g opacity={Math.min((m - 60) / 5, 1)}>
          {/* Fern cluster left */}
          {[-40, -20, 0, 20, 40].map((angle) => (
            <ellipse
              key={angle}
              cx="70"
              cy="205"
              rx="4"
              ry="15"
              fill="#15803d"
              transform={`rotate(${angle} 70 220)`}
              opacity="0.6"
            />
          ))}

          {/* Fish ripple in pond */}
          <ellipse cx="290" cy="233" rx="10" ry="3" fill="none" stroke="#60a5fa" strokeWidth="0.5" opacity="0.6" />
          <ellipse cx="290" cy="233" rx="18" ry="5" fill="none" stroke="#60a5fa" strokeWidth="0.3" opacity="0.4" />

          {/* Small red flower by path */}
          <circle cx="195" cy="237" r="3" fill="#f87171" opacity="0.8" />
          <circle cx="195" cy="237" r="1.5" fill="#fbbf24" />
        </g>
      )}

      {/* 90 min: second bird + golden butterfly + extra greenery */}
      {m >= 90 && (
        <g opacity={Math.min((m - 90) / 5, 1)}>
          {/* Second bird (flying) */}
          <g transform="translate(130, 80)">
            <path d="M 0 0 Q -8 -6 -14 0" fill="none" stroke="#6b7280" strokeWidth="1.5" />
            <path d="M 0 0 Q 8 -6 14 0" fill="none" stroke="#6b7280" strokeWidth="1.5" />
            <circle cx="0" cy="1" r="2" fill="#6b7280" />
          </g>

          {/* Golden butterfly */}
          <g transform="translate(300, 170)">
            <ellipse cx="-5" cy="0" rx="4" ry="6" fill="#fbbf24" opacity="0.8" />
            <ellipse cx="5" cy="0" rx="4" ry="6" fill="#fbbf24" opacity="0.8" />
            <ellipse cx="-3" cy="3" rx="3" ry="4" fill="#fde68a" opacity="0.6" />
            <ellipse cx="3" cy="3" rx="3" ry="4" fill="#fde68a" opacity="0.6" />
            <line x1="0" y1="-2" x2="0" y2="6" stroke="#d97706" strokeWidth="0.8" />
          </g>

          {/* Extra tall grass */}
          {[340, 345, 350, 355].map((x, i) => (
            <line
              key={i}
              x1={x}
              y1="225"
              x2={x + (i % 2 === 0 ? -3 : 3)}
              y2={205 - i * 3}
              stroke="#4ade80"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          ))}
        </g>
      )}

      {/* Greenhouse door frame (always visible, on top) */}
      <rect x="185" y="210" width="30" height="30" rx="2" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.5" />
      <line x1="200" y1="210" x2="200" y2="240" stroke="#93c5fd" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}
