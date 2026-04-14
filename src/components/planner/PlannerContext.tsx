'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  DeadlineType,
  EisenhowerQuadrant,
  EventType,
  LogEntry,
  TaskCategoryId,
  TaskItem,
} from '@/types/planner';
import { generateId } from '@/lib/utils';

export interface TimerState {
  mode: 'work' | 'break';
  isRunning: boolean;
  startedAt: number | null;
  accumulated: number;
  workElapsed: number;
  breakDuration: number;
  sessionCount: number;
  selectedTaskId: string | null;
  isResetting: boolean;
}

interface PlannerActions {
  addTask: (categoryId: TaskCategoryId, text: string) => void;
  removeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  updateTaskText: (id: string, text: string) => void;
  setTaskDeadline: (id: string, type: DeadlineType, date?: string) => void;
  setTaskEventType: (id: string, eventType: EventType | undefined) => void;
  setTaskNote: (id: string, note: string) => void;
  setTaskQuadrant: (id: string, quadrant: EisenhowerQuadrant | undefined) => void;

  addLogEntry: (time: string, activity: string) => void;
  removeLogEntry: (id: string) => void;

  completeWizard: () => void;
  resetDay: () => void;

  timerStart: () => void;
  timerPause: () => void;
  timerFinishWork: () => void;
  timerReset: () => void;
  timerResetComplete: () => void;
  timerSetTask: (id: string | null) => void;
}

interface PlannerContextValue extends PlannerActions {
  tasks: TaskItem[];
  logEntries: LogEntry[];
  wizardComplete: boolean;
  timer: TimerState;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function usePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used inside PlannerProvider');
  return ctx;
}

const INITIAL_TIMER: TimerState = {
  mode: 'work',
  isRunning: false,
  startedAt: null,
  accumulated: 0,
  workElapsed: 0,
  breakDuration: 0,
  sessionCount: 1,
  selectedTaskId: null,
  isResetting: false,
};

export default function PlannerProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [wizardComplete, setWizardComplete] = useState(false);
  const [timer, setTimer] = useState<TimerState>(INITIAL_TIMER);

  const addTask = useCallback((categoryId: TaskCategoryId, text: string) => {
    const task: TaskItem = {
      id: generateId(),
      categoryId,
      text,
      done: false,
      deadlineType: 'none',
    };
    setTasks((prev) => [...prev, task]);
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const updateTaskText = useCallback((id: string, text: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text } : t))
    );
  }, []);

  const setTaskDeadline = useCallback(
    (id: string, type: DeadlineType, date?: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, deadlineType: type, deadlineDate: type === 'none' ? undefined : date }
            : t
        )
      );
    },
    []
  );

  const setTaskEventType = useCallback(
    (id: string, eventType: EventType | undefined) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, eventType } : t))
      );
    },
    []
  );

  const setTaskNote = useCallback((id: string, note: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, note } : t))
    );
  }, []);

  const setTaskQuadrant = useCallback(
    (id: string, quadrant: EisenhowerQuadrant | undefined) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, quadrant } : t))
      );
    },
    []
  );

  const addLogEntry = useCallback((time: string, activity: string) => {
    setLogEntries((prev) => [
      ...prev,
      { id: generateId(), time, activity, createdAt: Date.now() },
    ]);
  }, []);

  const removeLogEntry = useCallback((id: string) => {
    setLogEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const completeWizard = useCallback(() => setWizardComplete(true), []);
  const resetDay = useCallback(() => {
    setTasks([]);
    setLogEntries([]);
    setWizardComplete(false);
  }, []);

  const timerStart = useCallback(() => {
    setTimer((prev) => ({ ...prev, isRunning: true, startedAt: Date.now() }));
  }, []);

  const timerPause = useCallback(() => {
    setTimer((prev) => {
      const runSecs = prev.startedAt ? Math.round((Date.now() - prev.startedAt) / 1000) : 0;
      const newAccumulated = prev.accumulated + runSecs;
      return {
        ...prev,
        isRunning: false,
        startedAt: null,
        accumulated: newAccumulated,
        workElapsed: prev.mode === 'work' ? newAccumulated : prev.workElapsed,
      };
    });
  }, []);

  const timerFinishWork = useCallback(() => {
    setTimer((prev) => {
      const runSecs = prev.startedAt ? Math.round((Date.now() - prev.startedAt) / 1000) : 0;
      const totalWork = prev.accumulated + runSecs;
      return {
        ...prev,
        mode: 'break',
        isRunning: false,
        startedAt: null,
        accumulated: 0,
        workElapsed: totalWork,
        breakDuration: Math.ceil(totalWork * 0.2),
      };
    });
  }, []);

  const timerReset = useCallback(() => {
    setTimer((prev) => {
      // Nothing to destroy — instant reset
      if (prev.accumulated === 0 && prev.workElapsed === 0 && !prev.startedAt) {
        return { ...INITIAL_TIMER, sessionCount: prev.sessionCount, selectedTaskId: prev.selectedTaskId };
      }
      // Pause timer but keep workElapsed so scene stays visible during meteorite
      const runSecs = prev.startedAt ? Math.round((Date.now() - prev.startedAt) / 1000) : 0;
      return {
        ...prev,
        isRunning: false,
        startedAt: null,
        accumulated: prev.accumulated + runSecs,
        workElapsed: prev.mode === 'work' ? prev.accumulated + runSecs : prev.workElapsed,
        isResetting: true,
      };
    });
  }, []);

  const timerResetComplete = useCallback(() => {
    setTimer((prev) => ({
      ...INITIAL_TIMER,
      sessionCount: prev.sessionCount,
      selectedTaskId: prev.selectedTaskId,
    }));
  }, []);

  const timerSetTask = useCallback((id: string | null) => {
    setTimer((prev) => ({ ...prev, selectedTaskId: id }));
  }, []);

  return (
    <PlannerContext.Provider
      value={{
        tasks,
        logEntries,
        wizardComplete,
        timer,
        addTask,
        removeTask,
        toggleTask,
        updateTaskText,
        setTaskDeadline,
        setTaskEventType,
        setTaskNote,
        setTaskQuadrant,
        addLogEntry,
        removeLogEntry,
        completeWizard,
        resetDay,
        timerStart,
        timerPause,
        timerFinishWork,
        timerReset,
        timerResetComplete,
        timerSetTask,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}
