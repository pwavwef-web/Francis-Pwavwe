import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { PROFILE } from '../data/content.ts';
import { qs } from '../util/dom.ts';
import { db } from './firebase.ts';
import { notify } from './notify.ts';

// ============================================================================
//  Contact form — writes to Firestore, with a graceful mailto fallback if the
//  network / rules reject the write. Floating-label focus states included.
// ============================================================================

export function initContact(): void {
  const form = qs<HTMLFormElement>('#contactForm');
  if (!form) return;

  // Floating-label focus handling.
  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach(
    (field) => {
      const sync = () => field.parentElement?.classList.toggle('is-filled', !!field.value);
      field.addEventListener('focus', () => field.parentElement?.classList.add('is-focused'));
      field.addEventListener('blur', () => {
        field.parentElement?.classList.remove('is-focused');
        sync();
      });
      field.addEventListener('input', sync);
    },
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: (qs<HTMLInputElement>('#name')?.value ?? '').trim(),
      email: (qs<HTMLInputElement>('#email')?.value ?? '').trim(),
      subject: (qs<HTMLInputElement>('#subject')?.value ?? '').trim(),
      message: (qs<HTMLTextAreaElement>('#message')?.value ?? '').trim(),
    };

    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) {
      button.disabled = true;
      button.classList.add('is-loading');
    }

    try {
      await addDoc(collection(db(), 'messages'), { ...data, timestamp: serverTimestamp() });
      notify('Message sent! Francis will get back to you soon.', 'success');
      form.reset();
      form.querySelectorAll('.is-filled').forEach((el) => el.classList.remove('is-filled'));
    } catch (err) {
      console.error('Contact submit failed, falling back to mailto:', err);
      const body = `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`;
      window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(
        data.subject,
      )}&body=${encodeURIComponent(body)}`;
      notify('Opening your email client…', 'info');
    } finally {
      if (button) {
        button.disabled = false;
        button.classList.remove('is-loading');
      }
    }
  });
}
