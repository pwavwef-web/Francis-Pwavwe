import { describe, expect, it, vi } from 'vitest';
import { buildAdminEmail, buildEmailMessages, buildTestimonialEmails, generateReference, processSubmission, validateBuildRequest, validateTestimonial, type SubmissionDependencies } from '../src/domain.js';

const valid = {
  name: '  Ama Mensah  ', email: ' AMA@Example.COM ', phone: '', organisation: 'Campus Lab', projectType: 'Website',
  projectSummary: 'A clear website for a student research group.', problemStatement: 'Information is scattered across several channels.',
  targetUsers: 'Students, researchers and potential partners.', features: 'Project pages, contact form and resource library.',
  existingWebsite: '', referenceLinks: '', budgetRange: 'I need guidance', preferredTimeline: 'Flexible', preferredContact: 'Email',
  discoverySource: '', additionalNotes: '', contactConsent: true, marketingConsent: false, website: '', startedAt: Date.now() - 10_000,
};

function dependencies(overrides: Partial<SubmissionDependencies> = {}): SubmissionDependencies {
  return {
    store: vi.fn().mockResolvedValue({ requestId: 'request123456', reference: 'PWS-2026-ABC234' }),
    storeMarketingConsent: vi.fn().mockResolvedValue(undefined),
    sendEmail: vi.fn().mockResolvedValue(undefined),
    markEmailStatus: vi.fn().mockResolvedValue(undefined),
    projectsInbox: 'projects@pwavwe.com', publicSiteUrl: 'https://build.pwavwe.com', ...overrides,
  };
}

describe('request domain', () => {
  it('normalises email and trims text', () => { const parsed = validateBuildRequest(valid); expect(parsed.email).toBe('ama@example.com'); expect(parsed.name).toBe('Ama Mensah'); });
  it('rejects invalid consent and spam timing', () => { expect(() => validateBuildRequest({ ...valid, contactConsent: false })).toThrow(); expect(() => validateBuildRequest({ ...valid, startedAt: Date.now() })).toThrow(); });
  it('creates a stable, non-ambiguous public reference shape', () => { expect(generateReference(2026, () => Buffer.from([0, 1, 2, 3, 4]))).toMatch(/^PWS-2026-[A-HJ-NP-Z2-9]{6}$/); });
  it('stores marketing consent separately only when selected', async () => { const deps = dependencies(); await processSubmission(valid, deps); expect(deps.storeMarketingConsent).not.toHaveBeenCalled(); const optedIn = dependencies(); await processSubmission({ ...valid, marketingConsent: true }, optedIn); expect(optedIn.storeMarketingConsent).toHaveBeenCalledOnce(); });
  it('returns success when email fails after storage', async () => { const deps = dependencies({ sendEmail: vi.fn().mockRejectedValue(new Error('SMTP unavailable')) }); const result = await processSubmission(valid, deps); expect(result).toEqual({ reference: 'PWS-2026-ABC234', emailDelayed: true }); expect(deps.store).toHaveBeenCalledOnce(); expect(deps.markEmailStatus).toHaveBeenCalledWith('request123456', 'delayed'); });
  it('builds canonical, non-marketing emails', () => { const messages = buildEmailMessages(validateBuildRequest(valid), 'PWS-2026-ABC234', 'projects@pwavwe.com', 'https://build.pwavwe.com'); expect(messages[0]?.subject).toContain('PWS-2026-ABC234'); expect(messages[0]?.html).toContain('https://build.pwavwe.com'); expect(messages[0]?.html.toLowerCase()).not.toContain('subscribe'); });
  it('renders admin messages in the studio theme and escapes user content', () => { const message = buildAdminEmail('ama@example.com', 'A quick update', 'Hi Ama,\n\n<script>alert(1)</script>', 'https://build.pwavwe.com'); expect(message.html).toContain('Pwavwe Studio'); expect(message.html).toContain('&lt;script&gt;'); expect(message.html).not.toContain('<script>'); });
  it('sends a short receipt to testimonial authors who provide an email', () => {
    const testimonial = validateTestimonial({ authorName: 'Ama Mensah', authorEmail: 'ama@example.com', authorRole: '', authorOrganisation: '', projectName: 'Campus App', projectRef: '', rating: 5, testimonial: 'The finished app is fast and simple to use.', privateFeedback: '', wouldRecommend: true, publishConsent: true, displayNameConsent: true, website: '', startedAt: Date.now() - 10_000 });
    const messages = buildTestimonialEmails(testimonial, 'PWT-2026-ABC234', 'francis@pwavwe.com', 'https://build.pwavwe.com');
    expect(messages).toHaveLength(2);
    expect(messages[1]?.to).toBe('ama@example.com');
    expect(messages[1]?.html).toContain('FEEDBACK RECEIVED');
  });
});
