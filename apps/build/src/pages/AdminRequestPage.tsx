import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { AlertTriangle, ArrowLeft, Bell, ExternalLink, GitPullRequest, LoaderCircle, LockKeyhole, LogIn, Mail, MessageSquareQuote, Save, Send, Smartphone, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { Seo } from '../components/Seo';
import {
  auth, deleteBuildRequest, getBuildRequest, googleProvider, listRequestActivity, listRequestMessages,
  sendAdminEmail, sendAdminSms, siteUrl, updateBuildRequest, verifyBuildAdmin,
  type AdminRequest, type RequestActivity, type RequestMessage,
} from '../lib/firebase';

const statuses = ['new', 'reviewing', 'needs_clarification', 'qualified', 'proposal_preparation', 'proposal_sent', 'accepted', 'in_development', 'delivered', 'declined', 'archived'];
const priorities = ['normal', 'high', 'urgent'];

type AccessState = { loading: boolean; user: User | null; authorized: boolean; denied: boolean };

export function AdminRequestPage() {
  return <><Seo title="Request Detail — Pwavwe Studio" description="Protected request detail." path="/admin/requests" noIndex /><AdminGate><RequestDetail /></AdminGate></>;
}

function useAdminAccess(): AccessState {
  const [state, setState] = useState<AccessState>({ loading: true, user: null, authorized: false, denied: false });
  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) return setState({ loading: false, user: null, authorized: false, denied: false });
    try {
      const result = await verifyBuildAdmin({});
      setState({ loading: false, user, authorized: result.data.authorized, denied: !result.data.authorized });
      if (!result.data.authorized) await signOut(auth);
    } catch {
      setState({ loading: false, user: null, authorized: false, denied: true });
      await signOut(auth);
    }
  }), []);
  return state;
}

function AdminGate({ children }: { children: React.ReactNode }) {
  const access = useAdminAccess();
  const [signInError, setSignInError] = useState('');
  if (access.loading) return <StatePanel icon={<LoaderCircle className="spin" />} title="Checking access..." message="Verifying the signed-in account." />;
  if (!access.user || !access.authorized) return <StatePanel icon={access.denied ? <AlertTriangle /> : <LockKeyhole />} title={access.denied ? 'Access denied' : 'Studio admin'} message={access.denied ? 'That account is not authorised to manage Pwavwe Studio requests.' : 'Sign in with an approved Google account.'} action={<><button className="button" type="button" onClick={async () => { setSignInError(''); try { await signInWithPopup(auth, googleProvider); } catch { setSignInError('Sign-in did not complete.'); } }}><LogIn size={18} /> Sign in with Google</button>{signInError && <p className="field-error" role="alert">{signInError}</p>}</>} />;
  return <>{children}</>;
}

function StatePanel({ icon, title, message, action }: { icon: React.ReactNode; title: string; message: string; action?: React.ReactNode }) {
  return <section className="admin-state section-pad">{icon}<p className="eyebrow">PROTECTED AREA</p><h1>{title}</h1><p>{message}</p>{action}</section>;
}

function RequestDetail() {
  const { requestId = '' } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<AdminRequest | null>(null);
  const [activity, setActivity] = useState<RequestActivity[]>([]);
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [requestResult, activityResult, messageResult] = await Promise.all([
        getBuildRequest({ requestId }),
        listRequestActivity({ requestId }),
        listRequestMessages({ requestId }),
      ]);
      setRequest(requestResult.data.request);
      setActivity(activityResult.data.activity);
      setMessages(messageResult.data.messages);
    } catch {
      setError('This request could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <StatePanel icon={<LoaderCircle className="spin" />} title="Loading request..." message="Retrieving the protected request record." />;
  if (!request || error) return <StatePanel icon={<AlertTriangle />} title="Request unavailable" message={error || 'The request does not exist.'} action={<Link className="button" to="/admin"><ArrowLeft size={16} /> Back to requests</Link>} />;

  const set = (key: keyof AdminRequest, value: unknown) => setRequest((current) => current ? { ...current, [key]: value } : current);
  const portalUrl = `${siteUrl}/request/status?reference=${encodeURIComponent(request.reference)}`;
  const whatsapp = request.phone ? `https://wa.me/${request.phone.replace(/\D/g, '')}` : '';

  const save = async () => {
    setSaving(true); setNotice(''); setError('');
    try {
      await updateBuildRequest({ requestId, changes: {
        status: request.status, priority: request.priority, internalNotes: request.internalNotes ?? '', internalTags: request.internalTags ?? [],
        proposalUrl: request.proposalUrl ?? '', driveFolderUrl: request.driveFolderUrl ?? '', followUpDate: request.followUpDate ?? '',
        publicStatus: request.publicStatus ?? request.status, publicNote: request.publicNote ?? '', nextUpdateAt: request.nextUpdateAt ?? '',
        estimatedStartAt: request.estimatedStartAt ?? '', estimatedDeliveryAt: request.estimatedDeliveryAt ?? '',
        sharedLinks: request.sharedLinks ?? [], githubLinks: request.githubLinks ?? [],
      } });
      setNotice('Changes saved, audited, and queued for allowed requester notifications.');
      await load();
    } catch {
      setError('Changes could not be saved. No data was changed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const confirmation = window.prompt(`Type ${request.reference} to permanently delete this request.`);
    if (confirmation !== request.reference) return;
    try { await deleteBuildRequest({ requestId, confirmation }); navigate('/admin'); }
    catch { setError('The request could not be deleted.'); }
  };

  return <section className="admin-detail section-pad">
    <Link className="back-link" to="/admin"><ArrowLeft size={16} /> All requests</Link>
    <header><div><p className="eyebrow">{request.reference}</p><h1>{request.organisation}</h1><p>Received {formatDate(request.createdAt)} · Updated {formatDate(request.updatedAt)}</p></div><div className="button-row"><a className="button button-ghost button-small" href="#email-client"><Mail size={16} /> Email</a>{request.phone && <a className="button button-ghost button-small" href="#sms-client"><Smartphone size={16} /> SMS</a>}<Link className="button button-ghost button-small" to={`/request/status?reference=${encodeURIComponent(request.reference)}`} target="_blank"><Bell size={16} /> Portal</Link>{whatsapp && <a className="button button-ghost button-small" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp <ExternalLink size={15} /></a>}</div></header>
    {notice && <p className="save-message" role="status">{notice}</p>}
    {error && <p className="field-error" role="alert">{error}</p>}
    <div className="admin-detail-grid">
      <div className="request-record">
        <Section title="Requester"><Data label="Name" value={request.name} /><Data label="Email" value={request.email} /><Data label="Phone" value={request.phone || 'Not supplied'} /><Data label="Preferred contact" value={request.preferredContact} /></Section>
        <Section title="Project"><Data label="Type" value={request.projectType} /><Data label="What they want to build" value={request.projectSummary} /><Data label="Problem" value={request.problemStatement} /><Data label="Intended users" value={request.targetUsers} /><Data label="Important features" value={request.features} /><Data label="Budget" value={request.budgetRange} /><Data label="Timeline" value={request.preferredTimeline} /><Data label="Additional notes" value={request.additionalNotes || 'None'} /></Section>
        <Section title="Requester portal"><Data label="Tracking link" value={portalUrl} /><Data label="Public status" value={(request.publicStatus || request.status).replaceAll('_', ' ')} /><Data label="Public note" value={request.publicNote || 'No public note yet'} /><Data label="Next update" value={request.nextUpdateAt || 'Not scheduled'} /><Data label="Estimated start" value={request.estimatedStartAt || 'To be confirmed'} /><Data label="Estimated delivery" value={request.estimatedDeliveryAt || 'To be confirmed'} /><Data label="GitHub links" value={(request.githubLinks ?? []).join('\n') || 'None linked'} /></Section>
        <Section title="Consent"><Data label="Project contact" value={request.contactConsent ? 'Granted' : 'Not granted'} /><Data label="SMS updates" value={request.smsConsent ? `Opted in (${request.smsStatus ?? 'pending'})` : 'Not requested'} /><Data label="Build Notes marketing" value={request.marketingConsent ? 'Granted separately' : 'Not granted'} /></Section>
        <EmailComposer request={request} onSent={() => void load()} />
        {request.phone && <SmsComposer request={request} onSent={() => void load()} />}
        <CommunicationTrail messages={messages} />
        <ActivityTrail activity={activity} />
      </div>
      <aside className="admin-editor">
        <h2>Manage request</h2>
        <SelectInput label="Internal status" value={request.status} options={statuses} onChange={(value) => set('status', value)} />
        <SelectInput label="Requester status" value={request.publicStatus ?? request.status} options={statuses} onChange={(value) => set('publicStatus', value)} />
        <SelectInput label="Priority" value={request.priority} options={priorities} onChange={(value) => set('priority', value)} />
        <label>Requester note<textarea rows={4} value={request.publicNote ?? ''} onChange={(event) => set('publicNote', event.target.value)} maxLength={1200} /></label>
        <label>Next public update<input type="date" value={request.nextUpdateAt ?? ''} onChange={(event) => set('nextUpdateAt', event.target.value)} /></label>
        <label>Estimated start<input type="date" value={request.estimatedStartAt ?? ''} onChange={(event) => set('estimatedStartAt', event.target.value)} /></label>
        <label>Estimated delivery<input type="date" value={request.estimatedDeliveryAt ?? ''} onChange={(event) => set('estimatedDeliveryAt', event.target.value)} /></label>
        <label>Shared links<textarea rows={3} value={(request.sharedLinks ?? []).join('\n')} onChange={(event) => set('sharedLinks', splitLines(event.target.value))} placeholder="One public link per line" /></label>
        <label><GitPullRequest size={15} /> GitHub links<textarea rows={3} value={(request.githubLinks ?? []).join('\n')} onChange={(event) => set('githubLinks', splitLines(event.target.value))} placeholder="Issues, pull requests or repo links" /></label>
        <label>Internal notes<textarea rows={7} value={request.internalNotes ?? ''} onChange={(event) => set('internalNotes', event.target.value)} maxLength={5000} /></label>
        <label>Tags<input value={(request.internalTags ?? []).join(', ')} onChange={(event) => set('internalTags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} placeholder="campus, website, follow-up" /></label>
        <label>Follow-up date<input type="date" value={request.followUpDate ?? ''} onChange={(event) => set('followUpDate', event.target.value)} /></label>
        <label>Proposal URL<input type="url" value={request.proposalUrl ?? ''} onChange={(event) => set('proposalUrl', event.target.value)} /></label>
        <label>Drive folder URL<input type="url" value={request.driveFolderUrl ?? ''} onChange={(event) => set('driveFolderUrl', event.target.value)} /></label>
        <button className="button" type="button" onClick={() => void save()} disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <Save size={17} />} Save changes</button>
        <button className="danger-button" type="button" onClick={() => void remove()}><Trash2 size={16} /> Delete request</button>
      </aside>
    </div>
  </section>;
}

function EmailComposer({ request, onSent }: { request: AdminRequest; onSent: () => void }) {
  const [subject, setSubject] = useState(`Your Pwavwe Studio request - ${request.reference}`);
  const [body, setBody] = useState(`Hi ${request.name.split(/\s+/)[0] || 'there'},\n\nThank you for your request. I have reviewed the details and wanted to follow up personally.`);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSending(true); setMessage(''); setError('');
    try {
      await sendAdminEmail({ to: request.email, subject, body, contextType: 'build_request', contextId: request.id, reference: request.reference });
      setMessage(`Sent to ${request.email}.`);
      onSent();
    } catch {
      setError('The email was not delivered.');
    } finally {
      setSending(false);
    }
  };
  return <section className="email-composer" id="email-client"><p className="eyebrow">SEND FROM THE PORTAL</p><h2><Mail size={18} /> Email client</h2><form onSubmit={send}><label>To<input value={request.email} readOnly /></label><label>Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} required /></label><label>Message<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={7} maxLength={5000} required /></label>{message && <p className="save-message" role="status">{message}</p>}{error && <p className="field-error" role="alert">{error}</p>}<button className="button" type="submit" disabled={sending || subject.trim().length < 2 || body.trim().length < 2}>{sending ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />} Send email</button></form></section>;
}

function SmsComposer({ request, onSent }: { request: AdminRequest; onSent: () => void }) {
  const [body, setBody] = useState(`Quick update on ${request.reference}: `);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSending(true); setMessage(''); setError('');
    try {
      await sendAdminSms({ requestId: request.id, body });
      setMessage(`SMS sent to ${request.phone}.`);
      onSent();
    } catch {
      setError('The SMS was not delivered. Check SMS opt-in, phone number, and Arkesel configuration.');
    } finally {
      setSending(false);
    }
  };
  return <section className="email-composer" id="sms-client"><p className="eyebrow">SMS UPDATES</p><h2><Smartphone size={18} /> Arkesel SMS</h2><form onSubmit={send}><label>To<input value={request.phone ?? ''} readOnly /></label><label>Message<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} maxLength={480} required /></label>{message && <p className="save-message" role="status">{message}</p>}{error && <p className="field-error" role="alert">{error}</p>}<button className="button" type="submit" disabled={sending || body.trim().length < 2}>{sending ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />} Send SMS</button></form></section>;
}

function CommunicationTrail({ messages }: { messages: RequestMessage[] }) {
  return <section><h2><MessageSquareQuote size={18} /> Communications</h2>{messages.length ? <div className="admin-trail">{messages.map((item) => <article key={item.id}><span>{item.channel} · {item.direction.replaceAll('_', ' ')}</span><strong>{item.subject || formatDate(item.createdAt)}</strong><p>{item.body}</p><time>{formatDate(item.createdAt)}</time></article>)}</div> : <p className="email-composer-intro">No portal communications logged yet.</p>}</section>;
}

function ActivityTrail({ activity }: { activity: RequestActivity[] }) {
  return <section><h2><Bell size={18} /> Audit log</h2>{activity.length ? <div className="admin-trail">{activity.map((item) => <article key={item.id}><span>{item.category || (item.public ? 'public' : 'internal')}</span><strong>{item.title || item.action.replaceAll('_', ' ')}</strong><p>{item.summary || item.subject || `Changed: ${(item.changedKeys ?? item.publicChangedKeys ?? []).join(', ') || 'record updated'}`}</p><time>{formatDate(item.createdAt)}</time>{item.url && <a className="text-link" href={item.url} target="_blank" rel="noreferrer">Open GitHub update</a>}</article>)}</div> : <p className="email-composer-intro">No activity recorded yet.</p>}</section>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2>{title}</h2>{children}</section>; }
function Data({ label, value }: { label: string; value: string }) { return <div className="data-row"><dt>{label}</dt><dd>{value}</dd></div>; }
function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option.replaceAll('_', ' ')}</option>)}</select></label>; }
function splitLines(value: string): string[] { return value.split('\n').map((item) => item.trim()).filter(Boolean); }

function formatDate(value: AdminRequest['createdAt'] | RequestActivity['createdAt']): string {
  if (!value) return 'Not available';
  const date = typeof value === 'string' ? new Date(value) : new Date(value.seconds * 1000);
  return Number.isNaN(date.getTime()) ? 'Not available' : new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium' }).format(date);
}
