'use client';

import { useState } from 'react';
import { usePlanner } from '@/components/planner/PlannerContext';

export default function LogView() {
  const { logEntries, addLogEntry, removeLogEntry } = usePlanner();
  const [time, setTime] = useState('');
  const [activity, setActivity] = useState('');

  function handleAdd() {
    if (!time.trim() || !activity.trim()) return;
    addLogEntry(time.trim(), activity.trim());
    setActivity('');
    // Auto-advance time: keep the time field for quick sequential entries
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  }

  // Detect task switching: consecutive entries with different activities
  const switches: number[] = [];
  for (let i = 1; i < logEntries.length; i++) {
    if (logEntries[i].activity !== logEntries[i - 1].activity) {
      switches.push(i);
    }
  }
  const switchCount = switches.length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track what you&apos;re doing and when. Spot procrastination and task-switching.
        </p>
      </div>

      {/* Input row */}
      <div className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="w-28 flex-shrink-0">
          <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
            Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-300"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
            What are you doing?
          </label>
          <input
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Working on SE homework, scrolling Twitter, lunch…"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-300"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleAdd}
            disabled={!time.trim() || !activity.trim()}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400"
          >
            Log
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {logEntries.length >= 2 && (
        <div className="flex gap-4 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{logEntries.length}</p>
            <p className="text-[10px] uppercase text-gray-400">Entries</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold ${switchCount > 8 ? 'text-red-500' : switchCount > 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {switchCount}
            </p>
            <p className="text-[10px] uppercase text-gray-400">Task switches</p>
          </div>
          {switchCount > 6 && (
            <div className="flex items-center">
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                High context-switching — try to batch similar tasks
              </span>
            </div>
          )}
        </div>
      )}

      {/* Log timeline */}
      {logEntries.length > 0 ? (
        <div className="space-y-1">
          {logEntries.map((entry, i) => {
            const isSwitch = i > 0 && entry.activity !== logEntries[i - 1].activity;
            return (
              <div key={entry.id}>
                {isSwitch && (
                  <div className="flex items-center gap-2 py-1 pl-[7.5rem]">
                    <div className="h-px flex-1 bg-amber-200" />
                    <span className="text-[9px] font-medium text-amber-400">switched</span>
                    <div className="h-px flex-1 bg-amber-200" />
                  </div>
                )}
                <div className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50">
                  {/* Time */}
                  <span className="w-24 flex-shrink-0 text-right text-sm font-mono font-medium text-gray-400">
                    {entry.time}
                  </span>
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        isSwitch ? 'bg-amber-400' : 'bg-indigo-400'
                      }`}
                    />
                  </div>
                  {/* Activity */}
                  <span className="flex-1 text-sm text-gray-700">{entry.activity}</span>
                  {/* Delete */}
                  <button
                    onClick={() => removeLogEntry(entry.id)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-opacity"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-sm text-gray-400">
          No entries yet. Start logging to track your day.
        </div>
      )}
    </div>
  );
}
