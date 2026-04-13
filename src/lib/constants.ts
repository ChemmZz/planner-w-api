import type { TaskCategory, HabitDef } from '@/types/planner';

export const CATEGORIES: TaskCategory[] = [
  { id: 'class-se', group: 'Classes', label: 'Software Engineering', color: '#6366f1' },
  { id: 'class-bds', group: 'Classes', label: 'Build, Design, Ship', color: '#8b5cf6' },
  { id: 'class-pe', group: 'Classes', label: 'Program Eval.', color: '#a78bfa' },
  { id: 'work-gradlounge', group: 'Work', label: 'GradLounge', color: '#f59e0b' },
  { id: 'work-demography', group: 'Work', label: 'Demography Workshop', color: '#f97316' },
  { id: 'personal-study', group: 'Personal Study', label: 'Personal Study', color: '#10b981' },
  { id: 'job-application', group: 'Job Application', label: 'Job Application', color: '#3b82f6' },
  { id: 'habit', group: 'Habits', label: 'Habits', color: '#ec4899' },
  { id: 'other', group: 'Other', label: 'Other', color: '#6b7280' },
];

export const CATEGORY_GROUPS = [...new Set(CATEGORIES.map((c) => c.group))];

export const HABIT_DEFS: HabitDef[] = [
  {
    id: 'habit-gym',
    label: 'Gym today?',
    tasks: [{ text: 'Gym' }],
  },
  {
    id: 'habit-reading',
    label: 'Reading today?',
    tasks: [
      { text: 'Reading — 30 min' },
      { text: 'Reading — 15 min' },
    ],
  },
];
