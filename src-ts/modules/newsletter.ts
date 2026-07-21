import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { qs } from '../util/dom.ts';
import { db } from './firebase.ts';
import { notify } from './notify.ts';

// ============================================================================
//  Newsletter subscribe — writes an email to the `subscribers` collection.
//  Deliberately minimal: one field, client-side validation, friendly toasts.
//
//  The document ID is a random unsubscribe token, so every newsletter can
//  carry a `/unsubscribe?t=<token>` link that flips the record to
//  `unsubscribed` without ever exposing the subscriber list for reading.
// ============================================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function newToken(): string {
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID().replace(/-/g, '');
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function initNewsletter(): void {
  const form = qs<HTMLFormElement>('#newsletterForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const field = qs<HTMLInputElement>('#newsletterEmail');
    const email = (field?.value ?? '').trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
      notify('Please enter a valid email address.', 'error');
      field?.focus();
      return;
    }

    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) {
      button.disabled = true;
      button.classList.add('is-loading');
    }

    try {
      await setDoc(doc(db(), 'subscribers', newToken()), {
        email,
        source: 'website',
        status: 'subscribed',
        timestamp: serverTimestamp(),
      });
      notify("You're subscribed! The daily newsletter is on its way.", 'success');
      form.reset();
    } catch (err) {
      console.error('Newsletter subscribe failed:', err);
      notify('Subscription failed. Please try again in a moment.', 'error');
    } finally {
      if (button) {
        button.disabled = false;
        button.classList.remove('is-loading');
      }
    }
  });
}
