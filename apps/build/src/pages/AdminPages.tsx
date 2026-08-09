import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, Copy, Download, ExternalLink, Eye, EyeOff, LoaderCircle, LockKeyhole, LogIn, Mail, MessageSquareQuote, RefreshCw, Save, Search, Send, Sparkles, Star, Trash2 } from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { requestsToCsv } from '../lib/csv';
import {
  auth, deleteBuildRequest, deleteTestimonial, getBuildRequest, getTestimonial, googleProvider, listBuildRequests,
  listTestimonials, reanalyzeTestimonial, sendAdminEmail, siteUrl, updateBuildRequest, updateTestimonial, verifyBuildAdmin, type AdminRequest, type AdminTestimonial,
} from '../lib/firebase';

const statuses = ['new', 'reviewing', 'needs_clarification', 'qualified', 'proposal_preparation', 'proposal_sent', 'accepted', 'in_development', 'delivered', 'declined', 'archived'];
const priorities = ['normal', 'high', 'urgent'];

type AccessState = { loading: boolean; user: User | null; authorized: boolean; denied: boolean };

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

function AdminGate({ children }: { children: (user: User) => React.ReactNode }) {
  const access = useAdminAccess();
  const [signInError, setSignInError] = useState('');
  if (access.loading) return <AdminState icon={<LoaderCircle className="spin" />} title="Checking access…" message="Verifying the signed-in account." />;
  if (!access.user || !access.authorized) return <AdminState icon={access.denied ? <AlertTriangle /> : <LockKeyhole />} title={access.denied ? 'Access denied' : 'Studio admin'} message={access.denied ? 'That account is not authorised to manage Pwavwe Studio requests.' : 'Sign in with an approved Google account. Authentication alone does not grant access.'} action={<><button className="button" type="button" onClick={async () => { setSignInError(''); try { await signInWithPopup(auth, googleProvider); } catch { setSignInError('Sign-in did not complete. Try again or use another approved account.'); } }}><LogIn size={18} /> Sign in with Google</button>{signInError && <p className="field-error" role="alert">{signInError}</p>}</>} />;
  return <>{children(access.user)}</>;
}

function AdminState({ icon, title, message, action }: { icon: React.ReactNode; title: string; message: string; action?: React.ReactNode }) {
  return <section className="admin-state section-pad">{icon}<p className="eyebrow">PROTECTED AREA</p><h1>{title}</h1><p>{message}</p>{action}</section>;
}

export function AdminPage() {
  return <><Seo title="Studio Admin — Pwavwe Studio" description="Protected Pwavwe Studio request management." path="/admin" noIndex /><AdminGate>{(user) => <Dashboard user={user} />}</AdminGate></>;
}

function Dashboard({ user }: { user: User }) {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setRequests((await listBuildRequests({ limit: 250 })).data.requests); }
    catch { setError('The request list could not be loaded. No data was changed.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => requests.filter((request) => {
    const haystack = `${request.reference} ${request.name} ${request.email} ${request.organisation} ${request.projectSummary}`.toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) && (!status || request.status === status) && (!type || request.projectType === type) && (!budget || request.budgetRange === budget);
  }), [budget, requests, search, status, type]);

  const projectTypes = [...new Set(requests.map((request) => request.projectType))].sort();
  const budgets = [...new Set(requests.map((request) => request.budgetRange))].sort();
  const count = (values: string[]) => requests.filter((request) => values.includes(request.status)).length;

  const exportCsv = () => {
    const blob = new Blob([requestsToCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href; anchor.download = `pwavwe-studio-requests-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click();
    URL.revokeObjectURL(href);
  };

  return <section className="admin-shell section-pad">
    <header className="admin-header"><div><p className="eyebrow">PWAVWE STUDIO · ADMIN</p><h1>Build requests</h1><p>Signed in as {user.email}</p></div><div className="button-row"><Link className="button button-ghost button-small" to="/admin/feedback"><MessageSquareQuote size={16} /> Testimonials</Link><button className="button button-ghost button-small" type="button" onClick={() => void load()}><RefreshCw size={16} /> Refresh</button><button className="button button-ghost button-small" type="button" onClick={() => void signOut(auth)}>Sign out</button></div></header>
    <div className="admin-stats"><Stat label="Total requests" value={requests.length} /><Stat label="New" value={count(['new'])} /><Stat label="Qualified" value={count(['qualified'])} /><Stat label="Proposals sent" value={count(['proposal_sent'])} /><Stat label="Active projects" value={count(['accepted', 'in_development'])} /><Stat label="Delivered" value={count(['delivered'])} /></div>
    <div className="admin-breakdown"><Breakdown title="By project type" values={requests.map((request) => request.projectType)} /><Breakdown title="By status" values={requests.map((request) => request.status)} /><Breakdown title="Budget distribution" values={requests.map((request) => request.budgetRange)} /></div>
    <div className="admin-toolbar"><label className="search-box"><Search size={17} /><span className="sr-only">Search requests</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reference, person, organisation…" /></label><Filter label="Status" value={status} onChange={setStatus} options={statuses} /><Filter label="Project type" value={type} onChange={setType} options={projectTypes} /><Filter label="Budget" value={budget} onChange={setBudget} options={budgets} /><button className="button button-small button-ghost" type="button" onClick={exportCsv} disabled={!filtered.length}><Download size={16} /> CSV</button></div>
    {loading ? <div className="table-state"><LoaderCircle className="spin" /> Loading requests…</div> : error ? <div className="table-state error" role="alert"><AlertTriangle /> {error}<button type="button" onClick={() => void load()}>Try again</button></div> : !filtered.length ? <div className="table-state">No requests match these filters.</div> : <div className="request-table-wrap"><table><thead><tr><th>Reference</th><th>Requester</th><th>Project</th><th>Budget</th><th>Status</th><th>Received</th></tr></thead><tbody>{filtered.map((request) => <tr key={request.id}><td><Link to={`/admin/requests/${request.id}`}>{request.reference}</Link></td><td><strong>{request.name}</strong><small>{request.organisation}</small></td><td>{request.projectType}</td><td>{request.budgetRange}</td><td><span className={`status-pill status-${request.status}`}>{request.status.replaceAll('_', ' ')}</span></td><td>{formatDate(request.createdAt)}</td></tr>)}</tbody></table></div>}
  </section>;
}

export function AdminRequestPage() {
  return <><Seo title="Request Detail — Pwavwe Studio" description="Protected request detail." path="/admin/requests" noIndex /><AdminGate>{() => <RequestDetail />}</AdminGate></>;
}

function RequestDetail() {
  const { requestId = '' } = useParams();
  const [request, setRequest] = useState<AdminRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadDetail = useCallback(async () => {
    try {
      const requestResult = await getBuildRequest({ requestId });
      setRequest(requestResult.data.request);
    } catch {
      setError('This request could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => { void loadDetail(); }, [loadDetail]);
  if (loading) return <AdminState icon={<LoaderCircle className="spin" />} title="Loading request…" message="Retrieving the protected request record." />;
  if (!request || error) return <AdminState icon={<AlertTriangle />} title="Request unavailable" message={error || 'The request does not exist.'} action={<Link className="button" to="/admin"><ArrowLeft size={16} /> Back to requests</Link>} />;

  const set = (key: keyof AdminRequest, value: unknown) => setRequest((current) => current ? { ...current, [key]: value } : current);
  const save = async () => {
    setMessage(''); setError('');
    try {
      await updateBuildRequest({ requestId, changes: {
        status: request.status, priority: request.priority, internalNotes: request.internalNotes ?? '', internalTags: request.internalTags ?? [],
        proposalUrl: request.proposalUrl ?? '', driveFolderUrl: request.driveFolderUrl ?? '', followUpDate: request.followUpDate ?? '',
        publicStatus: request.publicStatus ?? request.status, publicNote: request.publicNote ?? '', nextUpdateAt: request.nextUpdateAt ?? '',
        estimatedStartAt: request.estimatedStartAt ?? '', estimatedDeliveryAt: request.estimatedDeliveryAt ?? '',
        sharedLinks: request.sharedLinks ?? [], githubLinks: request.githubLinks ?? [],
      } });
      setMessage('Changes saved and added to the activity trail.');
    } catch { setError('Changes could not be saved. The existing request remains unchanged.'); }
  };
  const remove = async () => {
    const confirmation = window.prompt(`Type ${request.reference} to permanently delete this request.`);
    if (confirmation !== request.reference) return;
    try { await deleteBuildRequest({ requestId, confirmation }); navigate('/admin'); }
    catch { setError('The request could not be deleted.'); }
  };

  const whatsapp = request.phone ? `https://wa.me/${request.phone.replace(/\D/g, '')}` : '';
  return <section className="admin-detail section-pad"><Link className="back-link" to="/admin"><ArrowLeft size={16} /> All requests</Link><header><div><p className="eyebrow">{request.reference}</p><h1>{request.organisation}</h1><p>Received {formatDate(request.createdAt)} · Updated {formatDate(request.updatedAt)}</p></div><div className="button-row"><a className="button button-ghost button-small" href="#email-client"><Mail size={16} /> Email from portal</a>{whatsapp && <a className="button button-ghost button-small" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp <ExternalLink size={15} /></a>}</div></header>
    <div className="admin-detail-grid"><div className="request-record"><Section title="Requester"><Data label="Name" value={request.name} /><Data label="Email" value={request.email} /><Data label="Phone" value={request.phone || 'Not supplied'} /><Data label="Preferred contact" value={request.preferredContact} /></Section><Section title="Project"><Data label="Type" value={request.projectType} /><Data label="What they want to build" value={request.projectSummary} /><Data label="Problem" value={request.problemStatement} /><Data label="Intended users" value={request.targetUsers} /><Data label="Important features" value={request.features} /><Data label="Budget" value={request.budgetRange} /><Data label="Timeline" value={request.preferredTimeline} /><Data label="Additional notes" value={request.additionalNotes || 'None'} /></Section><Section title="Consent"><Data label="Project contact" value={request.contactConsent ? 'Granted' : 'Not granted'} /><Data label="Build Notes marketing" value={request.marketingConsent ? 'Granted separately' : 'Not granted'} /></Section><EmailComposer to={request.email} contextType="build_request" contextId={request.id} reference={request.reference} initialSubject={`Your Pwavwe Studio request - ${request.reference}`} initialBody={`Hi ${request.name.split(/\s+/)[0] || 'there'},\n\nThank you for your request. I have reviewed the details and wanted to follow up personally.`} /></div>
      <aside className="admin-editor"><h2>Manage request</h2><SelectInput label="Status" value={request.status} options={statuses} onChange={(value) => set('status', value)} /><SelectInput label="Priority" value={request.priority} options={priorities} onChange={(value) => set('priority', value)} /><label>Internal notes<textarea rows={7} value={request.internalNotes ?? ''} onChange={(e) => set('internalNotes', e.target.value)} maxLength={5000} /></label><label>Tags<input value={(request.internalTags ?? []).join(', ')} onChange={(e) => set('internalTags', e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} placeholder="campus, website, follow-up" /></label><label>Follow-up date<input type="date" value={request.followUpDate ?? ''} onChange={(e) => set('followUpDate', e.target.value)} /></label><label>Proposal URL<input type="url" value={request.proposalUrl ?? ''} onChange={(e) => set('proposalUrl', e.target.value)} /></label><label>Drive folder URL<input type="url" value={request.driveFolderUrl ?? ''} onChange={(e) => set('driveFolderUrl', e.target.value)} /></label>{message && <p className="save-message" role="status">{message}</p>}{error && <p className="field-error" role="alert">{error}</p>}<button className="button" type="button" onClick={() => void save()}><Save size={17} /> Save changes</button><button className="danger-button" type="button" onClick={() => void remove()}><Trash2 size={16} /> Delete request</button></aside></div>
  </section>;
}

function Stat({ label, value }: { label: string; value: number }) { return <article><strong>{value}</strong><span>{label}</span></article>; }
function Breakdown({ title, values }: { title: string; values: string[] }) { const counts = [...new Set(values)].map((value) => [value, values.filter((item) => item === value).length] as const).sort((a, b) => b[1] - a[1]).slice(0, 5); return <article><h2>{title}</h2>{counts.length ? counts.map(([value, count]) => <div key={value}><span>{value.replaceAll('_', ' ')}</span><strong>{count}</strong></div>) : <p>No data yet.</p>}</article>; }
function Filter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="filter"><span className="sr-only">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}><option value="">All {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option.replaceAll('_', ' ')}</option>)}</select></label>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2>{title}</h2>{children}</section>; }
function Data({ label, value }: { label: string; value: string }) { return <div className="data-row"><dt>{label}</dt><dd>{value}</dd></div>; }
function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label>{label}<select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }

function EmailComposer({ to, contextType, contextId, reference, initialSubject, initialBody }: {
  to: string;
  contextType: 'build_request' | 'testimonial';
  contextId: string;
  reference: string;
  initialSubject: string;
  initialBody: string;
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const send = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setMessage(''); setError(''); setSending(true);
    try {
      await sendAdminEmail({ to, subject, body, contextType, contextId, reference });
      setMessage(`Sent to ${to} from francis@pwavwe.com.`);
    } catch { setError('The email was not delivered. Check the message and try again.'); }
    finally { setSending(false); }
  };
  return <section className="email-composer" id="email-client">
    <p className="eyebrow">SEND FROM THE PORTAL</p>
    <h2>Email client</h2>
    <p className="email-composer-intro">A short, branded Pwavwe Studio email will be sent through francis@pwavwe.com and added to the activity trail.</p>
    <form onSubmit={(event) => void send(event)}>
      <label>To<input value={to} readOnly /></label>
      <label>Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} required /></label>
      <label>Message<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={7} maxLength={5000} required /></label>
      {message && <p className="save-message" role="status">{message}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
      <button className="button" type="submit" disabled={sending || subject.trim().length < 2 || body.trim().length < 2}>{sending ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />} {sending ? 'Sending…' : 'Send email'}</button>
    </form>
  </section>;
}

function formatDate(value: AdminRequest['createdAt']): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : new Date(value.seconds * 1000);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium' }).format(date);
}

// ── Testimonials portal ──────────────────────────────────────────────────────

const testimonialStatuses = ['pending', 'approved', 'featured', 'hidden'];

export function AdminFeedbackPage() {
  return <><Seo title="Testimonials — Pwavwe Studio Admin" description="Protected Pwavwe Studio testimonial management." path="/admin/feedback" noIndex /><AdminGate>{(user) => <FeedbackDashboard user={user} />}</AdminGate></>;
}

function FeedbackDashboard({ user }: { user: User }) {
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setTestimonials((await listTestimonials({ limit: 250 })).data.testimonials); }
    catch { setError('The testimonial list could not be loaded. No data was changed.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => testimonials.filter((item) => {
    const haystack = `${item.reference} ${item.authorName} ${item.authorOrganisation ?? ''} ${item.projectName ?? ''} ${item.testimonial}`.toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) && (!status || item.status === status);
  }), [search, status, testimonials]);

  const published = testimonials.filter((item) => item.published).length;
  const ratings = testimonials.map((item) => item.rating).filter((rating) => rating > 0);
  const average = ratings.length ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : '—';

  return <section className="admin-shell section-pad">
    <header className="admin-header"><div><p className="eyebrow">PWAVWE STUDIO · ADMIN</p><h1>Testimonials</h1><p>Signed in as {user.email}</p></div><div className="button-row"><Link className="button button-ghost button-small" to="/admin"><ArrowLeft size={16} /> Requests</Link><button className="button button-ghost button-small" type="button" onClick={() => void load()}><RefreshCw size={16} /> Refresh</button><button className="button button-ghost button-small" type="button" onClick={() => void signOut(auth)}>Sign out</button></div></header>
    <div className="admin-stats stats-4"><Stat label="Total received" value={testimonials.length} /><Stat label="Awaiting review" value={testimonials.filter((item) => item.status === 'pending').length} /><Stat label="Live on site" value={published} /><Stat label="Average rating" value={average as unknown as number} /></div>
    <LinkGenerator />
    <div className="admin-toolbar toolbar-2"><label className="search-box"><Search size={17} /><span className="sr-only">Search testimonials</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search person, project, words…" /></label><Filter label="Status" value={status} onChange={setStatus} options={testimonialStatuses} /></div>
    {loading ? <div className="table-state"><LoaderCircle className="spin" /> Loading testimonials…</div> : error ? <div className="table-state error" role="alert"><AlertTriangle /> {error}<button type="button" onClick={() => void load()}>Try again</button></div> : !filtered.length ? <div className="table-state">No testimonials match these filters.</div> : <div className="request-table-wrap"><table><thead><tr><th>Reference</th><th>From</th><th>Project</th><th>Rating</th><th>Sentiment</th><th>Status</th><th>Public</th><th>Received</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><Link to={`/admin/feedback/${item.id}`}>{item.reference}</Link></td><td><strong>{item.authorName}</strong><small>{item.authorOrganisation}</small></td><td>{item.projectName || '—'}</td><td><Stars rating={item.rating} /></td><td><SentimentBadge item={item} /></td><td><span className={`status-pill status-${item.status}`}>{item.status}</span></td><td>{item.published ? <span className="live-dot" title="Live on site"><Eye size={15} /> Live</span> : <span className="muted-dot"><EyeOff size={15} /> Hidden</span>}</td><td>{formatDate(item.createdAt)}</td></tr>)}</tbody></table></div>}
  </section>;
}

function LinkGenerator() {
  const [project, setProject] = useState('');
  const [ref, setRef] = useState('');
  const [copied, setCopied] = useState(false);
  const params = new URLSearchParams();
  if (project.trim()) params.set('project', project.trim());
  if (ref.trim()) params.set('ref', ref.trim());
  const link = `${siteUrl}/feedback${params.toString() ? `?${params.toString()}` : ''}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }
    catch { /* clipboard may be unavailable; the field is selectable as a fallback */ }
  };
  return <div className="link-generator">
    <div><p className="eyebrow">SHARE A FEEDBACK LINK</p><p className="link-generator-intro">Send this to a client after a project. Fill in the project (and reference) to pre-fill their form.</p></div>
    <div className="link-generator-fields"><label>Project name<input value={project} onChange={(e) => setProject(e.target.value)} placeholder="e.g. UCC SRC App" /></label><label>Request reference<input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. PWS-2026-ABC123" /></label></div>
    <div className="link-generator-output"><code>{link}</code><button className="button button-small" type="button" onClick={() => void copy()}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy link</>}</button></div>
  </div>;
}

export function AdminTestimonialPage() {
  return <><Seo title="Testimonial Detail — Pwavwe Studio" description="Protected testimonial detail." path="/admin/feedback" noIndex /><AdminGate>{() => <TestimonialDetail />}</AdminGate></>;
}

function TestimonialDetail() {
  const { testimonialId = '' } = useParams();
  const [item, setItem] = useState<AdminTestimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { void (async () => { try { setItem((await getTestimonial({ testimonialId })).data.testimonial); } catch { setError('This testimonial could not be loaded.'); } finally { setLoading(false); } })(); }, [testimonialId]);
  if (loading) return <AdminState icon={<LoaderCircle className="spin" />} title="Loading testimonial…" message="Retrieving the protected record." />;
  if (!item || error) return <AdminState icon={<AlertTriangle />} title="Testimonial unavailable" message={error || 'It does not exist.'} action={<Link className="button" to="/admin/feedback"><ArrowLeft size={16} /> Back to testimonials</Link>} />;

  const set = (key: keyof AdminTestimonial, value: unknown) => setItem((current) => current ? { ...current, [key]: value } : current);
  const save = async (publishOverride?: boolean) => {
    setMessage(''); setError(''); setSaving(true);
    const published = publishOverride ?? Boolean(item.published);
    try {
      const result = await updateTestimonial({ testimonialId, changes: {
        status: item.status, displayName: item.displayName ?? '', displayRole: item.displayRole ?? '', displayOrganisation: item.displayOrganisation ?? '',
        displayQuote: item.displayQuote ?? '', featured: Boolean(item.featured), order: Number(item.order) || 0, internalNotes: item.internalNotes ?? '', published,
      } });
      set('published', result.data.published);
      setMessage(result.data.published ? 'Saved. This testimonial is now live on the site.' : 'Saved. This testimonial is not shown publicly.');
    } catch { setError('Changes could not be saved. The existing record remains unchanged.'); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    const confirmation = window.prompt(`Type ${item.reference} to permanently delete this testimonial.`);
    if (confirmation !== item.reference) return;
    try { await deleteTestimonial({ testimonialId, confirmation }); navigate('/admin/feedback'); }
    catch { setError('The testimonial could not be deleted.'); }
  };
  const analyze = async () => {
    setMessage(''); setError(''); setAnalyzing(true);
    try {
      const result = await reanalyzeTestimonial({ testimonialId });
      setItem((current) => current ? { ...current, sentimentStatus: 'analyzed', sentiment: result.data.sentiment } : current);
      setMessage('Vertex sentiment analysis is up to date.');
    } catch { setError('Vertex analysis could not run just now. Try again shortly.'); }
    finally { setAnalyzing(false); }
  };

  const canPublish = Boolean(item.publishConsent);
  return <section className="admin-detail section-pad"><Link className="back-link" to="/admin/feedback"><ArrowLeft size={16} /> All testimonials</Link>
    <header><div><p className="eyebrow">{item.reference}</p><h1>{item.authorName}</h1><p>Received {formatDate(item.createdAt)} · Updated {formatDate(item.updatedAt)} · {item.published ? 'Live on site' : 'Not public'}</p></div><div className="button-row">{item.authorEmail && <a className="button button-ghost button-small" href="#email-client"><Mail size={16} /> Email from portal</a>}<Link className="button button-ghost button-small" to="/testimonials" target="_blank"><ExternalLink size={15} /> Public wall</Link></div></header>
    <div className="admin-detail-grid">
      <div className="request-record">
        <Section title="What they submitted">
          <div className="data-row"><dt>Rating</dt><dd><Stars rating={item.rating} /> {item.rating}/5</dd></div>
          <Data label="Testimonial" value={item.testimonial} />
          <Data label="Private feedback" value={item.privateFeedback || 'None — nothing withheld'} />
          <Data label="Would recommend" value={item.wouldRecommend ? 'Yes' : 'Not stated'} />
        </Section>
        <Section title="Author & consent">
          <Data label="Name" value={item.authorName} />
          <Data label="Email" value={item.authorEmail || 'Not supplied'} />
          <Data label="Role" value={item.authorRole || 'Not supplied'} />
          <Data label="Organisation" value={item.authorOrganisation || 'Not supplied'} />
          <Data label="Project" value={item.projectName || 'Not supplied'} />
          <Data label="Publish permission" value={item.publishConsent ? 'Granted by the author' : 'Not granted — cannot be published'} />
          <Data label="Full-name permission" value={item.displayNameConsent ? 'Full name allowed' : 'First name only'} />
        </Section>
        <Section title="Vertex sentiment">
          <div className="sentiment-summary"><SentimentBadge item={item} />{item.sentiment && <span>{Math.round(item.sentiment.confidence * 100)}% confidence</span>}</div>
          {item.sentiment ? <><p>{item.sentiment.summary}</p><Data label="Score" value={`${item.sentiment.score.toFixed(2)} (-1 negative to +1 positive)`} /><Data label="Themes" value={item.sentiment.themes.join(', ') || 'None identified'} /><Data label="Follow-up" value={item.sentiment.followUpRecommended ? 'Recommended' : 'Not required'} /><Data label="Model" value={item.sentiment.model || 'Vertex AI'} /></> : <p>{item.sentimentStatus === 'failed' ? 'The last analysis attempt failed.' : 'Analysis is pending.'}</p>}
          <button className="button button-ghost button-small sentiment-rerun" type="button" onClick={() => void analyze()} disabled={analyzing}>{analyzing ? <LoaderCircle className="spin" size={15} /> : <Sparkles size={15} />} {analyzing ? 'Analyzing…' : 'Run analysis again'}</button>
        </Section>
        {item.authorEmail && <EmailComposer to={item.authorEmail} contextType="testimonial" contextId={item.id} reference={item.reference} initialSubject={`Thank you for your feedback - ${item.reference}`} initialBody={`Hi ${item.authorName.split(/\s+/)[0] || 'there'},\n\nThank you for taking the time to share your feedback. I appreciate it.`} />}
      </div>
      <aside className="admin-editor">
        <h2>Curate & publish</h2>
        {!canPublish && <p className="pay-pending" style={{ margin: '0 0 1rem' }}>The author did not grant publish permission, so this testimonial can be kept for reference but not shown publicly.</p>}
        <label>Display name<input value={item.displayName ?? ''} onChange={(e) => set('displayName', e.target.value)} maxLength={200} /></label>
        <label>Display role<input value={item.displayRole ?? ''} onChange={(e) => set('displayRole', e.target.value)} maxLength={200} placeholder="e.g. SRC President" /></label>
        <label>Display organisation<input value={item.displayOrganisation ?? ''} onChange={(e) => set('displayOrganisation', e.target.value)} maxLength={200} /></label>
        <label>Public quote<textarea rows={5} value={item.displayQuote ?? ''} onChange={(e) => set('displayQuote', e.target.value)} maxLength={1500} /></label>
        <label>Status<select value={item.status} onChange={(e) => set('status', e.target.value)}>{testimonialStatuses.map((option) => <option key={option}>{option}</option>)}</select></label>
        <div className="checkbox-wrap" style={{ margin: '0 0 1rem' }}><label><input type="checkbox" checked={Boolean(item.featured)} onChange={(e) => set('featured', e.target.checked)} /><span>Feature this one (shown first on the wall)</span></label></div>
        <label>Order<input type="number" value={Number(item.order) || 0} onChange={(e) => set('order', Number(e.target.value))} /></label>
        <label>Internal notes<textarea rows={3} value={item.internalNotes ?? ''} onChange={(e) => set('internalNotes', e.target.value)} maxLength={5000} /></label>
        {message && <p className="save-message" role="status">{message}</p>}
        {error && <p className="field-error" role="alert">{error}</p>}
        <button className="button" type="button" onClick={() => void save()} disabled={saving}><Save size={17} /> Save changes</button>
        {item.published
          ? <button className="button button-ghost" type="button" onClick={() => void save(false)} disabled={saving}><EyeOff size={16} /> Unpublish from site</button>
          : <button className="button" type="button" onClick={() => void save(true)} disabled={saving || !canPublish} style={{ background: 'var(--teal)', borderColor: 'var(--teal)' }}><Eye size={16} /> Publish to site</button>}
        <button className="danger-button" type="button" onClick={() => void remove()}><Trash2 size={16} /> Delete testimonial</button>
      </aside>
    </div>
  </section>;
}

function Stars({ rating }: { rating: number }) {
  const value = Math.max(0, Math.min(5, Math.round(rating)));
  return <span className="table-stars" aria-label={`${value} out of 5`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={13} fill={star <= value ? 'currentColor' : 'none'} className={star <= value ? 'is-on' : ''} />)}</span>;
}

function SentimentBadge({ item }: { item: AdminTestimonial }) {
  if (item.sentimentStatus !== 'analyzed' || !item.sentiment) return <span className={`sentiment-badge sentiment-${item.sentimentStatus ?? 'pending'}`}>{item.sentimentStatus === 'failed' ? 'Analysis failed' : 'Analyzing'}</span>;
  return <span className={`sentiment-badge sentiment-${item.sentiment.label}`}>{item.sentiment.label}</span>;
}
