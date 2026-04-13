export type TaskCategoryId =
  | 'class-se'
  | 'class-bds'
  | 'class-pe'
  | 'work-gradlounge'
  | 'work-demography'
  | 'personal-study'
  | 'job-application'
  | 'habit'
  | 'other';

export interface TaskCategory {
  id: TaskCategoryId;
  group: 'Classes' | 'Work' | 'Personal Study' | 'Job Application' | 'Habits' | 'Other';
  label: string;
  color: string;
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

export interface HabitDef {
  id: string;
  label: string;
  /** Tasks to create when this habit is selected */
  tasks: { text: string }[];
}

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
