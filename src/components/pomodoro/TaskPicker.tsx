'use client';

import { usePlanner } from '@/components/planner/PlannerContext';
import { CATEGORIES } from '@/lib/constants';

interface TaskPickerProps {
  selectedTaskId: string | null;
  onSelect: (id: string | null) => void;
}

export default function TaskPicker({ selectedTaskId, onSelect }: TaskPickerProps) {
  const { tasks } = usePlanner();
  const activeTasks = tasks.filter((t) => !t.done);

  if (activeTasks.length === 0) return null;

  const selected = tasks.find((t) => t.id === selectedTaskId);
  const selectedCat = selected
    ? CATEGORIES.find((c) => c.id === selected.categoryId)
    : null;

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Focusing on
      </label>
      <select
        value={selectedTaskId || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-300"
      >
        <option value="">Select a task…</option>
        {activeTasks.map((task) => {
          const cat = CATEGORIES.find((c) => c.id === task.categoryId);
          return (
            <option key={task.id} value={task.id}>
              [{cat?.label}] {task.text || '(untitled)'}
            </option>
          );
        })}
      </select>

      {selected && (
        <div
          className="rounded-lg border px-3 py-2 text-sm font-medium"
          style={{
            borderColor: `${selectedCat?.color}40`,
            color: selectedCat?.color,
            backgroundColor: `${selectedCat?.color}10`,
          }}
        >
          {selected.text}
        </div>
      )}
    </div>
  );
}
