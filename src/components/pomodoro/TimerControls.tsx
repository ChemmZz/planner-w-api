'use client';

interface TimerControlsProps {
  isRunning: boolean;
  mode: 'work' | 'break';
  workElapsed: number; // total seconds worked this session
  onStart: () => void;
  onPause: () => void;
  onFinishWork: () => void;
  onReset: () => void;
  sessionCount: number;
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function TimerControls({
  isRunning,
  mode,
  workElapsed,
  onStart,
  onPause,
  onFinishWork,
  onReset,
  sessionCount,
}: TimerControlsProps) {
  const breakTime = Math.ceil(workElapsed * 0.2);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        {mode === 'work' ? (
          <>
            {!isRunning ? (
              <button
                onClick={onStart}
                className="rounded-full bg-emerald-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                {workElapsed === 0 ? 'Start Focus' : 'Resume'}
              </button>
            ) : (
              <button
                onClick={onPause}
                className="rounded-full bg-gray-200 px-8 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300"
              >
                Pause
              </button>
            )}
            {workElapsed > 0 && (
              <button
                onClick={onFinishWork}
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Take Break
              </button>
            )}
          </>
        ) : (
          <>
            {!isRunning ? (
              <button
                onClick={onStart}
                className="rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Start Rest
              </button>
            ) : (
              <p className="text-sm font-medium text-emerald-600">Resting…</p>
            )}
          </>
        )}
        <button
          onClick={onReset}
          className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col items-center gap-1 text-sm text-gray-400">
        {mode === 'work' && workElapsed > 0 && (
          <p>
            Worked {formatDuration(workElapsed)} — break will be{' '}
            <span className="font-semibold text-emerald-500">
              {formatDuration(breakTime)}
            </span>
          </p>
        )}
        {mode === 'break' && (
          <p>
            Earned from {formatDuration(workElapsed)} of focus (20% rest)
          </p>
        )}
        <p className="font-medium">Session {sessionCount}</p>
      </div>
    </div>
  );
}
