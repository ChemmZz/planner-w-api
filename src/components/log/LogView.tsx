'use client';

import { useMemo, useState } from 'react';
import { usePlanner } from '@/components/planner/PlannerContext';
import { useLogHistory } from '@/lib/useLogHistory';
import type { LogEntry } from '@/types/planner';

function dayKey(ts: number): string {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function dayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(date.getTime()) === dayKey(today.getTime())) return 'Today';
  if (dayKey(date.getTime()) === dayKey(yesterday.getTime())) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function LogView() {
  const { logEntries, addLogEntry, removeLogEntry } = usePlanner();
  const { savedHistory, loading, error, saving, saveToday } = useLogHistory();

  const [time, setTime] = useState('');
  const [activity, setActivity] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  function handleAdd() {
    if (!time.trim() || !activity.trim()) return;
    addLogEntry(time.trim(), activity.trim());
    setActivity('');
    setJustSaved(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  }

  async function handleSave() {
    const ok = await saveToday(logEntries);
    if (ok) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    }
  }

  // Stats on the current session's entries.
  const switches: number[] = [];
  for (let i = 1; i < logEntries.length; i++) {
    if (logEntries[i].activity !== logEntries[i - 1].activity) {
      switches.push(i);
    }
  }
  const switchCount = switches.length;

  // "Save" is disabled if everything in memory is already in history.
  const savedIds = useMemo(
    () => new Set(savedHistory.map((e) => e.id)),
    [savedHistory]
  );
  const allAlreadySaved =
    logEntries.length > 0 && logEntries.every((e) => savedIds.has(e.id));

  // Group history by day (descending).
  const historyByDay = useMemo(() => {
    const groups = new Map<string, LogEntry[]>();
    for (const entry of savedHistory) {
      const key = dayKey(entry.createdAt);
      const bucket = groups.get(key);
      if (bucket) bucket.push(entry);
      else groups.set(key, [entry]);
    }
    return [...groups.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [savedHistory]);

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

      {/* Today's log */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Today&apos;s session
          </h2>
          {logEntries.length > 0 && (
            <button
              onClick={handleSave}
              disabled={saving || allAlreadySaved}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                allAlreadySaved
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300'
              }`}
            >
              {saving
                ? 'Saving…'
                : justSaved
                  ? 'Saved ✓'
                  : allAlreadySaved
                    ? 'Saved ✓'
                    : 'Save today\u2019s log'}
            </button>
          )}
        </div>

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
                    <span className="w-24 flex-shrink-0 text-right text-sm font-mono font-medium text-gray-400">
                      {entry.time}
                    </span>
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          isSwitch ? 'bg-amber-400' : 'bg-indigo-400'
                        }`}
                      />
                    </div>
                    <span className="flex-1 text-sm text-gray-700">{entry.activity}</span>
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
          <div className="py-8 text-center text-sm text-gray-400">
            No entries yet. Start logging to track your day.
          </div>
        )}
      </section>

      {/* Persistence error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          Couldn&apos;t sync with Supabase: {error}
        </div>
      )}

      {/* History */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          History
        </h2>

        {loading ? (
          <div className="py-6 text-center text-sm text-gray-400">
            Loading saved days…
          </div>
        ) : historyByDay.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-400">
            Nothing saved yet. Use the button above to save today&apos;s log.
          </div>
        ) : (
          <div className="space-y-6">
            {historyByDay.map(([key, entries]) => (
              <div key={key}>
                <h3 className="mb-2 text-xs font-medium text-gray-500">
                  {dayLabel(key)}
                </h3>
                <div className="space-y-0.5 rounded-xl border border-gray-200 bg-white p-3">
                  {entries.map((entry, i) => {
                    const isSwitch =
                      i > 0 && entry.activity !== entries[i - 1].activity;
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 rounded px-2 py-1.5"
                      >
                        <span className="w-20 flex-shrink-0 text-right text-xs font-mono text-gray-400">
                          {entry.time}
                        </span>
                        <div
                          className={`h-2 w-2 rounded-full ${
                            isSwitch ? 'bg-amber-300' : 'bg-indigo-300'
                          }`}
                        />
                        <span className="flex-1 text-sm text-gray-600">
                          {entry.activity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
