import type { AdminRequest } from './firebase';

export function sanitizeCsvCell(value: unknown): string {
  const raw = String(value ?? '');
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function requestsToCsv(requests: AdminRequest[]): string {
  const fields: (keyof AdminRequest)[] = ['reference', 'name', 'email', 'phone', 'organisation', 'projectType', 'budgetRange', 'preferredTimeline', 'preferredContact', 'status', 'priority', 'createdAt'];
  return [fields.map(sanitizeCsvCell).join(','), ...requests.map((request) => fields.map((field) => sanitizeCsvCell(formatCell(request[field]))).join(','))].join('\r\n');
}

function formatCell(value: unknown): unknown {
  if (value && typeof value === 'object' && 'seconds' in value) return new Date(Number((value as { seconds: number }).seconds) * 1000).toISOString();
  if (Array.isArray(value)) return value.join('; ');
  return value;
}
