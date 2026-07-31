import { describe, expect, it } from 'vitest';
import { requestsToCsv, sanitizeCsvCell } from '../lib/csv';
import type { AdminRequest } from '../lib/firebase';

describe('CSV export', () => {
  it('neutralises formula-like cells', () => { expect(sanitizeCsvCell('=IMPORTXML("bad")')).toBe('"\'=IMPORTXML(""bad"")"'); expect(sanitizeCsvCell('+233000')).toBe('"\'+233000"'); });
  it('exports permitted fields without internal notes', () => { const request = { id: 'abc', reference: 'PWS-2026-ABC234', name: 'Ama', email: 'ama@example.com', organisation: 'Lab', projectType: 'Website', projectSummary: 'Private detail', problemStatement: 'Problem', targetUsers: 'Users', features: 'Features', budgetRange: 'Guidance', preferredTimeline: 'Flexible', preferredContact: 'Email', contactConsent: true, marketingConsent: false, status: 'new', priority: 'normal', internalNotes: 'Do not export' } as AdminRequest; const csv = requestsToCsv([request]); expect(csv).toContain('PWS-2026-ABC234'); expect(csv).not.toContain('Do not export'); expect(csv).not.toContain('Private detail'); });
});
