'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import PlannerProvider from '@/components/planner/PlannerContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        {/* Desktop sidebar — always visible at md+ */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile drawer overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <div className="relative z-50">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenuToggle={() => setSidebarOpen((v) => !v)} />
          <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
    </PlannerProvider>
  );
}
