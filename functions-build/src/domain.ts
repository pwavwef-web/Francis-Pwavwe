import { randomBytes } from 'node:crypto';
import { z } from 'zod';

const projectTypes = ['Website', 'Web application', 'Mobile application', 'AI tool or integration', 'Election or voting system', 'Payment or membership system', 'Research or data dashboard', 'Portfolio or CV website', 'Not sure yet'] as const;
const budgets = ['I need guidance', 'Starter project', 'Standard project', 'Advanced custom platform', 'Institutional or long-term project'] as const;
const timelines = ['As soon as reasonably possible', 'Within one month', 'Within two to three months', 'Within three to six months', 'Flexible', 'I need guidance'] as const;
const contacts = ['Email', 'WhatsApp', 'Video call', 'Either email or WhatsApp'] as const;

const text = (min: number, max: number) => z.string().trim().min(min).max(max);
const optional = (max: number) => z.string().trim().max(max).optional().default('');

export const serverRequestSchema = z.object({
  name: text(2, 100),
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  phone: optional(30),
  organisation: text(2, 140),
  projectType: z.enum(projectTypes),
  projectSummary: text(20, 1500),
  problemStatement: text(20, 1500),
  targetUsers: text(10, 800),
  features: text(10, 1500),
  existingWebsite: z.union([z.literal(''), z.string().trim().url().max(500)]).optional().default(''),
  referenceLinks: optional(1500),
  budgetRange: z.enum(budgets),
  preferredTimeline: z.enum(timelines),
  preferredContact: z.enum(contacts),
  discoverySource: optional(160),
  additionalNotes: optional(1500),
  contactConsent: z.literal(true),
  marketingConsent: z.boolean().default(false),
  website: z.string().max(0).optional().default(''),
  startedAt: z.number().int().positive(),
}).superRefine((value, context) => {
  const elapsed = Date.now() - value.startedAt;
  if (elapsed < 3_000 || elapsed > 86_400_000) context.addIssue({ code: z.ZodIssueCode.custom, path: ['startedAt'], message: 'Invalid completion time' });
});

export type BuildRequestInput = z.input<typeof serverRequestSchema>;
export type NormalizedBuildRequest = z.output<typeof serverRequestSchema>;

export function validateBuildRequest(value: unknown): NormalizedBuildRequest {
  return serverRequestSchema.parse(value);
}

export function generateReference(year = new Date().getUTCFullYear(), bytes: () => Buffer = () => randomBytes(5)): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const random = bytes();
  let token = '';
  for (let index = 0; index < 6; index += 1) token += alphabet[random[index % random.length]! % alphabet.length];
  return `PWS-${year}-${token}`;
}

export type StoredRequest = { requestId: string; reference: string };
export type EmailMessage = { to: string; subject: string; text: string; html: string; replyTo?: string };
export type SubmissionDependencies = {
  store: (request: NormalizedBuildRequest) => Promise<StoredRequest>;
  storeMarketingConsent: (request: NormalizedBuildRequest, stored: StoredRequest) => Promise<void>;
  sendEmail?: (message: EmailMessage) => Promise<void>;
  markEmailStatus: (requestId: string, status: 'sent' | 'delayed' | 'not_configured') => Promise<void>;
  projectsInbox: string;
  publicSiteUrl: string;
};

export async function processSubmission(value: unknown, dependencies: SubmissionDependencies): Promise<{ reference: string; emailDelayed: boolean }> {
  const request = validateBuildRequest(value);
  const stored = await dependencies.store(request);
  if (request.marketingConsent) await dependencies.storeMarketingConsent(request, stored);
  if (!dependencies.sendEmail) {
    await dependencies.markEmailStatus(stored.requestId, 'not_configured');
    return { reference: stored.reference, emailDelayed: false };
  }
  try {
    const messages = buildEmailMessages(request, stored.reference, dependencies.projectsInbox, dependencies.publicSiteUrl);
    await Promise.all(messages.map(dependencies.sendEmail));
    await dependencies.markEmailStatus(stored.requestId, 'sent');
    return { reference: stored.reference, emailDelayed: false };
  } catch {
    await dependencies.markEmailStatus(stored.requestId, 'delayed');
    return { reference: stored.reference, emailDelayed: true };
  }
}

export function buildEmailMessages(request: NormalizedBuildRequest, reference: string, projectsInbox: string, publicSiteUrl: string): EmailMessage[] {
  const firstName = escapeHtml(request.name.split(/\s+/)[0] || 'there');
  const safeReference = escapeHtml(reference);
  const safeType = escapeHtml(request.projectType);
  const url = publicSiteUrl.replace(/\/$/, '');
  return [
    {
      to: request.email,
      subject: `We received your build request — ${reference}`,
      text: `Hi ${request.name.split(/\s+/)[0]},\n\nWe received your ${request.projectType} request. Your reference is ${reference}. Francis will review it and follow up. Submission is not a contract or payment commitment.\n\n${url}`,
      html: `<p>Hi ${firstName},</p><p>We received your <strong>${safeType}</strong> request.</p><p>Your reference is <strong>${safeReference}</strong>.</p><p>Francis will review the request and follow up. Submission is not a contract or payment commitment.</p><p><a href="${url}">${url}</a></p>`,
    },
    {
      to: projectsInbox,
      replyTo: request.email,
      subject: `New Pwavwe Studio request — ${reference} — ${request.projectType}`,
      text: `New request ${reference}\nProject type: ${request.projectType}\nRequester: ${request.name}\nOrganisation: ${request.organisation}\n\nReview it in the protected studio dashboard: ${url}/admin`,
      html: `<p>New build request <strong>${safeReference}</strong></p><p>Project type: ${safeType}<br>Requester: ${escapeHtml(request.name)}<br>Organisation: ${escapeHtml(request.organisation)}</p><p><a href="${url}/admin">Open the protected dashboard</a></p>`,
    },
  ];
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
}
