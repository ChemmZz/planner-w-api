'use client';

import { usePlanner } from '@/components/planner/PlannerContext';
import { CATEGORIES, CATEGORY_GROUPS } from '@/lib/constants';
import ProgressBar from './ProgressBar';
import TaskCard from './TaskCard';

export default function ChecklistView() {
  const { tasks, toggleTask } = usePlanner();

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Today&apos;s Checklist</h1>
        <p className="mt-1 text-sm text-gray-500">Check off tasks as you complete them.</p>
      </div>

      <ProgressBar done={done} total={total} />

      {CATEGORY_GROUPS.map((group) => {
        const groupCats = CATEGORIES.filter((c) => c.group === group);
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
                const cat = CATEGORIES.find((c) => c.id === task.categoryId)!;
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={cat}
                    onToggle={() => toggleTask(task.id)}
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
