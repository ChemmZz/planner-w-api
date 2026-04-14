'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import PlannerProvider from '@/components/planner/PlannerContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');

  // Auth screens render fullscreen (no sidebar, no PlannerProvider context).
  if (isAuthRoute) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--color-surface-base)' }}
      >
        {children}
      </div>
    );
  }

  return (
    <PlannerProvider>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-surface-base)' }}>
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </main>
      </div>
    </PlannerProvider>
  );
}
