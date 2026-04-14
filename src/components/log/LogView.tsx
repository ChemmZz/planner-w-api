'use client';

import { useEffect, useMemo, useState } from 'react';
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

function dayKeyFromDate(d: Date): string {
  return dayKey(d.getTime());
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

// 6×7 grid of Dates covering the view month — includes leading/trailing days
// from the adjacent months so every calendar has exactly 42 cells.
function getMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // 0 = Sunday
  const start = new Date(year, month, 1 - startOffset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    cells.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return cells;
}

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

  // Group history by day for fast calendar lookup.
  const entriesByDay = useMemo(() => {
    const groups = new Map<string, LogEntry[]>();
    for (const entry of savedHistory) {
      const key = dayKey(entry.createdAt);
      const bucket = groups.get(key);
      if (bucket) bucket.push(entry);
      else groups.set(key, [entry]);
    }
    return groups;
  }, [savedHistory]);

  const savedDayKeys = useMemo(
    () => [...entriesByDay.keys()].sort(), // ascending
    [entriesByDay]
  );

  // --- Calendar state ---------------------------------------------------
  const today = useMemo(() => new Date(), []);
  const todayKey = dayKeyFromDate(today);

  // Default selection: most recent day with data, else today.
  const [selectedDayKey, setSelectedDayKey] = useState<string>(() =>
    savedDayKeys.length > 0 ? savedDayKeys[savedDayKeys.length - 1] : todayKey
  );
  const [viewMonth, setViewMonth] = useState<{ year: number; month: number }>(() => {
    const [y, m] = (savedDayKeys[savedDayKeys.length - 1] ?? todayKey)
      .split('-')
      .map(Number);
    return { year: y, month: m - 1 };
  });

  // When history finishes loading, jump selection to the newest saved day
  // (only if we're still on today with no data — avoids clobbering user nav).
  useEffect(() => {
    if (savedDayKeys.length === 0) return;
    if (entriesByDay.has(selectedDayKey)) return;
    const newest = savedDayKeys[savedDayKeys.length - 1];
    setSelectedDayKey(newest);
    const [y, m] = newest.split('-').map(Number);
    setViewMonth({ year: y, month: m - 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedDayKeys.length]);

  const monthCells = useMemo(
    () => getMonthGrid(viewMonth.year, viewMonth.month),
    [viewMonth]
  );

  const monthLabel = useMemo(
    () =>
      new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [viewMonth]
  );

  function shiftMonth(delta: number) {
    setViewMonth((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const selectedEntries = entriesByDay.get(selectedDayKey) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track what you&apos;re doing and when. Spot procrastination and task-switching.
        </p>
      </div>

      {/* Input row */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="w-full flex-shrink-0 sm:w-28">
          <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
            Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-300"
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
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-300"
          />
        </div>
        <div className="flex items-end sm:flex-shrink-0">
          <button
            onClick={handleAdd}
            disabled={!time.trim() || !activity.trim()}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 sm:w-auto"
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
                          isSwitch ? 'bg-amber-400' : 'bg-emerald-400'
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

      {/* History — calendar view */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          History
        </h2>

        {loading ? (
          <div className="py-6 text-center text-sm text-gray-400">
            Loading saved days…
          </div>
        ) : (
          <div className="space-y-4">
            {/* Calendar */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              {/* Month nav */}
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={() => shiftMonth(-1)}
                  aria-label="Previous month"
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="text-sm font-semibold text-gray-700">
                  {monthLabel}
                </div>
                <button
                  onClick={() => shiftMonth(1)}
                  aria-label="Next month"
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Weekday letters */}
              <div className="grid grid-cols-7 gap-1 pb-1 text-center text-[10px] font-semibold uppercase text-gray-400">
                {WEEKDAY_LETTERS.map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {monthCells.map((date) => {
                  const key = dayKeyFromDate(date);
                  const inMonth = date.getMonth() === viewMonth.month;
                  const hasData = entriesByDay.has(key);
                  const isSelected = key === selectedDayKey;
                  const isToday = key === todayKey;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDayKey(key)}
                      className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : hasData
                            ? 'text-gray-800 hover:bg-emerald-50'
                            : inMonth
                              ? 'text-gray-600 hover:bg-gray-50'
                              : 'text-gray-300 hover:bg-gray-50'
                      } ${isToday && !isSelected ? 'ring-1 ring-emerald-300' : ''}`}
                    >
                      <span>{date.getDate()}</span>
                      {hasData && (
                        <span
                          className={`absolute bottom-1 h-1 w-1 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-emerald-600'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected day's entries */}
            <div>
              <h3 className="mb-2 text-xs font-medium text-gray-500">
                {dayLabel(selectedDayKey)}
                {selectedEntries.length > 0 && (
                  <span className="ml-2 text-gray-400">
                    · {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'}
                  </span>
                )}
              </h3>
              {selectedEntries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-6 text-center text-sm text-gray-400">
                  {savedDayKeys.length === 0
                    ? 'Nothing saved yet. Use the button above to save today\u2019s log.'
                    : 'No entries saved for this day.'}
                </div>
              ) : (
                <div className="space-y-0.5 rounded-xl border border-gray-200 bg-white p-3">
                  {selectedEntries.map((entry, i) => {
                    const isSwitch =
                      i > 0 && entry.activity !== selectedEntries[i - 1].activity;
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
                            isSwitch ? 'bg-amber-300' : 'bg-emerald-300'
                          }`}
                        />
                        <span className="flex-1 text-sm text-gray-600">
                          {entry.activity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
