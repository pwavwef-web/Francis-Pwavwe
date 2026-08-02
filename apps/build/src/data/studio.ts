// Single source of truth for Pwavwe Studio contact and payment details.
//
// ┌──────────────────────────────────────────────────────────────────────┐
// │ ACTION REQUIRED before deploy: fill in the three placeholders below.   │
// │ Until they are set, WhatsApp and online-payment elements are hidden    │
// │ automatically and the site falls back to email — nothing breaks.       │
// └──────────────────────────────────────────────────────────────────────┘

export const studio = {
  /** Primary studio inbox for project requests. */
  email: 'projects@pwavwe.com',
  /** Francis's personal inbox for speaking / non-project mail. */
  personalEmail: 'francis@pwavwe.com',

  /** WhatsApp number in international format, digits only, no "+" or spaces.
   *  Ghana 0557535673 -> 233557535673. Leave '' to hide WhatsApp everywhere. */
  whatsappNumber: '233557535673',

  /** Paystack payment link for deposits (card + Mobile Money).
   *  TODO: add once available, e.g. 'https://paystack.shop/pay/xxxxxxx'.
   *  While '', the Paystack button stays hidden and Mobile Money is shown instead. */
  paystackUrl: '',

  /** Direct Mobile Money details. Leave number '' to hide the MoMo block. */
  momo: {
    number: '054 402 0771',
    name: 'Francis Pwavwe',
    network: '', // optional, e.g. 'MTN MoMo' — shown as the label above the number
  },

  /** Deposit / payment terms shown on the site. */
  deposit: '50% to start, 50% on delivery',
} as const;

/** Build a wa.me link with an optional pre-filled message. Returns '' when unset. */
export function whatsappLink(message?: string): string {
  if (!studio.whatsappNumber) return '';
  const base = `https://wa.me/${studio.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const hasWhatsApp = (): boolean => Boolean(studio.whatsappNumber);
export const hasPaystack = (): boolean => Boolean(studio.paystackUrl);
export const hasMomo = (): boolean => Boolean(studio.momo.number);
