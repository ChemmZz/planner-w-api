'use client';

/**
 * Conservatory scene inspired by Lincoln Park Conservatory, Chicago.
 * Elements progressively appear based on accumulated work minutes.
 *
 * Thresholds (minutes):
 *  0   — empty lot: sky, ground, pond, stone path
 *  1   — construction crane appears
 *  3   — greenhouse frame being built (partial)
 *  5   — greenhouse complete, crane starts fading
 *  7   — crane gone, first sprout
 *  10  — small fern
 *  15  — pink flower
 *  20  — yellow flower + lily pads
 *  25  — bush + bird on roof
 *  35  — palm tree + bunny by pond
 *  45  — purple & orange flowers + butterfly
 *  60  — fern cluster + fish ripple
 *  90  — flying bird + golden butterfly + tall grass
 * 100  — couple having a picnic with cucumber, carrots & Tajín
 */

interface Props {
  workMinutes: number;
}

export default function ConservatoryScene({ workMinutes }: Props) {
  const m = workMinutes;

  // Greenhouse opacity: builds from 3–5 min, fully visible after 5
  const greenhouseOpacity = m < 3 ? 0 : Math.min((m - 3) / 2, 1);

  // Crane: appears at 1, fades from 5–7
  const craneOpacity = m < 1 ? 0 : m < 5 ? Math.min((m - 1) / 1, 1) : Math.max(1 - (m - 5) / 2, 0);

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

      {/* Ground */}
      <ellipse cx="200" cy="255" rx="210" ry="40" fill="#d1d5db" opacity="0.3" />
      <rect x="0" y="220" width="400" height="40" fill="#86efac" opacity="0.3" />
      <rect x="0" y="230" width="400" height="30" fill="#4ade80" opacity="0.2" />

      {/* Stone path */}
      <ellipse cx="200" cy="245" rx="30" ry="6" fill="#d1d5db" opacity="0.5" />
      <ellipse cx="220" cy="250" rx="20" ry="5" fill="#d1d5db" opacity="0.4" />
      <ellipse cx="180" cy="250" rx="18" ry="4" fill="#d1d5db" opacity="0.4" />

      {/* Pond — always visible */}
      <ellipse cx="290" cy="235" rx="55" ry="18" fill="url(#pond-grad)" opacity="0.5" />
      <ellipse cx="290" cy="233" rx="45" ry="13" fill="#93c5fd" opacity="0.3" />

      {/* === CONSTRUCTION CRANE (1–7 min) === */}
      {craneOpacity > 0 && (
        <g opacity={craneOpacity}>
          {/* Vertical mast */}
          <rect x="355" y="60" width="4" height="165" fill="#f59e0b" rx="1" />
          {/* Mast lattice */}
          {[80, 110, 140, 170, 200].map((y) => (
            <g key={y}>
              <line x1="355" y1={y} x2="359" y2={y - 15} stroke="#d97706" strokeWidth="0.7" />
              <line x1="359" y1={y} x2="355" y2={y - 15} stroke="#d97706" strokeWidth="0.7" />
            </g>
          ))}
          {/* Horizontal boom */}
          <rect x="280" y="58" width="79" height="3" fill="#f59e0b" rx="1" />
          {/* Counter-boom */}
          <rect x="359" y="58" width="30" height="3" fill="#f59e0b" rx="1" />
          {/* Counterweight */}
          <rect x="382" y="55" width="10" height="10" fill="#6b7280" rx="1" />
          {/* Cable */}
          <line x1="310" y1="61" x2="310" y2={m < 3 ? 130 : 105} stroke="#374151" strokeWidth="0.8" />
          {/* Hook */}
          <circle cx="310" cy={m < 3 ? 133 : 108} r="2.5" fill="none" stroke="#374151" strokeWidth="1" />
          {/* Dangling steel beam (before greenhouse is built) */}
          {m < 5 && (
            <rect x="303" y={m < 3 ? 136 : 111} width="14" height="3" fill="#9ca3af" rx="0.5" />
          )}
          {/* Operator cabin */}
          <rect x="353" y="62" width="8" height="10" fill="#fbbf24" rx="1" />
          <rect x="354" y="63" width="3" height="4" fill="#fef3c7" rx="0.5" />
        </g>
      )}

      {/* === GREENHOUSE (builds from 3 min) === */}
      {greenhouseOpacity > 0 && (
        <g opacity={greenhouseOpacity}>
          {/* Glass fill */}
          <path
            d="M 100 220 L 100 120 Q 200 70 300 120 L 300 220"
            fill="url(#glass)"
            stroke="#93c5fd"
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* Frame ribs */}
          <line x1="150" y1="220" x2="150" y2="97" stroke="#93c5fd" strokeWidth="0.8" opacity="0.4" />
          <line x1="200" y1="220" x2="200" y2="82" stroke="#93c5fd" strokeWidth="0.8" opacity="0.4" />
          <line x1="250" y1="220" x2="250" y2="97" stroke="#93c5fd" strokeWidth="0.8" opacity="0.4" />
          {/* Cross bar */}
          <path d="M 100 170 Q 200 150 300 170" fill="none" stroke="#93c5fd" strokeWidth="0.8" opacity="0.3" />
          {/* Door */}
          <rect x="188" y="205" width="24" height="30" rx="2" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.5" />
          <line x1="200" y1="205" x2="200" y2="235" stroke="#93c5fd" strokeWidth="0.5" opacity="0.4" />
        </g>
      )}

      {/* === PROGRESSIVE GARDEN ELEMENTS === */}

      {/* 7 min: first sprout */}
      {m >= 7 && (
        <g opacity={Math.min((m - 7) / 2, 1)}>
          <line x1="160" y1="225" x2="160" y2="210" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="157" cy="210" rx="4" ry="6" fill="#4ade80" transform="rotate(-20 157 210)" />
          <ellipse cx="163" cy="212" rx="4" ry="5" fill="#22c55e" transform="rotate(15 163 212)" />
        </g>
      )}

      {/* 10 min: small fern */}
      {m >= 10 && (
        <g opacity={Math.min((m - 10) / 3, 1)}>
          <line x1="200" y1="225" x2="200" y2="195" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
          {[-30, -15, 0, 15, 30].map((angle, i) => (
            <ellipse
              key={i}
              cx="200"
              cy={200 + i * 2}
              rx="3"
              ry="8"
              fill="#22c55e"
              transform={`rotate(${angle} 200 ${200 + i * 2})`}
              opacity={0.7 + i * 0.05}
            />
          ))}
        </g>
      )}

      {/* 15 min: pink flower */}
      {m >= 15 && (
        <g opacity={Math.min((m - 15) / 3, 1)}>
          <line x1="140" y1="225" x2="140" y2="200" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="140"
              cy="195"
              rx="4"
              ry="7"
              fill="#f472b6"
              transform={`rotate(${angle} 140 195)`}
              opacity="0.8"
            />
          ))}
          <circle cx="140" cy="195" r="3" fill="#fbbf24" />
        </g>
      )}

      {/* 20 min: yellow flower + lily pads */}
      {m >= 20 && (
        <g opacity={Math.min((m - 20) / 3, 1)}>
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

      {/* 25 min: bush + bird on roof */}
      {m >= 25 && greenhouseOpacity > 0 && (
        <g opacity={Math.min((m - 25) / 4, 1)}>
          {/* Bush */}
          <ellipse cx="115" cy="222" rx="16" ry="10" fill="#22c55e" opacity="0.7" />
          <ellipse cx="110" cy="218" rx="11" ry="9" fill="#4ade80" opacity="0.6" />
          <ellipse cx="122" cy="219" rx="9" ry="7" fill="#16a34a" opacity="0.6" />

          {/* Bird on greenhouse roof */}
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

      {/* 35 min: palm tree + bunny */}
      {m >= 35 && (
        <g opacity={Math.min((m - 35) / 5, 1)}>
          {/* Palm */}
          <line x1="280" y1="225" x2="278" y2="165" stroke="#854d0e" strokeWidth="3" strokeLinecap="round" />
          {[-50, -25, 0, 25, 50].map((angle) => (
            <ellipse
              key={angle}
              cx="278"
              cy="167"
              rx="5"
              ry="20"
              fill="#22c55e"
              transform={`rotate(${angle} 278 167)`}
              opacity="0.7"
            />
          ))}

          {/* Bunny by pond */}
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

      {/* 45 min: more flowers + butterfly */}
      {m >= 45 && (
        <g opacity={Math.min((m - 45) / 5, 1)}>
          {/* Purple flower */}
          <line x1="175" y1="225" x2="175" y2="190" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse key={angle} cx="175" cy="186" rx="3.5" ry="6" fill="#a78bfa"
              transform={`rotate(${angle} 175 186)`} opacity="0.8" />
          ))}
          <circle cx="175" cy="186" r="2.5" fill="#fbbf24" />

          {/* Orange flower */}
          <line x1="220" y1="225" x2="220" y2="195" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse key={angle} cx="220" cy="191" rx="3" ry="5.5" fill="#fb923c"
              transform={`rotate(${angle} 220 191)`} opacity="0.8" />
          ))}

          {/* Butterfly */}
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

      {/* 60 min: fern cluster + fish ripple */}
      {m >= 60 && (
        <g opacity={Math.min((m - 60) / 5, 1)}>
          {[-40, -20, 0, 20, 40].map((angle) => (
            <ellipse key={angle} cx="120" cy="208" rx="4" ry="14" fill="#15803d"
              transform={`rotate(${angle} 120 222)`} opacity="0.6" />
          ))}
          {/* Fish ripple */}
          <ellipse cx="290" cy="233" rx="10" ry="3" fill="none" stroke="#60a5fa" strokeWidth="0.5" opacity="0.6" />
          <ellipse cx="290" cy="233" rx="18" ry="5" fill="none" stroke="#60a5fa" strokeWidth="0.3" opacity="0.4" />
          {/* Small red flower */}
          <circle cx="195" cy="237" r="3" fill="#f87171" opacity="0.8" />
          <circle cx="195" cy="237" r="1.5" fill="#fbbf24" />
        </g>
      )}

      {/* 90 min: flying bird + golden butterfly + tall grass */}
      {m >= 90 && (
        <g opacity={Math.min((m - 90) / 5, 1)}>
          {/* Flying bird */}
          <g transform="translate(160, 60)">
            <path d="M 0 0 Q -8 -6 -14 0" fill="none" stroke="#6b7280" strokeWidth="1.5" />
            <path d="M 0 0 Q 8 -6 14 0" fill="none" stroke="#6b7280" strokeWidth="1.5" />
            <circle cx="0" cy="1" r="2" fill="#6b7280" />
          </g>
          {/* Golden butterfly */}
          <g transform="translate(260, 155)">
            <ellipse cx="-5" cy="0" rx="4" ry="6" fill="#fbbf24" opacity="0.8" />
            <ellipse cx="5" cy="0" rx="4" ry="6" fill="#fbbf24" opacity="0.8" />
            <ellipse cx="-3" cy="3" rx="3" ry="4" fill="#fde68a" opacity="0.6" />
            <ellipse cx="3" cy="3" rx="3" ry="4" fill="#fde68a" opacity="0.6" />
            <line x1="0" y1="-2" x2="0" y2="6" stroke="#d97706" strokeWidth="0.8" />
          </g>
          {/* Tall grass right */}
          {[320, 325, 330, 335].map((x, i) => (
            <line key={i} x1={x} y1="225" x2={x + (i % 2 === 0 ? -3 : 3)} y2={207 - i * 3}
              stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          ))}
        </g>
      )}

      {/* 100 min: COUPLE HAVING A PICNIC WITH CUCUMBER, CARROTS & TAJÍN */}
      {m >= 100 && (
        <g opacity={Math.min((m - 100) / 5, 1)}>
          {/* Picnic blanket (red & white checkered) */}
          <g transform="translate(30, 225)">
            <ellipse cx="25" cy="8" rx="30" ry="10" fill="#fca5a5" opacity="0.7" />
            {/* Checker pattern */}
            {[0, 1, 2, 3].map((col) =>
              [0, 1].map((row) => (
                <rect
                  key={`${col}-${row}`}
                  x={8 + col * 10}
                  y={2 + row * 7}
                  width="8"
                  height="6"
                  fill={(col + row) % 2 === 0 ? '#ef4444' : '#fef2f2'}
                  opacity="0.5"
                  rx="0.5"
                />
              ))
            )}
          </g>

          {/* Person 1 (left, sitting) */}
          <g transform="translate(30, 210)">
            {/* Body */}
            <ellipse cx="0" cy="8" rx="5" ry="7" fill="#6366f1" />
            {/* Head */}
            <circle cx="0" cy="-2" r="5" fill="#fcd34d" />
            {/* Hair */}
            <ellipse cx="0" cy="-5" rx="5" ry="3" fill="#92400e" />
            {/* Eyes */}
            <circle cx="-1.5" cy="-2" r="0.7" fill="#1f2937" />
            <circle cx="1.5" cy="-2" r="0.7" fill="#1f2937" />
            {/* Smile */}
            <path d="M -1.5 0 Q 0 1.5 1.5 0" fill="none" stroke="#1f2937" strokeWidth="0.5" />
            {/* Arm holding cucumber */}
            <line x1="5" y1="5" x2="12" y2="2" stroke="#fcd34d" strokeWidth="1.5" strokeLinecap="round" />
            {/* Cucumber slice */}
            <rect x="12" y="0" width="6" height="2" fill="#4ade80" rx="1" />
            <rect x="13" y="0.3" width="4" height="1.4" fill="#86efac" rx="0.5" />
            {/* Tajín dots on cucumber */}
            <circle cx="14" cy="0.5" r="0.3" fill="#ef4444" />
            <circle cx="15.5" cy="0.8" r="0.3" fill="#ef4444" />
          </g>

          {/* Person 2 (right, sitting) */}
          <g transform="translate(58, 210)">
            {/* Body */}
            <ellipse cx="0" cy="8" rx="5" ry="7" fill="#ec4899" />
            {/* Head */}
            <circle cx="0" cy="-2" r="5" fill="#fcd34d" />
            {/* Hair (longer) */}
            <ellipse cx="0" cy="-4" rx="5.5" ry="4" fill="#1f2937" />
            <ellipse cx="-4" cy="0" rx="2" ry="5" fill="#1f2937" transform="rotate(-10 -4 0)" />
            <ellipse cx="4" cy="0" rx="2" ry="5" fill="#1f2937" transform="rotate(10 4 0)" />
            {/* Eyes */}
            <circle cx="-1.5" cy="-2" r="0.7" fill="#1f2937" />
            <circle cx="1.5" cy="-2" r="0.7" fill="#1f2937" />
            {/* Smile */}
            <path d="M -1.5 0 Q 0 1.5 1.5 0" fill="none" stroke="#1f2937" strokeWidth="0.5" />
            {/* Arm holding carrot */}
            <line x1="-5" y1="5" x2="-12" y2="1" stroke="#fcd34d" strokeWidth="1.5" strokeLinecap="round" />
            {/* Carrot */}
            <polygon points="-12,0 -19,1.5 -12,2" fill="#fb923c" />
            <line x1="-12" y1="0" x2="-10" y2="-2" stroke="#22c55e" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="-12" y1="0.5" x2="-10.5" y2="-1.5" stroke="#4ade80" strokeWidth="0.6" strokeLinecap="round" />
            {/* Tajín dots on carrot */}
            <circle cx="-15" cy="1" r="0.3" fill="#ef4444" />
            <circle cx="-16.5" cy="1.3" r="0.3" fill="#ef4444" />
          </g>

          {/* Tajín bottle between them */}
          <g transform="translate(44, 222)">
            {/* Bottle body */}
            <rect x="-3" y="-8" width="6" height="8" fill="#ef4444" rx="1" />
            {/* Cap */}
            <rect x="-2" y="-10" width="4" height="2.5" fill="#1f2937" rx="0.5" />
            {/* Label */}
            <rect x="-2.5" y="-6" width="5" height="3" fill="#fef2f2" rx="0.5" />
            {/* T letter */}
            <text x="0" y="-3.5" textAnchor="middle" fontSize="2.5" fill="#ef4444" fontWeight="bold">T</text>
          </g>

          {/* Small plate with more veggie slices */}
          <g transform="translate(44, 232)">
            <ellipse cx="0" cy="0" rx="8" ry="3" fill="#f3f4f6" />
            <ellipse cx="0" cy="-0.5" rx="7" ry="2.5" fill="white" />
            {/* Cucumber slices */}
            <circle cx="-3" cy="-0.5" r="1.5" fill="#4ade80" />
            <circle cx="-3" cy="-0.5" r="0.8" fill="#86efac" />
            {/* Carrot sticks */}
            <rect x="0" y="-1.5" width="4" height="1" fill="#fb923c" rx="0.5" />
            <rect x="1" y="0" width="3.5" height="1" fill="#fdba74" rx="0.5" />
          </g>
        </g>
      )}
    </svg>
  );
}
