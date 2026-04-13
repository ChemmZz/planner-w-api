export function generateId(): string {
  return crypto.randomUUID();
}

export function formatHour(h: number): string {
  const hours = Math.floor(h);
  const mins = Math.round((h - hours) * 60);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const display = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${display}:${mins.toString().padStart(2, '0')} ${suffix}`;
}
