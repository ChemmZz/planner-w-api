'use client';

export default function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  // Amber at 0%, transitions to emerald at 100%
  const barColor = pct >= 80 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#f97316';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-medium text-gray-500">
        <span>{done} of {total} done</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
