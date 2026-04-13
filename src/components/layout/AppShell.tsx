'use client';

import type { ReactNode } from 'react';
import PlannerProvider from '@/components/planner/PlannerContext';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <PlannerProvider>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-surface-base)' }}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </PlannerProvider>
  );
}
