'use client';

import { useState, useEffect, useRef } from 'react';
import { usePlanner } from '@/components/planner/PlannerContext';
import { HABIT_DEFS } from '@/lib/constants';

export default function StepHabits() {
  const { addTask, removeTask, tasks } = usePlanner();

  // Derive initial selection from existing habit tasks so going back doesn't reset
  function deriveSelected(): Set<string> {
    const habitTexts = tasks.filter((t) => t.categoryId === 'habit').map((t) => t.text);
    const s = new Set<string>();
    for (const habit of HABIT_DEFS) {
      const allPresent = habit.tasks.every((t) => habitTexts.includes(t.text));
      if (allPresent) s.add(habit.id);
    }
    return s;
  }

  const [selected, setSelected] = useState<Set<string>>(deriveSelected);
  const prevSelected = useRef<Set<string>>(new Set(selected));

  useEffect(() => {
    const prev = prevSelected.current;
    const curr = selected;

    // Newly selected habits: add their tasks
    curr.forEach((habitId) => {
      if (!prev.has(habitId)) {
        const habit = HABIT_DEFS.find((h) => h.id === habitId);
        habit?.tasks.forEach((t) => addTask('habit', t.text));
      }
    });

    // Newly deselected habits: remove their tasks
    prev.forEach((habitId) => {
      if (!curr.has(habitId)) {
        const habit = HABIT_DEFS.find((h) => h.id === habitId);
        if (habit) {
          const textsToRemove = habit.tasks.map((t) => t.text);
          const tasksToRemove = tasks.filter(
            (t) => t.categoryId === 'habit' && textsToRemove.includes(t.text)
          );
          tasksToRemove.forEach((t) => removeTask(t.id));
        }
      }
    });

    prevSelected.current = new Set(curr);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(habitId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(habitId)) {
        next.delete(habitId);
      } else {
        next.add(habitId);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Daily Habits</h2>
      <p className="text-sm text-gray-500">
        Select habits to add them as tasks for today.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {HABIT_DEFS.map((habit) => {
          const isOn = selected.has(habit.id);
          return (
            <button
              key={habit.id}
              onClick={() => toggle(habit.id)}
              className={`rounded-xl border-2 px-4 py-4 text-left transition-all ${
                isOn
                  ? 'border-pink-400 bg-pink-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs transition-colors ${
                    isOn
                      ? 'border-pink-500 bg-pink-500 text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {isOn && (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={`text-sm font-medium ${isOn ? 'text-pink-700' : 'text-gray-600'}`}>
                  {habit.label}
                </span>
              </div>
              {isOn && (
                <div className="mt-2 ml-9 space-y-1">
                  {habit.tasks.map((t, i) => (
                    <p key={i} className="text-xs text-pink-500">+ {t.text}</p>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
