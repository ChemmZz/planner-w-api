'use client';

import { useMemo, useState } from 'react';
import { useHabits } from '@/lib/useHabits';

// ---- helpers ---------------------------------------------------------------
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function weekdayLetter(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en', { weekday: 'narrow' });
}

/** Returns the Monday of the week containing `dateStr`. */
function startOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(dateStr, diff);
}

/** Build a 7-day array (Mon–Sun) for the week containing today. */
function currentWeekDays(): string[] {
  const mon = startOfWeek(todayKey());
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}

/** Build a grid for the last `weeks` weeks (columns) × 7 rows (Mon–Sun). */
function contributionGrid(weeks: number): string[][] {
  const today = todayKey();
  const endMonday = startOfWeek(today);
  const startMonday = addDays(endMonday, -(weeks - 1) * 7);
  const grid: string[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: string[] = [];
    for (let d = 0; d < 7; d++) {
      col.push(addDays(startMonday, w * 7 + d));
    }
    grid.push(col);
  }
  return grid;
}

const PRESET_COLORS = ['#059669', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];
const PRESET_ICONS = ['🏋️', '📖', '🧘', '🏃', '💧', '🎸', '🎨', '💤', '🥗', '📝', '✅'];

// ---- components ------------------------------------------------------------

function WeekRow({
  habitId,
  isCompleted,
  toggleCompletion,
  color,
}: {
  habitId: string;
  isCompleted: (id: string, date: string) => boolean;
  toggleCompletion: (id: string, date: string) => Promise<boolean>;
  color: string;
}) {
  const days = useMemo(currentWeekDays, []);
  const today = todayKey();

  return (
    <div className="flex gap-1.5">
      {days.map((day) => {
        const done = isCompleted(habitId, day);
        const isToday = day === today;
        const isFuture = day > today;
        return (
          <button
            key={day}
            disabled={isFuture}
            onClick={() => toggleCompletion(habitId, day)}
            title={`${weekdayLetter(day)} — ${day}${done ? ' ✓' : ''}`}
            className={`flex h-8 w-8 flex-col items-center justify-center rounded-full text-[10px] font-medium transition-all ${
              isFuture
                ? 'cursor-not-allowed bg-gray-100 text-gray-300'
                : done
                  ? 'text-white shadow-sm'
                  : isToday
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            style={
              done
                ? { backgroundColor: color }
                : isToday
                  ? { outline: `2px solid ${color}`, outlineOffset: '1px' }
                  : undefined
            }
          >
            <span>{weekdayLetter(day)}</span>
          </button>
        );
      })}
    </div>
  );
}

function ContributionGrid({
  habitId,
  isCompleted,
  color,
}: {
  habitId: string;
  isCompleted: (id: string, date: string) => boolean;
  color: string;
}) {
  const grid = useMemo(() => contributionGrid(12), []);
  const today = todayKey();

  return (
    <div className="flex gap-[3px]">
      {grid.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((day) => {
            const done = isCompleted(habitId, day);
            const isFuture = day > today;
            return (
              <div
                key={day}
                title={day}
                className={`h-2.5 w-2.5 rounded-sm ${
                  isFuture
                    ? 'bg-gray-100'
                    : done
                      ? ''
                      : 'bg-gray-200'
                }`}
                style={done ? { backgroundColor: color } : undefined}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function HabitCard({
  habit,
  isCompleted,
  toggleCompletion,
  getStreak,
  onArchive,
}: {
  habit: { id: string; name: string; icon: string; color: string };
  isCompleted: (id: string, date: string) => boolean;
  toggleCompletion: (id: string, date: string) => Promise<boolean>;
  getStreak: (id: string) => number;
  onArchive: (id: string) => void;
}) {
  const streak = getStreak(habit.id);
  const today = todayKey();
  const doneToday = isCompleted(habit.id, today);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{habit.icon}</span>
          <h3 className="text-sm font-semibold text-gray-900">{habit.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${habit.color}15`, color: habit.color }}>
              <span>🔥</span>
              <span>{streak}d</span>
            </div>
          )}
          <button
            onClick={() => toggleCompletion(habit.id, today)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
              doneToday ? 'text-white shadow-sm' : 'border-2 bg-white'
            }`}
            style={
              doneToday
                ? { backgroundColor: habit.color }
                : { borderColor: habit.color, color: habit.color }
            }
            title={doneToday ? 'Mark as not done' : 'Mark as done today'}
          >
            {doneToday ? '✓' : ''}
          </button>
        </div>
      </div>

      {/* Week view */}
      <WeekRow
        habitId={habit.id}
        isCompleted={isCompleted}
        toggleCompletion={toggleCompletion}
        color={habit.color}
      />

      {/* Contribution grid */}
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase text-gray-400">Last 12 weeks</p>
        <ContributionGrid
          habitId={habit.id}
          isCompleted={isCompleted}
          color={habit.color}
        />
      </div>

      {/* Archive */}
      <div className="flex justify-end">
        <button
          onClick={() => onArchive(habit.id)}
          className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function AddHabitForm({ onAdd }: { onAdd: (name: string, icon: string, color: string) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✅');
  const [color, setColor] = useState('#059669');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = await onAdd(name.trim(), icon, color);
    if (ok) {
      setName('');
      setIcon('✅');
      setColor('#059669');
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border-2 border-dashed border-gray-200 py-4 text-sm font-medium text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
      >
        + Add a habit
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3"
    >
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
          Habit name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Meditate, Run, Read…"
          autoFocus
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-300"
        />
      </div>

      {/* Icon picker */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
          Icon
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-base transition-all ${
                icon === ic ? 'bg-emerald-50 ring-2 ring-emerald-400' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
          Color
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full transition-all ${
                color === c ? '' : 'hover:scale-110'
              }`}
              style={{
                backgroundColor: c,
                ...(color === c ? { outline: `2px solid ${c}`, outlineOffset: '3px' } : {}),
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---- main view -------------------------------------------------------------

export default function HabitsView() {
  const {
    habits,
    loading,
    error,
    addHabit,
    archiveHabit,
    toggleCompletion,
    getStreak,
    isCompleted,
  } = useHabits();

  function handleArchive(id: string) {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    if (!window.confirm(`Remove "${habit.name}"? You can't undo this.`)) return;
    archiveHabit(id);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your daily habits. Build streaks. Stay consistent.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">
          Loading habits…
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompleted={isCompleted}
              toggleCompletion={toggleCompletion}
              getStreak={getStreak}
              onArchive={handleArchive}
            />
          ))}
          <AddHabitForm onAdd={addHabit} />
        </div>
      )}
    </div>
  );
}
