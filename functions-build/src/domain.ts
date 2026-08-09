import { randomBytes } from 'node:crypto';
import { z } from 'zod';

const projectTypes = ['Website', 'Web application', 'Mobile application', 'AI tool or integration', 'Election or voting system', 'Payment or membership system', 'Research or data dashboard', 'Portfolio or CV website', 'Not sure yet'] as const;
const budgets = ['I need guidance', 'Starter project', 'Standard project', 'Advanced custom platform', 'Institutional or long-term project'] as const;
const timelines = ['As soon as reasonably possible', 'Within one month', 'Within two to three months', 'Within three to six months', 'Flexible', 'I need guidance'] as const;
const contacts = ['Email', 'WhatsApp', 'Video call', 'Either email or WhatsApp'] as const;
export const notificationCategories = ['status', 'timeline', 'messages', 'github', 'milestones'] as const;
export const notificationDigests = ['immediate', 'daily', 'important'] as const;

const text = (min: number, max: number) => z.string().trim().min(min).max(max);
const optional = (max: number) => z.string().trim().max(max).optional().default('');

export type NotificationCategory = (typeof notificationCategories)[number];
export type NotificationDigest = (typeof notificationDigests)[number];
export type NotificationChannelPreferences = Record<NotificationCategory, boolean>;
export type NotificationPreferences = {
  email: NotificationChannelPreferences;
  sms: NotificationChannelPreferences;
  digest: NotificationDigest;
};

const channelDefaults = (enabled: boolean): NotificationChannelPreferences => ({
  status: enabled,
  timeline: enabled,
  messages: enabled,
  github: enabled,
  milestones: enabled,
});

const channelPreferenceSchema = z.object({
  status: z.boolean().optional(),
  timeline: z.boolean().optional(),
  messages: z.boolean().optional(),
  github: z.boolean().optional(),
  milestones: z.boolean().optional(),
});

export const notificationPreferencesSchema = z.object({
  email: channelPreferenceSchema.optional(),
  sms: channelPreferenceSchema.optional(),
  digest: z.enum(notificationDigests).optional().default('immediate'),
});

export function defaultNotificationPreferences(smsEnabled = false): NotificationPreferences {
  return { email: channelDefaults(true), sms: channelDefaults(smsEnabled), digest: 'immediate' };
}

export function normalizeNotificationPreferences(value: unknown, smsEnabled = false): NotificationPreferences {
  const fallback = defaultNotificationPreferences(smsEnabled);
  const parsed = notificationPreferencesSchema.safeParse(value);
  if (!parsed.success) return fallback;
  return {
    email: { ...fallback.email, ...parsed.data.email },
    sms: smsEnabled ? { ...fallback.sms, ...parsed.data.sms } : channelDefaults(false),
    digest: parsed.data.digest,
  };
}

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
  smsConsent: z.boolean().default(false),
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
export type SmsMessage = { to: string; message: string };
export type ThemedEmailContent = {
  preview: string;
  eyebrow: string;
  title: string;
  body: string;
  publicSiteUrl: string;
  cta?: { label: string; href: string };
};
export type SubmissionDependencies = {
  store: (request: NormalizedBuildRequest) => Promise<StoredRequest>;
  storeMarketingConsent: (request: NormalizedBuildRequest, stored: StoredRequest) => Promise<void>;
  sendEmail?: (message: EmailMessage) => Promise<void>;
  sendSms?: (message: SmsMessage) => Promise<void>;
  markEmailStatus: (requestId: string, status: 'sent' | 'delayed' | 'not_configured') => Promise<void>;
  markSmsStatus?: (requestId: string, status: 'sent' | 'delayed' | 'not_configured' | 'no_phone') => Promise<void>;
  projectsInbox: string;
  publicSiteUrl: string;
};

export async function processSubmission(value: unknown, dependencies: SubmissionDependencies): Promise<{ reference: string; emailDelayed: boolean; smsDelayed?: boolean }> {
  const request = validateBuildRequest(value);
  const stored = await dependencies.store(request);
  if (request.marketingConsent) await dependencies.storeMarketingConsent(request, stored);
  let emailDelayed = false;
  if (!dependencies.sendEmail) {
    await dependencies.markEmailStatus(stored.requestId, 'not_configured');
  } else {
    try {
      const messages = buildEmailMessages(request, stored.reference, dependencies.projectsInbox, dependencies.publicSiteUrl);
      await Promise.all(messages.map(dependencies.sendEmail));
      await dependencies.markEmailStatus(stored.requestId, 'sent');
    } catch {
      await dependencies.markEmailStatus(stored.requestId, 'delayed');
      emailDelayed = true;
    }
  }

  let smsDelayed = false;
  if (request.smsConsent) {
    if (!request.phone) {
      await dependencies.markSmsStatus?.(stored.requestId, 'no_phone');
    } else if (!dependencies.sendSms) {
      await dependencies.markSmsStatus?.(stored.requestId, 'not_configured');
    } else {
      try {
        await dependencies.sendSms(buildRequestReceiptSms(request, stored.reference, dependencies.publicSiteUrl));
        await dependencies.markSmsStatus?.(stored.requestId, 'sent');
      } catch {
        await dependencies.markSmsStatus?.(stored.requestId, 'delayed');
        smsDelayed = true;
      }
    }
  }
  return { reference: stored.reference, emailDelayed, ...(smsDelayed ? { smsDelayed } : {}) };
}

export function buildEmailMessages(request: NormalizedBuildRequest, reference: string, projectsInbox: string, publicSiteUrl: string): EmailMessage[] {
  const url = publicSiteUrl.replace(/\/$/, '');
  const firstName = request.name.split(/\s+/)[0] || 'there';
  return [
    {
      to: request.email,
      subject: `Build request received - ${reference}`,
      text: `Hi ${firstName},\n\nThanks for sharing your ${request.projectType} project. I have received it under reference ${reference} and will review it personally.\n\nI will be in touch with the next step.\n\nFrancis\nPwavwe Studio\n${url}`,
      html: renderThemedEmail({
        preview: `Your Pwavwe Studio request ${reference} has been received.`,
        eyebrow: 'REQUEST RECEIVED',
        title: `Thanks, ${firstName}.`,
        body: `Your ${request.projectType} project is safely with me.\n\nReference: ${reference}\n\nI will review the details personally and be in touch with the next step.`,
        publicSiteUrl: url,
        cta: { label: 'Visit Pwavwe Studio', href: url },
      }),
    },
    {
      to: projectsInbox,
      replyTo: request.email,
      subject: `New build request - ${reference}`,
      text: `New request ${reference}\nProject type: ${request.projectType}\nRequester: ${request.name}\nOrganisation: ${request.organisation}\n\nReview it in the protected studio dashboard: ${url}/admin`,
      html: renderThemedEmail({
        preview: `New ${request.projectType} request from ${request.name}.`,
        eyebrow: 'NEW BUILD REQUEST',
        title: reference,
        body: `${request.name} from ${request.organisation} submitted a ${request.projectType} request.`,
        publicSiteUrl: url,
        cta: { label: 'Review request', href: `${url}/admin` },
      }),
    },
  ];
}

export function buildAdminEmail(to: string, subject: string, body: string, publicSiteUrl: string): EmailMessage {
  const url = publicSiteUrl.replace(/\/$/, '');
  return {
    to,
    subject,
    text: `${body.trim()}\n\nFrancis\nPwavwe Studio\n${url}`,
    html: renderThemedEmail({
      preview: subject,
      eyebrow: 'PWAVWE STUDIO',
      title: subject,
      body: body.trim(),
      publicSiteUrl: url,
      cta: { label: 'Visit Pwavwe Studio', href: url },
    }),
  };
}

export function buildRequesterUpdateEmail(to: string, subject: string, title: string, body: string, publicSiteUrl: string, reference: string): EmailMessage {
  const url = publicSiteUrl.replace(/\/$/, '');
  return {
    to,
    subject,
    text: `${body.trim()}\n\nView your request: ${url}/request/status?reference=${encodeURIComponent(reference)}\n\nFrancis\nPwavwe Studio\n${url}`,
    html: renderThemedEmail({
      preview: subject,
      eyebrow: 'REQUEST UPDATE',
      title,
      body: body.trim(),
      publicSiteUrl: url,
      cta: { label: 'View request status', href: `${url}/request/status?reference=${encodeURIComponent(reference)}` },
    }),
  };
}

export function buildRequestReceiptSms(request: NormalizedBuildRequest, reference: string, publicSiteUrl: string): SmsMessage {
  const url = publicSiteUrl.replace(/\/$/, '');
  return {
    to: request.phone,
    message: `Pwavwe Studio: your request ${reference} was received. Track updates at ${url}/request/status using this code.`,
  };
}

export function buildRequesterUpdateSms(reference: string, update: string, publicSiteUrl: string): string {
  const url = publicSiteUrl.replace(/\/$/, '');
  return `Pwavwe Studio ${reference}: ${update.trim()} Track: ${url}/request/status`;
}

export function renderThemedEmail(content: ThemedEmailContent): string {
  const safeUrl = escapeHtml(content.publicSiteUrl.replace(/\/$/, ''));
  const body = content.body.trim().split(/\n{2,}/).map((paragraph) => `<p style="margin:0 0 18px;color:#273231;font-size:16px;line-height:1.65">${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('');
  const cta = content.cta ? `<p style="margin:28px 0 4px"><a href="${escapeHtml(content.cta.href)}" style="display:inline-block;background:#113a36;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 20px;border-radius:2px">${escapeHtml(content.cta.label)}</a></p>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(content.title)}</title></head><body style="margin:0;background:#edf1ef;font-family:Arial,Helvetica,sans-serif;color:#17201f"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(content.preview)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf1ef;padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #d7dfdc"><tr><td style="background:#102522;padding:25px 32px;border-bottom:4px solid #52c7b2"><div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-.3px">Pwavwe Studio</div><div style="margin-top:5px;color:#9fd9ce;font-size:11px;letter-spacing:1.8px">DESIGN &amp; DEVELOPMENT</div></td></tr><tr><td style="padding:38px 32px 32px"><div style="margin-bottom:12px;color:#147767;font-size:11px;font-weight:700;letter-spacing:1.7px">${escapeHtml(content.eyebrow)}</div><h1 style="margin:0 0 22px;color:#17201f;font-size:30px;line-height:1.2;letter-spacing:-.8px">${escapeHtml(content.title)}</h1>${body}${cta}</td></tr><tr><td style="padding:20px 32px;background:#f6f8f7;border-top:1px solid #dfe5e2;color:#687370;font-size:12px;line-height:1.6">Sent personally by Francis Pwavwe<br><a href="${safeUrl}" style="color:#147767;text-decoration:none">${safeUrl}</a></td></tr></table></td></tr></table></body></html>`;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
}

// ── Testimonials / project feedback ──────────────────────────────────────────
// A separate, lighter flow. A client shares a rating and a public testimonial
// after a project. Nothing is published automatically: the submission is stored
// for review and only becomes public when an admin approves and publishes it.

export const serverTestimonialSchema = z.object({
  authorName: text(2, 100),
  authorRole: optional(120),
  authorOrganisation: optional(140),
  authorEmail: z.union([z.literal(''), z.string().trim().email().max(320).transform((value) => value.toLowerCase())]).optional().default(''),
  projectName: optional(160),
  projectRef: optional(40),
  rating: z.number().int().min(1).max(5),
  testimonial: text(15, 1200),
  privateFeedback: optional(1500),
  wouldRecommend: z.boolean().default(false),
  publishConsent: z.literal(true),
  displayNameConsent: z.boolean().default(false),
  website: z.string().max(0).optional().default(''),
  startedAt: z.number().int().positive(),
}).superRefine((value, context) => {
  const elapsed = Date.now() - value.startedAt;
  if (elapsed < 3_000 || elapsed > 86_400_000) context.addIssue({ code: z.ZodIssueCode.custom, path: ['startedAt'], message: 'Invalid completion time' });
});

export type TestimonialInput = z.input<typeof serverTestimonialSchema>;
export type NormalizedTestimonial = z.output<typeof serverTestimonialSchema>;

export function validateTestimonial(value: unknown): NormalizedTestimonial {
  return serverTestimonialSchema.parse(value);
}

export function generateTestimonialReference(year = new Date().getUTCFullYear(), bytes: () => Buffer = () => randomBytes(5)): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const random = bytes();
  let token = '';
  for (let index = 0; index < 6; index += 1) token += alphabet[random[index % random.length]! % alphabet.length];
  return `PWT-${year}-${token}`;
}

export type TestimonialDependencies = {
  store: (testimonial: NormalizedTestimonial) => Promise<StoredRequest>;
  sendEmail?: (message: EmailMessage) => Promise<void>;
  markEmailStatus: (requestId: string, status: 'sent' | 'delayed' | 'not_configured') => Promise<void>;
  projectsInbox: string;
  publicSiteUrl: string;
};

export async function processTestimonialSubmission(value: unknown, dependencies: TestimonialDependencies): Promise<{ reference: string; emailDelayed: boolean }> {
  const testimonial = validateTestimonial(value);
  const stored = await dependencies.store(testimonial);
  if (!dependencies.sendEmail) {
    await dependencies.markEmailStatus(stored.requestId, 'not_configured');
    return { reference: stored.reference, emailDelayed: false };
  }
  try {
    await Promise.all(buildTestimonialEmails(testimonial, stored.reference, dependencies.projectsInbox, dependencies.publicSiteUrl).map(dependencies.sendEmail));
    await dependencies.markEmailStatus(stored.requestId, 'sent');
    return { reference: stored.reference, emailDelayed: false };
  } catch {
    await dependencies.markEmailStatus(stored.requestId, 'delayed');
    return { reference: stored.reference, emailDelayed: true };
  }
}

export function buildTestimonialEmails(testimonial: NormalizedTestimonial, reference: string, projectsInbox: string, publicSiteUrl: string): EmailMessage[] {
  const url = publicSiteUrl.replace(/\/$/, '');
  const project = testimonial.projectName || 'a project';
  const adminMessage: EmailMessage = {
    to: projectsInbox,
    replyTo: testimonial.authorEmail || undefined,
    subject: `New testimonial - ${reference} - ${testimonial.rating}/5`,
    text: `New testimonial ${reference}\nFrom: ${testimonial.authorName}${testimonial.authorOrganisation ? ` (${testimonial.authorOrganisation})` : ''}\nProject: ${project}\nRating: ${testimonial.rating}/5\n\n"${testimonial.testimonial}"\n\nReview and publish it in the protected dashboard: ${url}/admin/feedback`,
    html: renderThemedEmail({
      preview: `${testimonial.rating}/5 feedback from ${testimonial.authorName}.`,
      eyebrow: 'NEW TESTIMONIAL',
      title: `${testimonial.rating}/5 from ${testimonial.authorName}`,
      body: `Project: ${project}\nReference: ${reference}\n\n“${testimonial.testimonial}”${testimonial.privateFeedback ? `\n\nPrivate feedback: ${testimonial.privateFeedback}` : ''}`,
      publicSiteUrl: url,
      cta: { label: 'Review testimonial', href: `${url}/admin/feedback` },
    }),
  };
  if (!testimonial.authorEmail) return [adminMessage];
  const firstName = testimonial.authorName.split(/\s+/)[0] || 'there';
  return [adminMessage, {
    to: testimonial.authorEmail,
    subject: `Thank you for your feedback - ${reference}`,
    text: `Hi ${firstName},\n\nThank you for taking the time to share feedback about ${project}. I have received it under reference ${reference}.\n\nNothing is published automatically; I will review it first.\n\nFrancis\nPwavwe Studio\n${url}`,
    html: renderThemedEmail({
      preview: 'Thank you for sharing your experience with Pwavwe Studio.',
      eyebrow: 'FEEDBACK RECEIVED',
      title: `Thank you, ${firstName}.`,
      body: `I appreciate you taking the time to share your experience with ${project}.\n\nYour reference is ${reference}. Nothing is published automatically; I will review it first.`,
      publicSiteUrl: url,
      cta: { label: 'Visit Pwavwe Studio', href: url },
    }),
  }];
}
