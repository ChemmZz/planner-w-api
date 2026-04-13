'use client';

import { useState, useEffect } from 'react';
import { usePlanner } from '@/components/planner/PlannerContext';
import TimerCircle from './TimerCircle';
import TimerControls from './TimerControls';
import TaskPicker from './TaskPicker';

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

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Deep Focus Timer</h1>
        <p className="mt-1 text-sm text-gray-500">
          Work as long as you need. Break = 20% of your focus time.
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

      <div className="w-full max-w-xs">
        <TaskPicker selectedTaskId={timer.selectedTaskId} onSelect={timerSetTask} />
      </div>
    </div>
  );
}
