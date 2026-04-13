'use client';

import { useState } from 'react';
import { usePlanner } from '@/components/planner/PlannerContext';
import { CATEGORIES, CATEGORY_GROUPS } from '@/lib/constants';
import type { DeadlineType, EventType } from '@/types/planner';

export default function StepTasks() {
  const { tasks, addTask, removeTask, updateTaskText, setTaskDeadline, setTaskEventType, setTaskNote } = usePlanner();
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Tasks for Today</h2>
        <p className="text-sm text-gray-500">
          Add tasks by category. Set deadlines and tags as needed.
        </p>
      </div>

      {CATEGORY_GROUPS.map((group) => {
        const groupCats = CATEGORIES.filter((c) => c.group === group);
        return (
          <div key={group} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              {group}
            </h3>
            {groupCats.map((cat) => {
              const catTasks = tasks.filter((t) => t.categoryId === cat.id);
              return (
                <div key={cat.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {cat.label}
                    </span>
                  </div>

                  {catTasks.map((task) => (
                    <div
                      key={task.id}
                      className="ml-5 space-y-2 rounded-lg border border-gray-200 bg-white p-3"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={task.text}
                          onChange={(e) => updateTaskText(task.id, e.target.value)}
                          placeholder="Describe the task…"
                          className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-indigo-300"
                        />
                        <button
                          onClick={() => removeTask(task.id)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Deadline + Event Type row */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Deadline */}
                        <select
                          value={task.deadlineType}
                          onChange={(e) =>
                            setTaskDeadline(task.id, e.target.value as DeadlineType)
                          }
                          className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600"
                        >
                          <option value="none">No deadline</option>
                          <option value="soft">Soft deadline</option>
                          <option value="hard">Hard deadline</option>
                        </select>

                        {task.deadlineType !== 'none' && (
                          <input
                            type="date"
                            value={task.deadlineDate || ''}
                            onChange={(e) =>
                              setTaskDeadline(task.id, task.deadlineType, e.target.value)
                            }
                            className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600"
                          />
                        )}

                        {/* Event type tags */}
                        {(['productive', 'social', 'flexible'] as EventType[]).map((et) => (
                          <button
                            key={et}
                            onClick={() =>
                              setTaskEventType(task.id, task.eventType === et ? undefined : et)
                            }
                            className={`rounded-full px-2.5 py-0.5 font-medium transition-colors ${
                              task.eventType === et
                                ? et === 'productive'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : et === 'social'
                                    ? 'bg-pink-100 text-pink-700'
                                    : 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {et}
                          </button>
                        ))}

                        {/* Note toggle */}
                        <button
                          onClick={() =>
                            setExpandedNote(expandedNote === task.id ? null : task.id)
                          }
                          className="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-400 hover:bg-gray-200"
                        >
                          {expandedNote === task.id ? 'hide note' : '+ note'}
                        </button>
                      </div>

                      {/* Note field */}
                      {expandedNote === task.id && (
                        <input
                          type="text"
                          value={task.note || ''}
                          onChange={(e) => setTaskNote(task.id, e.target.value)}
                          placeholder="Add context (e.g. meeting with Alex to study)"
                          className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 outline-none focus:border-indigo-300"
                        />
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => addTask(cat.id, '')}
                    className="ml-5 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add task
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
