import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  AlertTriangle, ArrowLeft, Bell, CheckCircle2, Clock, ExternalLink, Eye, EyeOff, GitPullRequest,
  ListChecks, LoaderCircle, Mail, MessageSquareQuote, Plus, Save, Send, ShieldAlert, Smartphone, Trash2,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import {
  deleteBuildRequest, getBuildRequest, listRequestActivity, listRequestMessages,
  sendAdminEmail, sendAdminSms, siteUrl, updateBuildRequest,
  type AdminRequest, type ProjectDecision, type ProjectMeeting, type ProjectMilestone,
  type ProjectRisk, type ProjectTask, type RequestActivity, type RequestMessage,
} from '../lib/firebase';

const statuses = ['new', 'reviewing', 'needs_clarification', 'qualified', 'proposal_preparation', 'proposal_sent', 'accepted', 'in_development', 'delivered', 'declined', 'archived'];
const priorities = ['normal', 'high', 'urgent'];
const projectHealthOptions = ['on_track', 'watch', 'at_risk', 'paused'];
const deliveryConfidenceOptions = ['high', 'medium', 'low'];
const milestoneStatuses: ProjectMilestone['status'][] = ['planned', 'active', 'complete', 'blocked'];
const taskStatuses: ProjectTask['status'][] = ['todo', 'doing', 'blocked', 'done'];
const decisionStatuses: ProjectDecision['status'][] = ['open', 'decided', 'revisit'];
const riskLevels: ProjectRisk['level'][] = ['low', 'medium', 'high', 'critical'];
const riskStatuses: ProjectRisk['status'][] = ['open', 'mitigating', 'resolved'];

export function AdminRequestPage() {
  return <RequestDetail />;
}

function StatePanel({ icon, title, message, action }: { icon: ReactNode; title: string; message: string; action?: ReactNode }) {
  return <section className="admin-state">{icon}<p className="eyebrow">STUDIO CONSOLE</p><h1>{title}</h1><p>{message}</p>{action}</section>;
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
        projectHealth: request.projectHealth ?? 'on_track', deliveryConfidence: request.deliveryConfidence ?? 'medium',
        currentFocus: request.currentFocus ?? '', nextStep: request.nextStep ?? '',
        acceptanceCriteria: request.acceptanceCriteria ?? [],
        projectMilestones: withDefaultMilestones(request.projectMilestones),
        projectTasks: request.projectTasks ?? [],
        projectDecisions: request.projectDecisions ?? [],
        projectRisks: request.projectRisks ?? [],
        projectMeetings: request.projectMeetings ?? [],
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

  return <section className="admin-detail dash-page">
    <Seo title={`${request.reference} - Request - Pwavwe Studio`} description="Protected request detail." path="/admin/requests" noIndex />
    <Link className="back-link" to="/admin"><ArrowLeft size={16} /> All requests</Link>
    <header>
      <div>
        <p className="eyebrow">{request.reference}</p>
        <h1>{request.organisation}</h1>
        <p>Received {formatDate(request.createdAt)} / Updated {formatDate(request.updatedAt)}</p>
      </div>
      <div className="button-row">
        <a className="button button-ghost button-small" href="#email-client"><Mail size={16} /> Email</a>
        {request.phone && <a className="button button-ghost button-small" href="#sms-client"><Smartphone size={16} /> SMS</a>}
        <Link className="button button-ghost button-small" to={`/request/status?reference=${encodeURIComponent(request.reference)}`} target="_blank"><Bell size={16} /> Portal</Link>
        {whatsapp && <a className="button button-ghost button-small" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp <ExternalLink size={15} /></a>}
      </div>
    </header>
    {notice && <p className="save-message" role="status">{notice}</p>}
    {error && <p className="field-error" role="alert">{error}</p>}

    <ProjectPulse request={request} />

    <div className="admin-detail-grid">
      <div className="request-record">
        <Section title="Requester">
          <Data label="Name" value={request.name} />
          <Data label="Email" value={request.email} />
          <Data label="Phone" value={request.phone || 'Not supplied'} />
          <Data label="Preferred contact" value={request.preferredContact} />
        </Section>
        <Section title="Project brief">
          <Data label="Type" value={request.projectType} />
          <Data label="What they want to build" value={request.projectSummary} />
          <Data label="Problem" value={request.problemStatement} />
          <Data label="Intended users" value={request.targetUsers} />
          <Data label="Important features" value={request.features} />
          <Data label="Budget" value={request.budgetRange} />
          <Data label="Timeline" value={request.preferredTimeline} />
          <Data label="Additional notes" value={request.additionalNotes || 'None'} />
        </Section>
        <ProjectWorkspace request={request} onChange={set} />
        <Section title="Requester portal">
          <Data label="Tracking link" value={portalUrl} />
          <Data label="Public status" value={humanize(request.publicStatus || request.status)} />
          <Data label="Public note" value={request.publicNote || 'No public note yet'} />
          <Data label="Next update" value={request.nextUpdateAt || 'Not scheduled'} />
          <Data label="Estimated start" value={request.estimatedStartAt || 'To be confirmed'} />
          <Data label="Estimated delivery" value={request.estimatedDeliveryAt || 'To be confirmed'} />
          <Data label="GitHub links" value={(request.githubLinks ?? []).join('\n') || 'None linked'} />
        </Section>
        <Section title="Consent">
          <Data label="Project contact" value={request.contactConsent ? 'Granted' : 'Not granted'} />
          <Data label="SMS updates" value={request.smsConsent ? `Opted in (${request.smsStatus ?? 'pending'})` : 'Not requested'} />
          <Data label="Build Notes marketing" value={request.marketingConsent ? 'Granted separately' : 'Not granted'} />
        </Section>
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
        <SelectInput label="Health" value={request.projectHealth ?? 'on_track'} options={projectHealthOptions} onChange={(value) => set('projectHealth', value)} />
        <SelectInput label="Delivery confidence" value={request.deliveryConfidence ?? 'medium'} options={deliveryConfidenceOptions} onChange={(value) => set('deliveryConfidence', value)} />
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

function ProjectPulse({ request }: { request: AdminRequest }) {
  const milestones = withDefaultMilestones(request.projectMilestones);
  const tasks = request.projectTasks ?? [];
  const risks = request.projectRisks ?? [];
  const visible = [...milestones, ...tasks, ...(request.projectDecisions ?? []), ...risks, ...(request.projectMeetings ?? [])].filter((item) => item.visibleToRequester !== false).length;
  const openRisks = risks.filter((risk) => risk.status !== 'resolved').length;
  const doneTasks = tasks.filter((task) => task.status === 'done').length;
  const completeMilestones = milestones.filter((item) => item.status === 'complete').length;

  return <section className="project-pulse">
    <article><span>Health</span><strong className={`health-${request.projectHealth ?? 'on_track'}`}>{humanize(request.projectHealth ?? 'on_track')}</strong><small>{humanize(request.deliveryConfidence ?? 'medium')} confidence</small></article>
    <article><span>Current focus</span><strong>{request.currentFocus || 'Not set'}</strong><small>{request.nextStep || 'No next step recorded'}</small></article>
    <article><span>Milestones</span><strong>{completeMilestones}/{milestones.length}</strong><small>{milestones.filter((item) => item.status === 'active').length} active</small></article>
    <article><span>Tasks</span><strong>{doneTasks}/{tasks.length}</strong><small>{tasks.filter((task) => task.status === 'blocked').length} blocked</small></article>
    <article><span>Risk watch</span><strong>{openRisks}</strong><small>{visible} requester-visible records</small></article>
  </section>;
}

function ProjectWorkspace({ request, onChange }: { request: AdminRequest; onChange: (key: keyof AdminRequest, value: unknown) => void }) {
  const milestones = withDefaultMilestones(request.projectMilestones);
  const tasks = request.projectTasks ?? [];
  const decisions = request.projectDecisions ?? [];
  const risks = request.projectRisks ?? [];
  const meetings = request.projectMeetings ?? [];

  const updateMilestone = (id: string, patch: Partial<ProjectMilestone>) => onChange('projectMilestones', updateById(milestones, id, patch));
  const updateTask = (id: string, patch: Partial<ProjectTask>) => onChange('projectTasks', updateById(tasks, id, patch));
  const updateDecision = (id: string, patch: Partial<ProjectDecision>) => onChange('projectDecisions', updateById(decisions, id, patch));
  const updateRisk = (id: string, patch: Partial<ProjectRisk>) => onChange('projectRisks', updateById(risks, id, patch));
  const updateMeeting = (id: string, patch: Partial<ProjectMeeting>) => onChange('projectMeetings', updateById(meetings, id, patch));

  return <section className="project-workspace">
    <div className="section-title-row"><div><p className="eyebrow">PROJECT MANAGEMENT</p><h2>Delivery control room</h2></div><span>{milestones.length + tasks.length + decisions.length + risks.length + meetings.length} tracked records</span></div>
    <div className="project-brief-grid">
      <label>Current focus<textarea rows={3} value={request.currentFocus ?? ''} onChange={(event) => onChange('currentFocus', event.target.value)} maxLength={600} /></label>
      <label>Next step<textarea rows={3} value={request.nextStep ?? ''} onChange={(event) => onChange('nextStep', event.target.value)} maxLength={600} /></label>
      <label>Acceptance criteria<textarea rows={4} value={(request.acceptanceCriteria ?? []).join('\n')} onChange={(event) => onChange('acceptanceCriteria', splitLines(event.target.value))} placeholder="One delivery check per line" /></label>
    </div>
    <div className="workspace-grid">
      <div className="workspace-column workspace-wide">
        <ListHeader icon={<CheckCircle2 size={17} />} title="Milestones" onAdd={() => onChange('projectMilestones', [...milestones, createMilestone()])} />
        <div className="editable-list">
          {milestones.map((item) => <article key={item.id} className="editable-item">
            <div className="editable-item-head">
              <input aria-label="Milestone title" value={item.title} onChange={(event) => updateMilestone(item.id, { title: event.target.value })} />
              <select aria-label="Milestone status" value={item.status} onChange={(event) => updateMilestone(item.id, { status: event.target.value as ProjectMilestone['status'] })}>{milestoneStatuses.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}</select>
            </div>
            <div className="editable-mini-grid">
              <label>Owner<input value={item.owner ?? ''} onChange={(event) => updateMilestone(item.id, { owner: event.target.value })} /></label>
              <label>Due<input type="date" value={item.dueDate ?? ''} onChange={(event) => updateMilestone(item.id, { dueDate: event.target.value })} /></label>
              <label>Completed<input type="date" value={item.completedAt ?? ''} onChange={(event) => updateMilestone(item.id, { completedAt: event.target.value })} /></label>
            </div>
            <textarea aria-label="Milestone summary" rows={3} value={item.summary ?? ''} onChange={(event) => updateMilestone(item.id, { summary: event.target.value })} placeholder="Milestone summary" />
            <ItemActions visible={item.visibleToRequester !== false} onVisibility={(visibleToRequester) => updateMilestone(item.id, { visibleToRequester })} onRemove={() => onChange('projectMilestones', removeById(milestones, item.id))} />
          </article>)}
        </div>
      </div>

      <div className="workspace-column">
        <ListHeader icon={<ListChecks size={17} />} title="Tasks" onAdd={() => onChange('projectTasks', [...tasks, createTask()])} />
        <div className="editable-list">
          {tasks.map((item) => <article key={item.id} className="editable-item">
            <div className="editable-item-head">
              <input aria-label="Task title" value={item.title} onChange={(event) => updateTask(item.id, { title: event.target.value })} />
              <select aria-label="Task status" value={item.status} onChange={(event) => updateTask(item.id, { status: event.target.value as ProjectTask['status'] })}>{taskStatuses.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}</select>
            </div>
            <div className="editable-mini-grid two">
              <label>Owner<input value={item.owner ?? ''} onChange={(event) => updateTask(item.id, { owner: event.target.value })} /></label>
              <label>Due<input type="date" value={item.dueDate ?? ''} onChange={(event) => updateTask(item.id, { dueDate: event.target.value })} /></label>
            </div>
            <textarea aria-label="Task notes" rows={3} value={item.notes ?? ''} onChange={(event) => updateTask(item.id, { notes: event.target.value })} placeholder="Notes or blocker" />
            <ItemActions visible={item.visibleToRequester !== false} onVisibility={(visibleToRequester) => updateTask(item.id, { visibleToRequester })} onRemove={() => onChange('projectTasks', removeById(tasks, item.id))} />
          </article>)}
          {!tasks.length && <p className="portal-muted">No tasks yet.</p>}
        </div>
      </div>

      <div className="workspace-column">
        <ListHeader icon={<ShieldAlert size={17} />} title="Risks" onAdd={() => onChange('projectRisks', [...risks, createRisk()])} />
        <div className="editable-list">
          {risks.map((item) => <article key={item.id} className="editable-item">
            <input aria-label="Risk title" value={item.title} onChange={(event) => updateRisk(item.id, { title: event.target.value })} />
            <div className="editable-mini-grid two">
              <label>Level<select value={item.level} onChange={(event) => updateRisk(item.id, { level: event.target.value as ProjectRisk['level'] })}>{riskLevels.map((level) => <option key={level} value={level}>{humanize(level)}</option>)}</select></label>
              <label>Status<select value={item.status} onChange={(event) => updateRisk(item.id, { status: event.target.value as ProjectRisk['status'] })}>{riskStatuses.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}</select></label>
            </div>
            <textarea aria-label="Risk mitigation" rows={3} value={item.mitigation ?? ''} onChange={(event) => updateRisk(item.id, { mitigation: event.target.value })} placeholder="Mitigation or watch note" />
            <ItemActions visible={item.visibleToRequester !== false} onVisibility={(visibleToRequester) => updateRisk(item.id, { visibleToRequester })} onRemove={() => onChange('projectRisks', removeById(risks, item.id))} />
          </article>)}
          {!risks.length && <p className="portal-muted">No risks logged.</p>}
        </div>
      </div>

      <div className="workspace-column">
        <ListHeader icon={<Clock size={17} />} title="Decisions" onAdd={() => onChange('projectDecisions', [...decisions, createDecision()])} />
        <div className="editable-list">
          {decisions.map((item) => <article key={item.id} className="editable-item">
            <div className="editable-item-head">
              <input aria-label="Decision title" value={item.title} onChange={(event) => updateDecision(item.id, { title: event.target.value })} />
              <select aria-label="Decision status" value={item.status} onChange={(event) => updateDecision(item.id, { status: event.target.value as ProjectDecision['status'] })}>{decisionStatuses.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}</select>
            </div>
            <label>Decision date<input type="date" value={item.decidedAt ?? ''} onChange={(event) => updateDecision(item.id, { decidedAt: event.target.value })} /></label>
            <textarea aria-label="Decision summary" rows={3} value={item.summary ?? ''} onChange={(event) => updateDecision(item.id, { summary: event.target.value })} placeholder="Decision, tradeoff or pending question" />
            <ItemActions visible={item.visibleToRequester !== false} onVisibility={(visibleToRequester) => updateDecision(item.id, { visibleToRequester })} onRemove={() => onChange('projectDecisions', removeById(decisions, item.id))} />
          </article>)}
          {!decisions.length && <p className="portal-muted">No decisions logged.</p>}
        </div>
      </div>

      <div className="workspace-column">
        <ListHeader icon={<MessageSquareQuote size={17} />} title="Meetings" onAdd={() => onChange('projectMeetings', [...meetings, createMeeting()])} />
        <div className="editable-list">
          {meetings.map((item) => <article key={item.id} className="editable-item">
            <input aria-label="Meeting title" value={item.title} onChange={(event) => updateMeeting(item.id, { title: event.target.value })} />
            <div className="editable-mini-grid two">
              <label>Date<input type="date" value={item.scheduledAt ?? ''} onChange={(event) => updateMeeting(item.id, { scheduledAt: event.target.value })} /></label>
              <label>Channel<input value={item.channel ?? ''} onChange={(event) => updateMeeting(item.id, { channel: event.target.value })} placeholder="Call, WhatsApp, in person" /></label>
            </div>
            <textarea aria-label="Meeting notes" rows={3} value={item.notes ?? ''} onChange={(event) => updateMeeting(item.id, { notes: event.target.value })} placeholder="Agenda or notes" />
            <textarea aria-label="Meeting action items" rows={3} value={(item.actionItems ?? []).join('\n')} onChange={(event) => updateMeeting(item.id, { actionItems: splitLines(event.target.value) })} placeholder="One action item per line" />
            <ItemActions visible={item.visibleToRequester !== false} onVisibility={(visibleToRequester) => updateMeeting(item.id, { visibleToRequester })} onRemove={() => onChange('projectMeetings', removeById(meetings, item.id))} />
          </article>)}
          {!meetings.length && <p className="portal-muted">No meetings scheduled.</p>}
        </div>
      </div>
    </div>
  </section>;
}

function ListHeader({ icon, title, onAdd }: { icon: ReactNode; title: string; onAdd: () => void }) {
  return <div className="list-header"><h3>{icon}{title}</h3><button className="button button-small button-ghost" type="button" onClick={onAdd}><Plus size={15} /> Add</button></div>;
}

function ItemActions({ visible, onVisibility, onRemove }: { visible: boolean; onVisibility: (visible: boolean) => void; onRemove: () => void }) {
  return <div className="item-actions">
    <button className="button button-small button-ghost" type="button" onClick={() => onVisibility(!visible)}>{visible ? <Eye size={15} /> : <EyeOff size={15} />} {visible ? 'Visible' : 'Hidden'}</button>
    <button className="danger-inline" type="button" onClick={onRemove}><Trash2 size={15} /> Remove</button>
  </div>;
}

function EmailComposer({ request, onSent }: { request: AdminRequest; onSent: () => void }) {
  const templates = useMemo(() => emailTemplates(request), [request]);
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
  return <section className="email-composer" id="email-client">
    <p className="eyebrow">SEND FROM THE PORTAL</p>
    <h2><Mail size={18} /> Email client</h2>
    <div className="template-grid">{templates.map((template) => <button key={template.label} type="button" className="button button-small button-ghost" onClick={() => { setSubject(template.subject); setBody(template.body); }}><Mail size={14} /> {template.label}</button>)}</div>
    <form onSubmit={send}>
      <label>To<input value={request.email} readOnly /></label>
      <label>Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} required /></label>
      <label>Message<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={7} maxLength={5000} required /></label>
      {message && <p className="save-message" role="status">{message}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
      <button className="button" type="submit" disabled={sending || subject.trim().length < 2 || body.trim().length < 2}>{sending ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />} Send email</button>
    </form>
  </section>;
}

function SmsComposer({ request, onSent }: { request: AdminRequest; onSent: () => void }) {
  const templates = smsTemplates(request);
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
  return <section className="email-composer" id="sms-client">
    <p className="eyebrow">SMS UPDATES</p>
    <h2><Smartphone size={18} /> Arkesel SMS</h2>
    <div className="template-grid">{templates.map((template) => <button key={template.label} type="button" className="button button-small button-ghost" onClick={() => setBody(template.body)}><Smartphone size={14} /> {template.label}</button>)}</div>
    <form onSubmit={send}>
      <label>To<input value={request.phone ?? ''} readOnly /></label>
      <label>Message<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} maxLength={480} required /></label>
      {message && <p className="save-message" role="status">{message}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
      <button className="button" type="submit" disabled={sending || body.trim().length < 2}>{sending ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />} Send SMS</button>
    </form>
  </section>;
}

function CommunicationTrail({ messages }: { messages: RequestMessage[] }) {
  return <section><h2><MessageSquareQuote size={18} /> Communications</h2>{messages.length ? <div className="admin-trail">{messages.map((item) => <article key={item.id}><span>{item.channel} / {humanize(item.direction)}</span><strong>{item.subject || formatDate(item.createdAt)}</strong><p>{item.body}</p><time>{formatDate(item.createdAt)}</time></article>)}</div> : <p className="email-composer-intro">No portal communications logged yet.</p>}</section>;
}

function ActivityTrail({ activity }: { activity: RequestActivity[] }) {
  return <section><h2><Bell size={18} /> Audit log</h2>{activity.length ? <div className="admin-trail">{activity.map((item) => <article key={item.id}><span>{item.category || (item.public ? 'public' : 'internal')}</span><strong>{item.title || humanize(item.action)}</strong><p>{item.summary || item.subject || `Changed: ${(item.changedKeys ?? item.publicChangedKeys ?? []).join(', ') || 'record updated'}`}</p><time>{formatDate(item.createdAt)}</time>{item.url && <a className="text-link" href={item.url} target="_blank" rel="noreferrer">Open GitHub update</a>}</article>)}</div> : <p className="email-composer-intro">No activity recorded yet.</p>}</section>;
}

function Section({ title, children }: { title: string; children: ReactNode }) { return <section><h2>{title}</h2>{children}</section>; }
function Data({ label, value }: { label: string; value: string }) { return <div className="data-row"><dt>{label}</dt><dd>{value}</dd></div>; }
function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{humanize(option)}</option>)}</select></label>; }

function withDefaultMilestones(items: ProjectMilestone[] | undefined): ProjectMilestone[] {
  if (items) return items;
  return [
    { id: 'intake', title: 'Intake review', status: 'active', owner: 'Pwavwe Studio', dueDate: '', completedAt: '', summary: 'Confirm goals, fit, scope, timeline and the next concrete step.', visibleToRequester: true },
    { id: 'proposal', title: 'Scope and proposal', status: 'planned', owner: 'Pwavwe Studio', dueDate: '', completedAt: '', summary: 'Prepare the delivery shape, estimate and approval path.', visibleToRequester: true },
    { id: 'kickoff', title: 'Kickoff', status: 'planned', owner: 'Pwavwe Studio', dueDate: '', completedAt: '', summary: 'Align on links, communication rhythm and responsibilities.', visibleToRequester: true },
    { id: 'build', title: 'Build and review', status: 'planned', owner: 'Pwavwe Studio', dueDate: '', completedAt: '', summary: 'Design, implement, review and iterate through the agreed work.', visibleToRequester: true },
    { id: 'handover', title: 'Delivery and handover', status: 'planned', owner: 'Pwavwe Studio', dueDate: '', completedAt: '', summary: 'Ship the final work and hand over essentials.', visibleToRequester: true },
  ];
}

function createMilestone(): ProjectMilestone { return { id: createId('milestone'), title: 'New milestone', status: 'planned', owner: 'Pwavwe Studio', dueDate: '', completedAt: '', summary: '', visibleToRequester: true }; }
function createTask(): ProjectTask { return { id: createId('task'), title: 'New task', status: 'todo', owner: 'Pwavwe Studio', dueDate: '', notes: '', visibleToRequester: false }; }
function createDecision(): ProjectDecision { return { id: createId('decision'), title: 'New decision', status: 'open', decidedAt: '', summary: '', visibleToRequester: true }; }
function createRisk(): ProjectRisk { return { id: createId('risk'), title: 'New risk', level: 'medium', status: 'open', mitigation: '', visibleToRequester: false }; }
function createMeeting(): ProjectMeeting { return { id: createId('meeting'), title: 'Project check-in', scheduledAt: '', channel: '', notes: '', actionItems: [], visibleToRequester: true }; }
function createId(prefix: string): string { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
function updateById<T extends { id: string }>(items: T[], id: string, patch: Partial<T>): T[] { return items.map((item) => item.id === id ? { ...item, ...patch } : item); }
function removeById<T extends { id: string }>(items: T[], id: string): T[] { return items.filter((item) => item.id !== id); }
function splitLines(value: string): string[] { return value.split('\n').map((item) => item.trim()).filter(Boolean); }
function humanize(value = ''): string { return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }

function emailTemplates(request: AdminRequest) {
  const firstName = request.name.split(/\s+/)[0] || 'there';
  const status = humanize(request.publicStatus || request.status);
  return [
    {
      label: 'Status update',
      subject: `Update on ${request.reference}`,
      body: `Hi ${firstName},\n\nQuick update on ${request.reference}: the request is currently marked as ${status}.\n\nCurrent focus: ${request.currentFocus || 'reviewing the next step'}.\nNext step: ${request.nextStep || 'I will send the next update soon'}.\n\nFrancis`,
    },
    {
      label: 'Clarify scope',
      subject: `A few details for ${request.reference}`,
      body: `Hi ${firstName},\n\nI am reviewing your request and need a few details before I can move it forward:\n\n1. \n2. \n3. \n\nOnce I have these, I can confirm the best next step.\n\nFrancis`,
    },
    {
      label: 'Proposal ready',
      subject: `Proposal next step - ${request.reference}`,
      body: `Hi ${firstName},\n\nI have prepared the next step for your project. Please review the proposal or shared link in your requester portal and send any questions back there.\n\nReference: ${request.reference}\n\nFrancis`,
    },
  ];
}

function smsTemplates(request: AdminRequest) {
  return [
    { label: 'Status', body: `Quick update on ${request.reference}: ${request.nextStep || 'your project status has been updated in the portal.'}` },
    { label: 'Question', body: `Quick question on ${request.reference}: please check your email or requester portal when you can.` },
    { label: 'Proposal', body: `Proposal update for ${request.reference}: the next step is ready in your requester portal.` },
  ];
}

function formatDate(value: AdminRequest['createdAt'] | RequestActivity['createdAt']): string {
  if (!value) return 'Not available';
  const date = typeof value === 'string' ? new Date(value) : new Date(value.seconds * 1000);
  return Number.isNaN(date.getTime()) ? 'Not available' : new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium' }).format(date);
}
