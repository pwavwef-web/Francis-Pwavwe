import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';
import { getApp } from 'firebase/app';

const enabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

export async function track(event: string, parameters?: Record<string, string | number | boolean>): Promise<void> {
  if (!enabled || typeof window === 'undefined') return;
  try {
    if (await isSupported()) logEvent(getAnalytics(getApp()), event, parameters);
  } catch {
    // Analytics is optional and must never interrupt a user journey.
  }
}
