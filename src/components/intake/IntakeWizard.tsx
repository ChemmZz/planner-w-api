'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanner } from '@/components/planner/PlannerContext';
import StepHabits from './StepHabits';
import StepTasks from './StepTasks';
import type { WizardStep } from '@/types/planner';

const STEP_LABELS = ['Habits', 'Tasks'];

export default function IntakeWizard() {
  const { tasks, completeWizard } = usePlanner();
  const hasHabits = tasks.some((t) => t.categoryId === 'habit');
  const [step, setStep] = useState<WizardStep>(hasHabits ? 2 : 1);
  const router = useRouter();

  function handleFinish() {
    completeWizard();
    router.push('/checklist');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plan Your Day</h1>
        <p className="mt-1 text-sm text-gray-500">
          {step === 1 ? 'Select daily habits' : 'Add your tasks for today'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => {
          const stepNum = (i + 1) as WizardStep;
          const isActive = step === stepNum;
          const isDone = step > stepNum;
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && (
                <div className={`h-0.5 w-8 rounded ${isDone ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
              <button
                onClick={() => setStep(stepNum)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isDone ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </button>
              <span className={`text-xs font-medium ${isActive ? 'text-emerald-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {step === 1 && <StepHabits />}
        {step === 2 && <StepTasks />}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          disabled={step === 1}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
            step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {step === 2 ? 'Habits' : 'Back'}
        </button>

        {step < 2 ? (
          <button
            onClick={() => setStep(2)}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Tasks
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Start My Day
          </button>
        )}
      </div>
    </div>
  );
}
