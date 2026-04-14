'use client';

import { UserButton } from '@clerk/nextjs';
import { useLogHistory } from '@/lib/useLogHistory';

function TrashIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
      />
    </svg>
  );
}

export default function TopBar() {
  const { deleteAllHistory, savedHistory } = useLogHistory();

  async function handleDeleteHistory() {
    const n = savedHistory.length;
    const msg =
      n === 0
        ? 'You have no saved log entries to delete. Proceed anyway?'
        : `Delete all ${n} saved log entr${n === 1 ? 'y' : 'ies'}? This cannot be undone. Your current session (unsaved) entries are not affected.`;
    if (!window.confirm(msg)) return;
    const ok = await deleteAllHistory();
    if (!ok) {
      window.alert('Could not delete history. Check the console for details.');
    }
  }

  return (
    <header
      className="flex h-14 flex-shrink-0 items-center justify-end gap-3 border-b px-6"
      style={{
        backgroundColor: 'var(--color-surface-raised)',
        borderColor: 'var(--color-surface-border)',
      }}
    >
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action label="manageAccount" />
          <UserButton.Action
            label="Delete log history"
            labelIcon={<TrashIcon />}
            onClick={handleDeleteHistory}
          />
          <UserButton.Action label="signOut" />
        </UserButton.MenuItems>
      </UserButton>
    </header>
  );
}
