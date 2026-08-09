import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Activity, Bell, CheckCircle2, Clock, GitPullRequest, LayoutDashboard, ListChecks, LoaderCircle,
  LockKeyhole, Mail, MessagesSquare, RefreshCw, Send, ShieldAlert, Smartphone,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import {
  getRequesterRequest, submitRequesterMessage, updateRequesterPreferences, verifyRequesterCode,
  type NotificationCategory, type NotificationPreferences, type RequestActivity, type RequestMessage,
  type RequesterPortal, type RequesterPortalRequest, type RequesterSession,
} from '../lib/firebase';

const SESSION_KEY = 'pwavwe-requester-session';
type PortalTab = 'overview' | 'timeline' | 'workplan' | 'messages' | 'notifications';
const portalTabs: { key: PortalTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'timeline', label: 'Timeline', icon: Activity },
  { key: 'workplan', label: 'Work plan', icon: ListChecks },
  { key: 'messages', label: 'Messages', icon: MessagesSquare },
  { key: 'notifications', label: 'Notifications', icon: Bell },
];
const categories: { key: NotificationCategory; label: string }[] = [
  { key: 'status', label: 'Status changes' },
  { key: 'timeline', label: 'Timeline changes' },
  { key: 'messages', label: 'Admin messages' },
  { key: 'github', label: 'GitHub updates' },
  { key: 'milestones', label: 'Project plan and delivery' },
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
  const [tab, setTab] = useState<PortalTab>('overview');

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
      setPortal((current) => current ? {
        ...current,
        request: {
          ...current.request,
          notificationPreferences: result.data.preferences,
          smsEnabled: result.data.smsEnabled ?? current.request.smsEnabled,
          smsAvailable: result.data.smsAvailable ?? current.request.smsAvailable,
        },
      } : current);
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

  if (loading) return <div className="dash portal-dash"><Seo title="Track Request - Pwavwe Studio" description="Track your Pwavwe Studio request." path="/request/status" noIndex /><div className="dash-gate-panel dash-loading"><LoaderCircle className="spin" /><p>Loading request status...</p></div></div>;
  if (!portal || !session) return <div className="dash-gate portal-dash"><Seo title="Track Request - Pwavwe Studio" description="Track your Pwavwe Studio request." path="/request/status" noIndex /><Link className="dash-brand dash-gate-brand" to="/"><span className="brand-mark" aria-hidden="true">P/</span><span>Pwavwe <b>Studio</b></span></Link><div className="dash-gate-panel portal-login"><LockKeyhole /><p className="eyebrow">REQUESTER ACCESS</p><h1>Track your request</h1><p>Use the email address and request code from your confirmation message.</p><form onSubmit={login}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Request code<input value={reference} onChange={(event) => setReference(event.target.value.toUpperCase())} placeholder="PWS-2026-ABC234" required /></label>{error && <p className="field-error" role="alert">{error}</p>}<button className="button" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <LockKeyhole size={17} />} Sign in</button></form></div></div>;

  const request = portal.request;
  return <div className="dash portal-dash">
    <Seo title={`${request.reference} - Request Status`} description="Requester status dashboard for a Pwavwe Studio build request." path="/request/status" noIndex />
    <header className="dash-bar">
      <Link className="dash-brand" to="/">
        <span className="brand-mark" aria-hidden="true">P/</span>
        <span className="dash-brand-text">Pwavwe <b>Studio</b><small>Request tracker</small></span>
      </Link>
      <nav className="dash-tabs" aria-label="Request sections">
        {portalTabs.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" className={tab === key ? 'is-active' : undefined} onClick={() => setTab(key)}><Icon size={16} /> {label}</button>
        ))}
      </nav>
      <div className="dash-account">
        <button className="button button-ghost button-small" type="button" onClick={() => void refresh()}><RefreshCw size={15} /> Refresh</button>
        <button className="button button-ghost button-small" type="button" onClick={() => { window.sessionStorage.removeItem(SESSION_KEY); setSession(null); setPortal(null); }}>Sign out</button>
      </div>
    </header>
    <main className="dash-content">
      <div className="dash-page portal-page">
        <header className="portal-header"><div><p className="eyebrow">{request.reference}</p><h1>{request.organisation}</h1><p>{request.projectType} request received {formatDate(request.createdAt)}</p></div><span className={`status-pill status-${request.status}`}>{humanize(request.status)}</span></header>
        {notice && <p className="save-message" role="status">{notice}</p>}
        {error && <p className="field-error" role="alert">{error}</p>}

        {tab === 'overview' && <div className="portal-grid">
          <main className="portal-main">
            <section className="portal-panel status-panel"><div><span className={`status-pill status-${request.status}`}>{humanize(request.status)}</span><h2>Current status</h2><p>{request.publicNote || 'Your request is active in the studio queue.'}</p></div><dl><Data label="Next update" value={request.nextUpdateAt || 'Not scheduled yet'} /><Data label="Current focus" value={request.currentFocus || 'Reviewing the best next step'} /><Data label="Next step" value={request.nextStep || 'To be confirmed'} /><Data label="Delivery window" value={request.estimatedDeliveryAt || request.preferredTimeline || 'To be confirmed'} /></dl></section>
            <ProjectSnapshot request={request} />
            <SharedLinks portal={portal} />
          </main>
          <aside className="portal-side">
            <section className="portal-panel"><h2>Next steps</h2><NextSteps request={request} /></section>
            <section className="portal-panel"><h2>Recent activity</h2><ActivityList activity={portal.activity} /></section>
          </aside>
        </div>}

        {tab === 'timeline' && <div className="portal-single">
          <section className="portal-panel"><h2><Activity size={18} /> Timeline</h2><ol className="portal-timeline">{request.timeline.map((item) => <li key={item.key} className={item.state}><span>{item.state === 'complete' ? <CheckCircle2 size={16} /> : item.state === 'current' ? <LoaderCircle size={16} /> : item.key.slice(0, 1).toUpperCase()}</span><div><strong>{item.label}</strong><p>{item.detail}</p></div></li>)}</ol></section>
          <section className="portal-panel"><h2>Activity log</h2><ActivityList activity={portal.activity} /></section>
        </div>}

        {tab === 'workplan' && <ProjectPlan request={request} />}

        {tab === 'messages' && <div className="portal-single">
          <section className="portal-panel"><h2><MessagesSquare size={18} /> Communications</h2><MessageList messages={portal.messages} /><form className="portal-message-form" onSubmit={sendMessage}><label>Reply to the studio<textarea value={messageBody} onChange={(event) => setMessageBody(event.target.value)} rows={4} maxLength={3000} placeholder="Add a clarification, question or update..." /></label><button className="button" type="submit" disabled={busy || messageBody.trim().length < 2}>{busy ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />} Send message</button></form></section>
        </div>}

        {tab === 'notifications' && <div className="portal-single">
          <section className="portal-panel"><h2><Bell size={18} /> Notification preferences</h2><PreferenceEditor preferences={request.notificationPreferences} smsEnabled={request.smsEnabled} smsAvailable={request.smsAvailable ?? request.smsEnabled} onChange={updatePreference} onDigest={(digest) => setPortal((current) => current ? { ...current, request: { ...current.request, notificationPreferences: { ...current.request.notificationPreferences, digest } } } : current)} /><button className="button button-small" type="button" onClick={() => void savePreferences()} disabled={busy}>Save preferences</button></section>
        </div>}
      </div>
    </main>
  </div>;
}

function ProjectSnapshot({ request }: { request: RequesterPortalRequest }) {
  const milestones = request.projectMilestones ?? [];
  const tasks = request.projectTasks ?? [];
  const completeMilestones = milestones.filter((item) => item.status === 'complete').length;
  const doneTasks = tasks.filter((item) => item.status === 'done').length;
  const openRisks = (request.projectRisks ?? []).filter((risk) => risk.status !== 'resolved').length;

  return <section className="portal-panel project-snapshot">
    <h2><ListChecks size={18} /> Project pulse</h2>
    <div className="portal-metrics">
      <Metric label="Health" value={humanize(request.projectHealth || 'on_track')} note={`${humanize(request.deliveryConfidence || 'medium')} confidence`} />
      <Metric label="Milestones" value={`${completeMilestones}/${milestones.length || 0}`} note="Complete" />
      <Metric label="Tasks" value={`${doneTasks}/${tasks.length || 0}`} note="Done" />
      <Metric label="Open risks" value={`${openRisks}`} note={openRisks ? 'Being watched' : 'None visible'} />
    </div>
    <ProgressBar label="Milestone progress" current={completeMilestones} total={milestones.length} />
    <ProgressBar label="Task progress" current={doneTasks} total={tasks.length} />
  </section>;
}

function NextSteps({ request }: { request: RequesterPortalRequest }) {
  const activeMilestone = (request.projectMilestones ?? []).find((item) => item.status === 'active') ?? (request.projectMilestones ?? []).find((item) => item.status === 'planned');
  const activeTasks = (request.projectTasks ?? []).filter((item) => item.status === 'doing' || item.status === 'todo').slice(0, 3);
  return <div className="next-step-stack">
    {request.nextStep && <PlanMini title="Studio next step" detail={request.nextStep} meta={request.nextUpdateAt || 'Next update not scheduled'} />}
    {activeMilestone && <PlanMini title={activeMilestone.title} detail={activeMilestone.summary || humanize(activeMilestone.status)} meta={activeMilestone.dueDate || 'No due date'} />}
    {activeTasks.map((task) => <PlanMini key={task.id} title={task.title} detail={task.notes || humanize(task.status)} meta={task.dueDate || task.owner || 'Tracked task'} />)}
    {!request.nextStep && !activeMilestone && !activeTasks.length && <p className="portal-muted">No visible next steps yet.</p>}
  </div>;
}

function ProjectPlan({ request }: { request: RequesterPortalRequest }) {
  return <div className="portal-workplan">
    <section className="portal-panel">
      <h2><CheckCircle2 size={18} /> Milestones</h2>
      <div className="plan-list">{(request.projectMilestones ?? []).map((item) => <article key={item.id} className={`plan-item status-${item.status}`}><div><strong>{item.title}</strong><span>{humanize(item.status)}{item.dueDate ? ` / Due ${formatPlainDate(item.dueDate)}` : ''}</span></div><p>{item.summary || 'No summary yet.'}</p>{item.owner && <small>{item.owner}</small>}</article>)}</div>
    </section>
    <section className="portal-panel">
      <h2><ListChecks size={18} /> Tasks and acceptance</h2>
      <div className="plan-list compact">{(request.projectTasks ?? []).map((task) => <article key={task.id} className={`plan-item status-${task.status}`}><div><strong>{task.title}</strong><span>{humanize(task.status)}{task.dueDate ? ` / Due ${formatPlainDate(task.dueDate)}` : ''}</span></div>{task.notes && <p>{task.notes}</p>}</article>)}</div>
      {(request.acceptanceCriteria ?? []).length > 0 && <ul className="acceptance-list">{request.acceptanceCriteria?.map((item) => <li key={item}><CheckCircle2 size={15} /> {item}</li>)}</ul>}
      {!(request.projectTasks ?? []).length && !(request.acceptanceCriteria ?? []).length && <p className="portal-muted">No visible tasks or delivery checks yet.</p>}
    </section>
    <section className="portal-panel">
      <h2><Clock size={18} /> Decisions and meetings</h2>
      <div className="plan-list compact">{(request.projectDecisions ?? []).map((item) => <article key={item.id} className={`plan-item status-${item.status}`}><div><strong>{item.title}</strong><span>{humanize(item.status)}{item.decidedAt ? ` / ${formatPlainDate(item.decidedAt)}` : ''}</span></div>{item.summary && <p>{item.summary}</p>}</article>)}</div>
      <div className="plan-list compact">{(request.projectMeetings ?? []).map((meeting) => <article key={meeting.id} className="plan-item"><div><strong>{meeting.title}</strong><span>{meeting.scheduledAt ? formatPlainDate(meeting.scheduledAt) : 'Date pending'}{meeting.channel ? ` / ${meeting.channel}` : ''}</span></div>{meeting.notes && <p>{meeting.notes}</p>}{Boolean(meeting.actionItems?.length) && <ul>{meeting.actionItems?.map((item) => <li key={item}>{item}</li>)}</ul>}</article>)}</div>
      {!(request.projectDecisions ?? []).length && !(request.projectMeetings ?? []).length && <p className="portal-muted">No visible decisions or meetings yet.</p>}
    </section>
    <section className="portal-panel">
      <h2><ShieldAlert size={18} /> Risks and blockers</h2>
      <div className="plan-list compact">{(request.projectRisks ?? []).map((risk) => <article key={risk.id} className={`plan-item risk-${risk.level}`}><div><strong>{risk.title}</strong><span>{humanize(risk.level)} / {humanize(risk.status)}</span></div><p>{risk.mitigation || 'Being monitored.'}</p></article>)}</div>
      {!(request.projectRisks ?? []).length && <p className="portal-muted">No visible risks or blockers.</p>}
    </section>
  </div>;
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

function PreferenceEditor({ preferences, smsEnabled, smsAvailable, onChange, onDigest }: {
  preferences: NotificationPreferences;
  smsEnabled: boolean;
  smsAvailable: boolean;
  onChange: (channel: 'email' | 'sms', category: NotificationCategory, checked: boolean) => void;
  onDigest: (digest: NotificationPreferences['digest']) => void;
}) {
  return <div className="preference-editor"><div className="preference-header"><span><Mail size={15} /> Email</span><span><Smartphone size={15} /> SMS</span></div>{categories.map((category) => <div className="preference-row" key={category.key}><span>{category.label}</span><label><input type="checkbox" checked={preferences.email[category.key]} onChange={(event) => onChange('email', category.key, event.target.checked)} /><span className="sr-only">Email {category.label}</span></label><label><input type="checkbox" checked={preferences.sms[category.key]} onChange={(event) => onChange('sms', category.key, event.target.checked)} disabled={!smsAvailable} /><span className="sr-only">SMS {category.label}</span></label></div>)}<label className="digest-select">Email timing<select value={preferences.digest} onChange={(event) => onDigest(event.target.value as NotificationPreferences['digest'])}>{digests.map((digest) => <option key={digest} value={digest}>{digest}</option>)}</select></label>{!smsAvailable && <p className="portal-muted">SMS preferences need a phone number on the request.</p>}{smsAvailable && !smsEnabled && <p className="portal-muted">SMS opt-in is off until an SMS preference is saved.</p>}</div>;
}

function MessageList({ messages }: { messages: RequestMessage[] }) {
  if (!messages.length) return <p className="portal-muted">No portal messages yet.</p>;
  return <div className="portal-messages">{messages.map((message) => <article key={message.id} className={`portal-message ${message.direction}`}><div><span>{message.channel}</span><time>{formatDate(message.createdAt)}</time></div>{message.subject && <strong>{message.subject}</strong>}<p>{message.body}</p></article>)}</div>;
}

function ActivityList({ activity }: { activity: RequestActivity[] }) {
  if (!activity.length) return <p className="portal-muted">No public activity yet.</p>;
  return <ol className="portal-activity">{activity.map((item) => <li key={item.id}><span>{item.category || 'update'}</span><strong>{item.title || humanize(item.action)}</strong><p>{item.summary || item.subject || 'A request update was recorded.'}</p><time>{formatDate(item.createdAt)}</time>{item.url && <a href={item.url} target="_blank" rel="noreferrer">Open link</a>}</li>)}</ol>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <article><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function ProgressBar({ label, current, total }: { label: string; current: number; total: number }) {
  const percent = total ? Math.round((current / total) * 100) : 0;
  return <div className="progress-row"><span>{label}</span><strong>{percent}%</strong><div><i style={{ width: `${percent}%` }} /></div></div>;
}

function PlanMini({ title, detail, meta }: { title: string; detail: string; meta: string }) {
  return <article className="plan-mini"><strong>{title}</strong><p>{detail}</p><span>{meta}</span></article>;
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

function humanize(value = ''): string { return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }

function formatPlainDate(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}

function formatDate(value: RequestActivity['createdAt']): string {
  if (!value) return 'Not available';
  const date = typeof value === 'string' ? new Date(value) : new Date(value.seconds * 1000);
  return Number.isNaN(date.getTime()) ? 'Not available' : new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium' }).format(date);
}
