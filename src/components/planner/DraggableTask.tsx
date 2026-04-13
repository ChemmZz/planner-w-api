'use client';

import { useDraggable } from '@dnd-kit/core';
import type { TaskItem } from '@/types/planner';
import { CATEGORIES } from '@/lib/constants';

interface DraggableTaskProps {
  task: TaskItem;
  compact?: boolean;
  onToggleDone?: () => void;
}

export default function DraggableTask({ task, compact, onToggleDone }: DraggableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const cat = CATEGORIES.find((c) => c.id === task.categoryId);

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: 100,
      }
    : undefined;

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        className={`group mx-0.5 mt-0.5 flex items-center gap-1 overflow-hidden rounded border text-[9px] font-medium ${
          isDragging ? 'shadow-lg opacity-70' : ''
        }`}
        style={{
          ...style,
          backgroundColor: task.done ? '#f3f4f6' : `${cat?.color}15`,
          borderColor: `${cat?.color}40`,
          color: task.done ? '#9ca3af' : cat?.color,
        }}
      >
        {/* Drag handle */}
        <span
          {...listeners}
          {...attributes}
          className="cursor-grab px-0.5 py-0.5 text-gray-400 hover:text-gray-600"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
          </svg>
        </span>
        {/* Done toggle */}
        {onToggleDone && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleDone(); }}
            className={`flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-sm border ${
              task.done
                ? 'border-indigo-500 bg-indigo-500'
                : 'border-gray-300 hover:border-indigo-400'
            }`}
          >
            {task.done && (
              <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
        <span className={`truncate px-1 py-0.5 ${task.done ? 'line-through' : ''}`}>
          {task.text || '(untitled)'}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`cursor-grab rounded-lg border px-3 py-2 text-xs font-medium transition-shadow ${
        isDragging ? 'shadow-lg opacity-70' : 'shadow-sm'
      }`}
      style={{
        ...style,
        borderLeftWidth: '3px',
        borderLeftColor: cat?.color,
        backgroundColor: isDragging ? `${cat?.color}15` : 'white',
      }}
    >
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <span {...listeners} {...attributes} className="cursor-grab">
          <svg className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
          </svg>
        </span>
        {/* Done toggle */}
        {onToggleDone && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleDone(); }}
            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 ${
              task.done
                ? 'border-indigo-500 bg-indigo-500 text-white'
                : 'border-gray-300 hover:border-indigo-400'
            }`}
          >
            {task.done && (
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
        <span className={task.done ? 'line-through text-gray-400' : 'text-gray-700'}>
          {task.text || '(untitled)'}
        </span>
      </div>
    </div>
  );
}
