import { z } from 'zod';

const requiredText = (label: string, min: number, max: number) =>
  z.string().trim().min(min, `${label} needs a little more detail.`).max(max, `${label} must be ${max} characters or fewer.`);

export const ratingScale = [1, 2, 3, 4, 5] as const;

export const feedbackSchema = z.object({
  authorName: requiredText('Your name', 2, 100),
  authorRole: z.string().trim().max(120).optional().default(''),
  authorOrganisation: z.string().trim().max(140).optional().default(''),
  authorEmail: z.union([z.literal(''), z.string().trim().email('Enter a valid email address.').max(320)]).optional().default(''),
  projectName: z.string().trim().max(160).optional().default(''),
  projectRef: z.string().trim().max(40).optional().default(''),
  rating: z.number().int().min(1, 'Please choose a rating.').max(5),
  testimonial: requiredText('Your testimonial', 15, 1200),
  privateFeedback: z.string().trim().max(1500).optional().default(''),
  wouldRecommend: z.boolean().default(false),
  publishConsent: z.literal(true, { errorMap: () => ({ message: 'Please confirm before your words are shown publicly.' }) }),
  displayNameConsent: z.boolean().default(false),
  website: z.string().max(0).optional().default(''),
  startedAt: z.number().int().positive(),
});

export type ValidFeedback = z.output<typeof feedbackSchema>;

export type FeedbackFormData = {
  authorName: string;
  authorRole: string;
  authorOrganisation: string;
  authorEmail: string;
  projectName: string;
  projectRef: string;
  rating: number;
  testimonial: string;
  privateFeedback: string;
  wouldRecommend: boolean;
  publishConsent: boolean;
  displayNameConsent: boolean;
  website: string;
  startedAt: number;
};

export const emptyFeedback = (): FeedbackFormData => ({
  authorName: '', authorRole: '', authorOrganisation: '', authorEmail: '',
  projectName: '', projectRef: '', rating: 0, testimonial: '', privateFeedback: '',
  wouldRecommend: false, publishConsent: false, displayNameConsent: false,
  website: '', startedAt: Date.now(),
});
