import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Bell, CheckCircle2, GitPullRequest, LoaderCircle, LockKeyhole, Mail, RefreshCw, Send, Smartphone } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import {
  getRequesterRequest, submitRequesterMessage, updateRequesterPreferences, verifyRequesterCode,
  type NotificationCategory, type NotificationPreferences, type RequestActivity, type RequestMessage,
  type RequesterPortal, type RequesterSession,
} from '../lib/firebase';

const SESSION_KEY = 'pwavwe-requester-session';
const categories: { key: NotificationCategory; label: string }[] = [
  { key: 'status', label: 'Status changes' },
  { key: 'timeline', label: 'Timeline changes' },
  { key: 'messages', label: 'Admin messages' },
  { key: 'github', label: 'GitHub updates' },
  { key: 'milestones', label: 'Proposal and delivery' },
];
const digests: NotificationPreferences['digest'][] = ['immediate', 'daily', 'important'];

export function RequesterPortalPage() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [reference, setReference] = useState(params.get('reference') ?? '');
  const [session, setSession] = useState<RequesterSession | null>(null);
  const [portal, setPortal] = useState<RequesterPortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = loadSession();
    if (!saved) {
      setLoading(false);
      return;
    }
    setSession(saved);
    void (async () => {
      try {
        const result = await getRequesterRequest(saved);
        setPortal(result.data.portal);
      } catch {
        window.sessionStorage.removeItem(SESSION_KEY);
        setError('Please sign in again with your request code.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await verifyRequesterCode({ email, reference });
      setSession(result.data.session);
      setPortal(result.data.portal);
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(result.data.session));
      setNotice('Signed in. Your request status is ready.');
    } catch {
      setError('The email and request code did not match. Check your confirmation message and try again.');
    } finally {
      setBusy(false);
    }
  };

  const refresh = async (activeSession = session) => {
    if (!activeSession) return;
    setLoading(true); setError('');
    try {
      const result = await getRequesterRequest(activeSession);
      setPortal(result.data.portal);
    } catch {
      setSession(null);
      setPortal(null);
      window.sessionStorage.removeItem(SESSION_KEY);
      setError('Please sign in again with your request code.');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (channel: 'email' | 'sms', category: NotificationCategory, checked: boolean) => {
    setPortal((current) => current ? {
      ...current,
      request: {
        ...current.request,
        notificationPreferences: {
          ...current.request.notificationPreferences,
          [channel]: { ...current.request.notificationPreferences[channel], [category]: checked },
        },
      },
    } : current);
  };

  const savePreferences = async () => {
    if (!session || !portal) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await updateRequesterPreferences({ ...session, preferences: portal.request.notificationPreferences });
      setPortal((current) => current ? { ...current, request: { ...current.request, notificationPreferences: result.data.preferences } } : current);
      setNotice('Notification preferences saved.');
    } catch {
      setError('Preferences could not be saved right now.');
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || !messageBody.trim()) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await submitRequesterMessage({ ...session, body: messageBody });
      setMessageBody('');
      setNotice(result.data.emailDelayed ? 'Message saved. Email delivery to the studio may be delayed.' : 'Message sent to the studio.');
      await refresh(session);
    } catch {
      setError('The message could not be sent. Try again shortly.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <section className="requester-portal section-pad"><Seo title="Track Request — Pwavwe Studio" description="Track your Pwavwe Studio request." path="/request/status" noIndex /><div className="table-state"><LoaderCircle className="spin" /> Loading request status...</div></section>;
  if (!portal || !session) return <section className="requester-portal section-pad"><Seo title="Track Request — Pwavwe Studio" description="Track your Pwavwe Studio request." path="/request/status" noIndex /><div className="portal-login"><LockKeyhole /><p className="eyebrow">REQUESTER ACCESS</p><h1>Track your request.</h1><p>Use the email address and request code from your confirmation message.</p><form onSubmit={login}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Request code<input value={reference} onChange={(event) => setReference(event.target.value.toUpperCase())} placeholder="PWS-2026-ABC234" required /></label>{error && <p className="field-error" role="alert">{error}</p>}<button className="button" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <LockKeyhole size={17} />} Sign in</button></form></div></section>;

  return <section className="requester-portal section-pad">
    <Seo title={`${portal.request.reference} — Request Status`} description="Requester status dashboard for a Pwavwe Studio build request." path="/request/status" noIndex />
    <header className="portal-header"><div><p className="eyebrow">{portal.request.reference}</p><h1>{portal.request.organisation}</h1><p>{portal.request.projectType} request received {formatDate(portal.request.createdAt)}</p></div><div className="button-row"><button className="button button-ghost button-small" type="button" onClick={() => void refresh()}><RefreshCw size={16} /> Refresh</button><button className="button button-ghost button-small" type="button" onClick={() => { window.sessionStorage.removeItem(SESSION_KEY); setSession(null); setPortal(null); }}>Sign out</button></div></header>
    {notice && <p className="save-message" role="status">{notice}</p>}
    {error && <p className="field-error" role="alert">{error}</p>}
    <div className="portal-grid">
      <main className="portal-main">
        <section className="portal-panel status-panel"><div><span className={`status-pill status-${portal.request.status}`}>{portal.request.status.replaceAll('_', ' ')}</span><h2>Current status</h2><p>{portal.request.publicNote || 'Your request is active in the studio queue.'}</p></div><dl><Data label="Next update" value={portal.request.nextUpdateAt || 'Not scheduled yet'} /><Data label="Start window" value={portal.request.estimatedStartAt || 'To be confirmed'} /><Data label="Delivery window" value={portal.request.estimatedDeliveryAt || portal.request.preferredTimeline || 'To be confirmed'} /></dl></section>
        <section className="portal-panel"><h2>Timeline</h2><ol className="portal-timeline">{portal.request.timeline.map((item) => <li key={item.key} className={item.state}><span>{item.state === 'complete' ? <CheckCircle2 size={16} /> : item.state === 'current' ? <LoaderCircle size={16} /> : item.key.slice(0, 1).toUpperCase()}</span><div><strong>{item.label}</strong><p>{item.detail}</p></div></li>)}</ol></section>
        <SharedLinks portal={portal} />
        <section className="portal-panel"><h2>Communications</h2><MessageList messages={portal.messages} /><form className="portal-message-form" onSubmit={sendMessage}><label>Reply to the studio<textarea value={messageBody} onChange={(event) => setMessageBody(event.target.value)} rows={4} maxLength={3000} placeholder="Add a clarification, question or update..." /></label><button className="button" type="submit" disabled={busy || messageBody.trim().length < 2}>{busy ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />} Send message</button></form></section>
      </main>
      <aside className="portal-side">
        <section className="portal-panel"><h2><Bell size={18} /> Updates</h2><PreferenceEditor preferences={portal.request.notificationPreferences} smsEnabled={portal.request.smsEnabled} onChange={updatePreference} onDigest={(digest) => setPortal((current) => current ? { ...current, request: { ...current.request, notificationPreferences: { ...current.request.notificationPreferences, digest } } } : current)} /><button className="button button-small" type="button" onClick={() => void savePreferences()} disabled={busy}>Save preferences</button></section>
        <section className="portal-panel"><h2>Activity</h2><ActivityList activity={portal.activity} /></section>
      </aside>
    </div>
  </section>;
}

function SharedLinks({ portal }: { portal: RequesterPortal }) {
  const links = useMemo(() => [
    portal.request.proposalUrl ? ['Proposal', portal.request.proposalUrl] as const : null,
    portal.request.driveFolderUrl ? ['Project folder', portal.request.driveFolderUrl] as const : null,
    ...(portal.request.sharedLinks ?? []).map((link, index) => [`Shared link ${index + 1}`, link] as const),
    ...(portal.request.githubLinks ?? []).map((link, index) => [`GitHub link ${index + 1}`, link] as const),
  ].filter(Boolean) as readonly (readonly [string, string])[], [portal]);
  if (!links.length) return null;
  return <section className="portal-panel"><h2><GitPullRequest size={18} /> Shared links</h2><div className="portal-links">{links.map(([label, href]) => <a key={`${label}-${href}`} href={href} target="_blank" rel="noreferrer">{label}</a>)}</div></section>;
}

function PreferenceEditor({ preferences, smsEnabled, onChange, onDigest }: {
  preferences: NotificationPreferences;
  smsEnabled: boolean;
  onChange: (channel: 'email' | 'sms', category: NotificationCategory, checked: boolean) => void;
  onDigest: (digest: NotificationPreferences['digest']) => void;
}) {
  return <div className="preference-editor"><div className="preference-header"><span><Mail size={15} /> Email</span><span><Smartphone size={15} /> SMS</span></div>{categories.map((category) => <div className="preference-row" key={category.key}><span>{category.label}</span><label><input type="checkbox" checked={preferences.email[category.key]} onChange={(event) => onChange('email', category.key, event.target.checked)} /><span className="sr-only">Email {category.label}</span></label><label><input type="checkbox" checked={preferences.sms[category.key]} onChange={(event) => onChange('sms', category.key, event.target.checked)} disabled={!smsEnabled} /><span className="sr-only">SMS {category.label}</span></label></div>)}<label className="digest-select">Email timing<select value={preferences.digest} onChange={(event) => onDigest(event.target.value as NotificationPreferences['digest'])}>{digests.map((digest) => <option key={digest} value={digest}>{digest}</option>)}</select></label>{!smsEnabled && <p className="portal-muted">SMS preferences need a phone number and SMS opt-in on the request.</p>}</div>;
}

function MessageList({ messages }: { messages: RequestMessage[] }) {
  if (!messages.length) return <p className="portal-muted">No portal messages yet.</p>;
  return <div className="portal-messages">{messages.map((message) => <article key={message.id} className={`portal-message ${message.direction}`}><div><span>{message.channel}</span><time>{formatDate(message.createdAt)}</time></div>{message.subject && <strong>{message.subject}</strong>}<p>{message.body}</p></article>)}</div>;
}

function ActivityList({ activity }: { activity: RequestActivity[] }) {
  if (!activity.length) return <p className="portal-muted">No public activity yet.</p>;
  return <ol className="portal-activity">{activity.map((item) => <li key={item.id}><span>{item.category || 'update'}</span><strong>{item.title || item.action.replaceAll('_', ' ')}</strong><p>{item.summary || item.subject || 'A request update was recorded.'}</p><time>{formatDate(item.createdAt)}</time>{item.url && <a href={item.url} target="_blank" rel="noreferrer">Open link</a>}</li>)}</ol>;
}

function Data({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function loadSession(): RequesterSession | null {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? 'null') as RequesterSession | null;
    return parsed?.requestId && parsed.sessionId && parsed.token ? parsed : null;
  } catch {
    return null;
  }
}

function formatDate(value: RequestActivity['createdAt']): string {
  if (!value) return 'Not available';
  const date = typeof value === 'string' ? new Date(value) : new Date(value.seconds * 1000);
  return Number.isNaN(date.getTime()) ? 'Not available' : new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium' }).format(date);
}
