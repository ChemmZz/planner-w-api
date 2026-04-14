'use client';

import { useState, useEffect } from 'react';
import { usePlanner } from '@/components/planner/PlannerContext';
import TimerCircle from './TimerCircle';
import TimerControls from './TimerControls';
import TaskPicker from './TaskPicker';
import ConservatoryScene from './ConservatoryScene';

export default function PomodoroView() {
  const {
    timer,
    timerStart,
    timerPause,
    timerFinishWork,
    timerReset,
    timerSetTask,
  } = usePlanner();

  // Recompute elapsed from the stored timestamp every 250ms
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    function computeElapsed() {
      if (timer.startedAt) {
        const runSecs = Math.round((Date.now() - timer.startedAt) / 1000);
        return timer.accumulated + runSecs;
      }
      return timer.accumulated;
    }

    setElapsed(computeElapsed());

    if (!timer.isRunning) return;

    const interval = setInterval(() => {
      const current = computeElapsed();

      // Auto-end break
      if (timer.mode === 'break' && current >= timer.breakDuration) {
        clearInterval(interval);
        // Transition handled via context — we need to update context
        // Use a custom approach: set timer to next session
        timerReset();
        return;
      }

      setElapsed(current);
    }, 250);

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startedAt, timer.accumulated, timer.mode, timer.breakDuration, timerReset]);

  const workElapsed = timer.mode === 'work' ? elapsed : timer.workElapsed;

  const realWorkMinutes = Math.floor(workElapsed / 60);
  const [devOverride, setDevOverride] = useState<number | null>(null);
  const [showDevSlider, setShowDevSlider] = useState(false);
  const workMinutes = devOverride ?? realWorkMinutes;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Deep Focus Timer</h1>
        <p className="mt-1 text-sm text-gray-500">
          Work as long as you need. Your conservatory grows with you.
        </p>
      </div>

      <TimerCircle
        elapsed={elapsed}
        totalBreak={timer.mode === 'break' ? timer.breakDuration : undefined}
        mode={timer.mode}
      />

      <TimerControls
        isRunning={timer.isRunning}
        mode={timer.mode}
        workElapsed={workElapsed}
        onStart={timerStart}
        onPause={timerPause}
        onFinishWork={timerFinishWork}
        onReset={timerReset}
        sessionCount={timer.sessionCount}
      />

      {/* Conservatory — grows based on accumulated work time */}
      <div className="w-full">
        <ConservatoryScene workMinutes={workMinutes} />
        <p
          className="mt-1 text-center text-[10px] text-gray-400 select-none"
          onClick={(e) => {
            if (e.shiftKey) setShowDevSlider((v) => !v);
          }}
        >
          {workMinutes === 0
            ? 'Start focusing to grow your conservatory'
            : workMinutes < 10
              ? 'Sprouts are appearing…'
              : workMinutes < 30
                ? 'Your garden is blooming!'
                : workMinutes < 60
                  ? 'The wildlife is settling in'
                  : workMinutes < 90
                    ? 'A thriving conservatory!'
                    : 'A masterpiece — Lincoln Park would be proud'}
        </p>
        {showDevSlider && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2">
            <span className="text-[10px] font-mono text-amber-600">DEV</span>
            <input
              type="range"
              min="0"
              max="120"
              value={workMinutes}
              onChange={(e) => setDevOverride(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs font-mono text-amber-700 w-12 text-right">{workMinutes}m</span>
            <button
              onClick={() => { setDevOverride(null); setShowDevSlider(false); }}
              className="text-[10px] text-amber-500 hover:text-amber-700"
            >
              reset
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-xs">
        <TaskPicker selectedTaskId={timer.selectedTaskId} onSelect={timerSetTask} />
      </div>
    </div>
  );
}
