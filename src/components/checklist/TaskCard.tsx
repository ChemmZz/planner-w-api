'use client';

import type { TaskItem, TaskCategory } from '@/types/planner';

interface TaskCardProps {
  task: TaskItem;
  category: TaskCategory;
  onToggle: () => void;
}

export default function TaskCard({ task, category, onToggle }: TaskCardProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm transition-opacity ${
        task.done ? 'opacity-50' : ''
      }`}
      style={{ borderLeftWidth: '4px', borderLeftColor: category.color }}
    >
      <button
        onClick={onToggle}
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
          task.done
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-gray-300 hover:border-emerald-400'
        }`}
      >
        {task.done && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.text || '(untitled task)'}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {/* Deadline badge */}
          {task.deadlineType === 'hard' && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
              Hard{task.deadlineDate ? ` · ${task.deadlineDate}` : ''}
            </span>
          )}
          {task.deadlineType === 'soft' && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
              Soft{task.deadlineDate ? ` · ${task.deadlineDate}` : ''}
            </span>
          )}

          {/* Event type */}
          {task.eventType && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                task.eventType === 'productive'
                  ? 'bg-emerald-100 text-emerald-700'
                  : task.eventType === 'social'
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-amber-100 text-amber-700'
              }`}
            >
              {task.eventType}
            </span>
          )}

          {/* Note */}
          {task.note && (
            <span className="text-[10px] text-gray-400 truncate max-w-[200px]" title={task.note}>
              {task.note}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
