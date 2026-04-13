'use client';

import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { usePlanner } from '@/components/planner/PlannerContext';
import { CATEGORIES, CATEGORY_GROUPS } from '@/lib/constants';
import type { EisenhowerQuadrant } from '@/types/planner';
import DraggableTask from './DraggableTask';

const QUADRANTS: { id: EisenhowerQuadrant; label: string; subtitle: string; color: string; bg: string }[] = [
  { id: 'do', label: 'Do', subtitle: 'Urgent & Important', color: '#ef4444', bg: 'rgba(239,68,68,0.06)' },
  { id: 'schedule', label: 'Schedule', subtitle: 'Not Urgent & Important', color: '#3b82f6', bg: 'rgba(59,130,246,0.06)' },
  { id: 'delegate', label: 'Delegate', subtitle: 'Urgent & Not Important', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
  { id: 'delete', label: 'Delete', subtitle: 'Not Urgent & Not Important', color: '#6b7280', bg: 'rgba(107,114,128,0.06)' },
];

function DroppableQuadrant({
  quadrant,
  children,
}: {
  quadrant: typeof QUADRANTS[number];
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `quadrant-${quadrant.id}` });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border-2 p-4 transition-colors min-h-[200px] ${isOver ? 'ring-2 ring-offset-1' : ''}`}
      style={{
        borderColor: `${quadrant.color}30`,
        backgroundColor: isOver ? `${quadrant.color}10` : quadrant.bg,
        // @ts-expect-error custom property
        '--tw-ring-color': quadrant.color,
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: quadrant.color }} />
        <h3 className="text-sm font-bold" style={{ color: quadrant.color }}>
          {quadrant.label}
        </h3>
        <span className="text-[10px] text-gray-400">{quadrant.subtitle}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export default function PlannerView() {
  const { tasks, toggleTask, setTaskQuadrant } = usePlanner();

  const unassigned = tasks.filter((t) => !t.quadrant);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const overId = over.id as string;

    // Dropping on a quadrant
    const quadrantMatch = overId.match(/^quadrant-(.+)$/);
    if (quadrantMatch) {
      setTaskQuadrant(active.id as string, quadrantMatch[1] as EisenhowerQuadrant);
      return;
    }

    // Dropping on the unassigned pool
    if (overId === 'unassigned-pool') {
      setTaskQuadrant(active.id as string, undefined);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="space-y-4 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eisenhower Matrix</h1>
          <p className="mt-1 text-sm text-gray-500">
            Drag tasks into quadrants to prioritize. Check them off when done.
          </p>
        </div>

        {/* Matrix grid */}
        <div className="grid grid-cols-2 gap-3">
          {QUADRANTS.map((q) => {
            const qTasks = tasks.filter((t) => t.quadrant === q.id);
            return (
              <DroppableQuadrant key={q.id} quadrant={q}>
                {qTasks.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    Drop tasks here
                  </p>
                ) : (
                  qTasks.map((task) => (
                    <DraggableTask
                      key={task.id}
                      task={task}
                      onToggleDone={() => toggleTask(task.id)}
                    />
                  ))
                )}
              </DroppableQuadrant>
            );
          })}
        </div>

        {/* Unassigned tasks */}
        <UnassignedPool>
          {unassigned.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">All tasks are assigned to a quadrant!</p>
          ) : (
            <div className="space-y-2">
              {CATEGORY_GROUPS.map((group) => {
                const groupCats = CATEGORIES.filter((c) => c.group === group);
                const groupTasks = unassigned.filter((t) =>
                  groupCats.some((c) => c.id === t.categoryId)
                );
                if (groupTasks.length === 0) return null;
                return (
                  <div key={group} className="space-y-1">
                    <p className="text-[10px] font-semibold uppercase text-gray-400">{group}</p>
                    {groupTasks.map((task) => (
                      <DraggableTask
                        key={task.id}
                        task={task}
                        onToggleDone={() => toggleTask(task.id)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </UnassignedPool>
      </div>
    </DndContext>
  );
}

function UnassignedPool({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: 'unassigned-pool' });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors ${
        isOver ? 'bg-gray-50 ring-2 ring-gray-300' : ''
      }`}
    >
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Unassigned Tasks
      </h3>
      {children}
    </div>
  );
}
