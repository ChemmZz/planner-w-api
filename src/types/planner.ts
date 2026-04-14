export type TaskCategoryId = string;

export interface TaskCategory {
  id: TaskCategoryId;
  group: string;
  label: string;
  color: string;
  parentId?: string | null;
  userId?: string | null;
}

export type DeadlineType = 'none' | 'soft' | 'hard';

export type EventType = 'productive' | 'social' | 'flexible';

export type EisenhowerQuadrant = 'do' | 'schedule' | 'delegate' | 'delete';

export interface TaskItem {
  id: string;
  categoryId: TaskCategoryId;
  text: string;
  done: boolean;
  deadlineType: DeadlineType;
  deadlineDate?: string;
  eventType?: EventType;
  note?: string;
  quadrant?: EisenhowerQuadrant;
}

export type WizardStep = 1 | 2;

export interface LogEntry {
  id: string;
  time: string;
  activity: string;
  createdAt: number;
}

export interface PlannerState {
  tasks: TaskItem[];
  logEntries: LogEntry[];
  wizardComplete: boolean;
}
