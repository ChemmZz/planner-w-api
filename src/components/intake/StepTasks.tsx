'use client';

import { useState } from 'react';
import { usePlanner } from '@/components/planner/PlannerContext';
import { useCategories } from '@/lib/useCategories';
import type { DeadlineType, EventType } from '@/types/planner';

const PRESET_COLORS = ['#059669', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899', '#f97316', '#10b981', '#6b7280'];

export default function StepTasks() {
  const { tasks, addTask, removeTask, updateTaskText, setTaskDeadline, setTaskEventType, setTaskNote } = usePlanner();
  const { categories, groups, byGroup, addCategory, deleteCategory } = useCategories();

  // Only show user-created categories in the task form (no system defaults)
  const userGroups = [...new Set(categories.filter((c) => c.userId).map((c) => c.group))];
  const userByGroup = (group: string) => categories.filter((c) => c.group === group && c.userId);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCatGroup, setNewCatGroup] = useState('');
  const [newCatGroupCustom, setNewCatGroupCustom] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatColor, setNewCatColor] = useState('#059669');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Tasks for Today</h2>
        <p className="text-sm text-gray-500">
          Add tasks by category. Set deadlines and tags as needed.
        </p>
      </div>

      {userGroups.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center">
          <p className="text-sm text-gray-500">No categories yet.</p>
          <button
            onClick={() => setShowCategoryManager(true)}
            className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Create your first category
          </button>
        </div>
      )}

      {userGroups.map((group) => {
        const groupCats = userByGroup(group);
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
                          className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-emerald-300"
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
                          className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 outline-none focus:border-emerald-300"
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

      {/* Category manager */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => setShowCategoryManager((v) => !v)}
          className="text-xs font-medium text-gray-400 hover:text-emerald-600 transition-colors"
        >
          {showCategoryManager ? 'Hide category manager' : '+ Manage categories'}
        </button>

        {showCategoryManager && (
          <div className="mt-3 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            {/* Add category (group can be existing or new) */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
                Add category
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <select
                    value={newCatGroup}
                    onChange={(e) => {
                      setNewCatGroup(e.target.value);
                      if (e.target.value !== '__new__') setNewCatGroupCustom('');
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-emerald-300"
                  >
                    <option value="">Group…</option>
                    {userGroups.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                    <option value="__new__">+ New group…</option>
                  </select>
                  {newCatGroup === '__new__' && (
                    <input
                      type="text"
                      value={newCatGroupCustom}
                      onChange={(e) => setNewCatGroupCustom(e.target.value)}
                      placeholder="Group name"
                      autoFocus
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-emerald-300"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    placeholder="Category name"
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-emerald-300"
                  />
                  <div className="flex gap-1 items-center">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCatColor(c)}
                        className={`h-5 w-5 rounded-full ${newCatColor === c ? 'ring-2 ring-offset-1' : ''}`}
                        style={{ backgroundColor: c, outlineColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const group = newCatGroup === '__new__' ? newCatGroupCustom.trim() : newCatGroup;
                    if (!group || !newCatLabel.trim()) return;
                    await addCategory(group, newCatLabel.trim(), newCatColor);
                    setNewCatLabel('');
                    if (newCatGroup === '__new__') {
                      setNewCatGroup(group);
                      setNewCatGroupCustom('');
                    }
                  }}
                  disabled={
                    (!newCatGroup || (newCatGroup === '__new__' && !newCatGroupCustom.trim())) ||
                    !newCatLabel.trim()
                  }
                  className="self-start rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400"
                >
                  Add category
                </button>
              </div>
            </div>

            {/* List user-created categories with delete */}
            {userGroups.map((group) => {
              const cats = userByGroup(group);
              if (cats.length === 0) return null;
              return (
                <div key={group}>
                  <p className="text-[10px] font-semibold uppercase text-gray-400 mb-1">{group}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cats.map((cat) => (
                      <span
                        key={cat.id}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.label}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${cat.label}"?`)) deleteCategory(cat.id);
                          }}
                          className="ml-0.5 hover:opacity-70"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
