import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Download, ExternalLink, LoaderCircle, LockKeyhole, LogIn, Mail, RefreshCw, Save, Search, Trash2 } from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { requestsToCsv } from '../lib/csv';
import {
  auth, deleteBuildRequest, getBuildRequest, googleProvider, listBuildRequests,
  updateBuildRequest, verifyBuildAdmin, type AdminRequest,
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
    <header className="admin-header"><div><p className="eyebrow">PWAVWE STUDIO · ADMIN</p><h1>Build requests</h1><p>Signed in as {user.email}</p></div><div className="button-row"><button className="button button-ghost button-small" type="button" onClick={() => void load()}><RefreshCw size={16} /> Refresh</button><button className="button button-ghost button-small" type="button" onClick={() => void signOut(auth)}>Sign out</button></div></header>
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

  useEffect(() => { void (async () => { try { setRequest((await getBuildRequest({ requestId })).data.request); } catch { setError('This request could not be loaded.'); } finally { setLoading(false); } })(); }, [requestId]);
  if (loading) return <AdminState icon={<LoaderCircle className="spin" />} title="Loading request…" message="Retrieving the protected request record." />;
  if (!request || error) return <AdminState icon={<AlertTriangle />} title="Request unavailable" message={error || 'The request does not exist.'} action={<Link className="button" to="/admin"><ArrowLeft size={16} /> Back to requests</Link>} />;

  const set = (key: keyof AdminRequest, value: unknown) => setRequest((current) => current ? { ...current, [key]: value } : current);
  const save = async () => {
    setMessage(''); setError('');
    try {
      await updateBuildRequest({ requestId, changes: { status: request.status, priority: request.priority, internalNotes: request.internalNotes ?? '', internalTags: request.internalTags ?? [], proposalUrl: request.proposalUrl ?? '', driveFolderUrl: request.driveFolderUrl ?? '', followUpDate: request.followUpDate ?? '' } });
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
  return <section className="admin-detail section-pad"><Link className="back-link" to="/admin"><ArrowLeft size={16} /> All requests</Link><header><div><p className="eyebrow">{request.reference}</p><h1>{request.organisation}</h1><p>Received {formatDate(request.createdAt)} · Updated {formatDate(request.updatedAt)}</p></div><div className="button-row"><a className="button button-ghost button-small" href={`mailto:${request.email}?subject=${encodeURIComponent(`Pwavwe Studio request ${request.reference}`)}`}><Mail size={16} /> Email</a>{whatsapp && <a className="button button-ghost button-small" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp <ExternalLink size={15} /></a>}</div></header>
    <div className="admin-detail-grid"><div className="request-record"><Section title="Requester"><Data label="Name" value={request.name} /><Data label="Email" value={request.email} /><Data label="Phone" value={request.phone || 'Not supplied'} /><Data label="Preferred contact" value={request.preferredContact} /></Section><Section title="Project"><Data label="Type" value={request.projectType} /><Data label="What they want to build" value={request.projectSummary} /><Data label="Problem" value={request.problemStatement} /><Data label="Intended users" value={request.targetUsers} /><Data label="Important features" value={request.features} /><Data label="Budget" value={request.budgetRange} /><Data label="Timeline" value={request.preferredTimeline} /><Data label="Additional notes" value={request.additionalNotes || 'None'} /></Section><Section title="Consent"><Data label="Project contact" value={request.contactConsent ? 'Granted' : 'Not granted'} /><Data label="Build Notes marketing" value={request.marketingConsent ? 'Granted separately' : 'Not granted'} /></Section></div>
      <aside className="admin-editor"><h2>Manage request</h2><SelectInput label="Status" value={request.status} options={statuses} onChange={(value) => set('status', value)} /><SelectInput label="Priority" value={request.priority} options={priorities} onChange={(value) => set('priority', value)} /><label>Internal notes<textarea rows={7} value={request.internalNotes ?? ''} onChange={(e) => set('internalNotes', e.target.value)} maxLength={5000} /></label><label>Tags<input value={(request.internalTags ?? []).join(', ')} onChange={(e) => set('internalTags', e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} placeholder="campus, website, follow-up" /></label><label>Follow-up date<input type="date" value={request.followUpDate ?? ''} onChange={(e) => set('followUpDate', e.target.value)} /></label><label>Proposal URL<input type="url" value={request.proposalUrl ?? ''} onChange={(e) => set('proposalUrl', e.target.value)} /></label><label>Drive folder URL<input type="url" value={request.driveFolderUrl ?? ''} onChange={(e) => set('driveFolderUrl', e.target.value)} /></label>{message && <p className="save-message" role="status">{message}</p>}{error && <p className="field-error" role="alert">{error}</p>}<button className="button" type="button" onClick={() => void save()}><Save size={17} /> Save changes</button><button className="danger-button" type="button" onClick={() => void remove()}><Trash2 size={16} /> Delete request</button></aside></div>
  </section>;
}

function Stat({ label, value }: { label: string; value: number }) { return <article><strong>{value}</strong><span>{label}</span></article>; }
function Breakdown({ title, values }: { title: string; values: string[] }) { const counts = [...new Set(values)].map((value) => [value, values.filter((item) => item === value).length] as const).sort((a, b) => b[1] - a[1]).slice(0, 5); return <article><h2>{title}</h2>{counts.length ? counts.map(([value, count]) => <div key={value}><span>{value.replaceAll('_', ' ')}</span><strong>{count}</strong></div>) : <p>No data yet.</p>}</article>; }
function Filter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="filter"><span className="sr-only">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}><option value="">All {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option.replaceAll('_', ' ')}</option>)}</select></label>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section><h2>{title}</h2>{children}</section>; }
function Data({ label, value }: { label: string; value: string }) { return <div className="data-row"><dt>{label}</dt><dd>{value}</dd></div>; }
function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label>{label}<select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }

function formatDate(value: AdminRequest['createdAt']): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : new Date(value.seconds * 1000);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium' }).format(date);
}
