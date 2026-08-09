import { describe, expect, it, vi } from 'vitest';
import { clearDraft, emptyRequest, loadDraft, normalizeEmail, requestSchema, saveDraft } from '../lib/requestSchema';

const complete = () => ({ ...emptyRequest(), name: 'Ama Mensah', email: 'ama@example.com', organisation: 'Campus Lab', projectType: 'Website', projectSummary: 'A clear website for a student research group.', problemStatement: 'Information is scattered across several channels.', targetUsers: 'Students and partner organisations.', features: 'Project pages, contact form and resource library.', preferredTimeline: 'Flexible', budgetRange: 'I need guidance', preferredContact: 'Email', contactConsent: true, startedAt: Date.now() - 5_000 });

describe('request form schema', () => {
  it('accepts a complete request and normalises email', () => { expect(requestSchema.safeParse(complete()).success).toBe(true); expect(normalizeEmail(' AMA@Example.COM ')).toBe('ama@example.com'); });
  it('rejects missing contact consent and short descriptions', () => { expect(requestSchema.safeParse({ ...complete(), contactConsent: false, projectSummary: 'Too short' }).success).toBe(false); });
  it('keeps marketing consent separate and off by default', () => { const request = complete(); expect(request.marketingConsent).toBe(false); expect(request.contactConsent).toBe(true); });
  it('keeps SMS consent optional and off by default', () => { const request = complete(); expect(request.smsConsent).toBe(false); });
  it('restores a recent local draft and clears it', () => { vi.useFakeTimers(); saveDraft(complete()); expect(loadDraft()?.name).toBe('Ama Mensah'); clearDraft(); expect(loadDraft()).toBeNull(); vi.useRealTimers(); });
});
