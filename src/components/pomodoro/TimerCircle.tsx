'use client';

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface TimerCircleProps {
  elapsed: number;     // seconds elapsed (work mode) or remaining (break mode)
  totalBreak?: number; // total break seconds (only in break mode)
  mode: 'work' | 'break';
}

export default function TimerCircle({ elapsed, totalBreak, mode }: TimerCircleProps) {
  const color = mode === 'work' ? '#6366f1' : '#10b981';

  // In work mode: no arc progress, just counts up
  // In break mode: arc shows remaining/total
  let dashOffset = CIRCUMFERENCE;
  if (mode === 'break' && totalBreak && totalBreak > 0) {
    const progress = elapsed / totalBreak;
    dashOffset = CIRCUMFERENCE * (1 - progress);
  } else if (mode === 'work') {
    // Subtle rotating animation — fill grows slowly (caps at full circle after 2 hours)
    const progress = Math.min(elapsed / 7200, 1);
    dashOffset = CIRCUMFERENCE * (1 - progress);
  }

  const displaySeconds = mode === 'break' && totalBreak
    ? Math.max(totalBreak - elapsed, 0) // countdown for break
    : elapsed; // count up for work

  const hrs = Math.floor(displaySeconds / 3600);
  const mins = Math.floor((displaySeconds % 3600) / 60);
  const secs = displaySeconds % 60;

  const timeStr = hrs > 0
    ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 120 120" width="220" height="220">
        {/* Track */}
        <circle
          cx="60" cy="60" r={RADIUS}
          fill="none" stroke="#e5e7eb" strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx="60" cy="60" r={RADIUS}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {/* Time */}
        <text
          x="60" y="58"
          textAnchor="middle"
          fontSize={hrs > 0 ? '22' : '28'}
          fontWeight="bold"
          fill="#1a1a2e"
        >
          {timeStr}
        </text>
        <text
          x="60" y="76"
          textAnchor="middle"
          fontSize="11"
          fill={color}
          fontWeight="600"
        >
          {mode === 'work' ? 'DEEP FOCUS' : 'REST'}
        </text>
      </svg>
    </div>
  );
}
