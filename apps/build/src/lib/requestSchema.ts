import { z } from 'zod';

const requiredText = (label: string, min: number, max: number) =>
  z.string().trim().min(min, `${label} needs a little more detail.`).max(max, `${label} must be ${max} characters or fewer.`);

const optionalUrl = z.union([z.literal(''), z.string().trim().url('Enter a complete link beginning with https://').max(500)]);

export const projectTypes = [
  'Website', 'Web application', 'Mobile application', 'AI tool or integration',
  'Election or voting system', 'Payment or membership system', 'Research or data dashboard',
  'Portfolio or CV website', 'Not sure yet',
] as const;

export const budgetOptions = [
  'I need guidance', 'Starter project', 'Standard project', 'Advanced custom platform', 'Institutional or long-term project',
] as const;

export const timelineOptions = [
  'As soon as reasonably possible', 'Within one month', 'Within two to three months',
  'Within three to six months', 'Flexible', 'I need guidance',
] as const;

export const contactOptions = ['Email', 'WhatsApp', 'Video call', 'Either email or WhatsApp'] as const;

export const requestSchema = z.object({
  name: requiredText('Your name', 2, 100),
  email: z.string().trim().email('Enter a valid email address.').max(320),
  phone: z.string().trim().max(30).optional().default(''),
  organisation: requiredText('Your organisation or project name', 2, 140),
  projectType: z.enum(projectTypes, { message: 'Choose the closest project type.' }),
  projectSummary: requiredText('What you want to build', 20, 1500),
  problemStatement: requiredText('The problem', 20, 1500),
  targetUsers: requiredText('Who will use it', 10, 800),
  features: requiredText('Important features', 10, 1500),
  preferredTimeline: z.enum(timelineOptions, { message: 'Choose a preferred completion period.' }),
  budgetRange: z.enum(budgetOptions, { message: 'Choose a budget range.' }),
  preferredContact: z.enum(contactOptions, { message: 'Choose a contact method.' }),
  existingWebsite: optionalUrl.optional().default(''),
  referenceLinks: z.string().trim().max(1500).optional().default(''),
  additionalNotes: z.string().trim().max(1500).optional().default(''),
  discoverySource: z.string().trim().max(160).optional().default(''),
  contactConsent: z.literal(true, { errorMap: () => ({ message: 'Please confirm that Pwavwe Studio may contact you about this request.' }) }),
  marketingConsent: z.boolean().default(false),
  website: z.string().max(0).optional().default(''),
  startedAt: z.number().int().positive(),
});

export type ValidRequest = z.output<typeof requestSchema>;

export type RequestFormData = {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  projectType: string;
  projectSummary: string;
  problemStatement: string;
  targetUsers: string;
  features: string;
  preferredTimeline: string;
  budgetRange: string;
  preferredContact: string;
  existingWebsite: string;
  referenceLinks: string;
  additionalNotes: string;
  discoverySource: string;
  contactConsent: boolean;
  marketingConsent: boolean;
  website: string;
  startedAt: number;
};

export const emptyRequest = (): RequestFormData => ({
  name: '', email: '', phone: '', organisation: '', projectType: '',
  projectSummary: '', problemStatement: '', targetUsers: '', features: '',
  preferredTimeline: '', budgetRange: '', preferredContact: '',
  existingWebsite: '', referenceLinks: '', additionalNotes: '', discoverySource: '',
  contactConsent: false, marketingConsent: false, website: '', startedAt: Date.now(),
});

const DRAFT_KEY = 'pwavwe-studio-request-draft';
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export function saveDraft(data: RequestFormData): void {
  const safeDraft = { ...data, savedAt: Date.now() };
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(safeDraft));
}

export function loadDraft(): RequestFormData | null {
  try {
    const draft = JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? 'null') as (RequestFormData & { savedAt?: number }) | null;
    if (!draft?.savedAt || Date.now() - draft.savedAt > DRAFT_TTL_MS) {
      clearDraft();
      return null;
    }
    delete draft.savedAt;
    return draft;
  } catch {
    clearDraft();
    return null;
  }
}

export function clearDraft(): void {
  window.localStorage.removeItem(DRAFT_KEY);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
