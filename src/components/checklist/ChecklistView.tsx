'use client';

import { useCallback } from 'react';
import { usePlanner } from '@/components/planner/PlannerContext';
import { useHabits } from '@/lib/useHabits';
import { useCategories } from '@/lib/useCategories';
import ProgressBar from './ProgressBar';
import TaskCard from './TaskCard';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ChecklistView() {
  const { tasks, toggleTask } = usePlanner();
  const { habits, toggleCompletion, isCompleted } = useHabits();
  const { groups, byGroup, find: findCategory } = useCategories();

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Today&apos;s Checklist</h1>
        <p className="mt-1 text-sm text-gray-500">Check off tasks as you complete them.</p>
      </div>

      <ProgressBar done={done} total={total} />

      {groups.map((group) => {
        const groupCats = byGroup(group);
        const groupTasks = tasks.filter((t) =>
          groupCats.some((c) => c.id === t.categoryId)
        );
        if (groupTasks.length === 0) return null;

        return (
          <div key={group} className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {group}
            </h3>
            <div className="space-y-2">
              {groupTasks.map((task) => {
                const cat = findCategory(task.categoryId) ?? { id: task.categoryId, group: 'Other', label: task.categoryId, color: '#6b7280' };
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={cat}
                    onToggle={() => {
                      toggleTask(task.id);
                      // Sync habit completions: when a habit task is toggled,
                      // mirror the change to the habits tracking system.
                      if (task.categoryId === 'habit') {
                        const habit = habits.find((h) => h.name === task.text);
                        if (habit) {
                          const today = todayKey();
                          const doneNow = !task.done; // after toggle
                          const trackedNow = isCompleted(habit.id, today);
                          if (doneNow && !trackedNow) {
                            toggleCompletion(habit.id, today);
                          } else if (!doneNow && trackedNow) {
                            toggleCompletion(habit.id, today);
                          }
                        }
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {tasks.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          No tasks yet. Go to Intake to plan your day.
        </div>
      )}
    </div>
  );
}
