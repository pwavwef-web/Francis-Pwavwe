import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { ZodIssue } from 'zod';
import { Seo } from '../components/Seo';
import { track } from '../lib/analytics';
import { submitBuildRequest } from '../lib/firebase';
import {
  budgetOptions, clearDraft, contactOptions, emptyRequest, loadDraft, projectTypes,
  requestSchema, saveDraft, timelineOptions, type RequestFormData,
} from '../lib/requestSchema';

const steps = ['You & the idea', 'The project', 'Timing & contact'] as const;

export function RequestPage() {
  const [params] = useSearchParams();
  const [data, setData] = useState<RequestFormData>(() => loadDraft() ?? emptyRequest());
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const startedTracking = useRef(false);

  useEffect(() => {
    const requestedType = params.get('type');
    if (requestedType && projectTypes.includes(requestedType as (typeof projectTypes)[number])) {
      setData((current) => ({ ...current, projectType: requestedType }));
    }
  }, [params]);

  useEffect(() => {
    const timer = window.setTimeout(() => saveDraft(data), 350);
    return () => window.clearTimeout(timer);
  }, [data]);

  const update = <K extends keyof RequestFormData>(key: K, value: RequestFormData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    if (!startedTracking.current) {
      startedTracking.current = true;
      void track('request_form_start');
    }
  };

  const fieldsByStep: (keyof RequestFormData)[][] = useMemo(() => [
    ['name', 'email', 'phone', 'organisation', 'projectType'],
    ['projectSummary', 'problemStatement', 'targetUsers', 'features', 'existingWebsite', 'referenceLinks', 'additionalNotes'],
    ['preferredTimeline', 'budgetRange', 'preferredContact', 'discoverySource', 'contactConsent'],
  ], []);

  const validateStep = (index: number): boolean => {
    const result = requestSchema.safeParse(data);
    const relevant = result.success ? [] : result.error.issues.filter((issue) => fieldsByStep[index].includes(issue.path[0] as keyof RequestFormData));
    if (relevant.length) {
      setErrors(issuesToErrors(relevant));
      document.getElementById(String(relevant[0]?.path[0]))?.focus();
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    void track('request_form_step_complete', { step: step + 1 });
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    const parsed = requestSchema.safeParse(data);
    if (!parsed.success) {
      const nextErrors = issuesToErrors(parsed.error.issues);
      setErrors(nextErrors);
      const firstField = parsed.error.issues[0]?.path[0];
      const invalidStep = fieldsByStep.findIndex((fields) => fields.includes(firstField as keyof RequestFormData));
      if (invalidStep >= 0) setStep(invalidStep);
      window.setTimeout(() => document.getElementById(String(firstField))?.focus(), 0);
      void track('request_form_error', { type: 'validation' });
      return;
    }
    setSubmitting(true);
    void track('request_form_submit');
    try {
      const result = await submitBuildRequest(parsed.data as unknown as Record<string, unknown>);
      clearDraft();
      void track('request_form_success');
      navigate(`/request/success?reference=${encodeURIComponent(result.data.reference)}`, { state: { emailDelayed: result.data.emailDelayed } });
    } catch {
      setSubmitError('We could not send the request just now. Your draft is still saved on this device. Check your connection and try again.');
      void track('request_form_error', { type: 'network_or_server' });
    } finally {
      setSubmitting(false);
    }
  };

  return <>
    <Seo title="Request a Build — Pwavwe Studio" description="Tell Francis Pwavwe about the website, application, campus platform or AI-enabled system you want to build." path="/request" />
    <section className="request-layout section-pad">
      <aside className="request-intro"><p className="eyebrow">REQUEST A BUILD</p><h1>Tell me what needs<br /><em>to work.</em></h1><p>You can arrive with a rough idea. Clear context is more useful than perfect technical language.</p><div className="request-assurance"><CheckCircle2 /><span>This request is free. It is not a contract and does not commit you to payment.</span></div><ol>{steps.map((label, index) => <li key={label} className={index === step ? 'active' : index < step ? 'done' : ''}><span>{index < step ? '✓' : index + 1}</span>{label}</li>)}</ol></aside>
      <div className="form-panel">
        <div className="form-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <p className="step-label">STEP {step + 1} OF {steps.length}</p>
        <form onSubmit={onSubmit} noValidate>
          <div className="honeypot" aria-hidden="true"><label htmlFor="website">Leave this blank</label><input id="website" name="website" value={data.website} onChange={(e) => update('website', e.target.value)} tabIndex={-1} autoComplete="off" /></div>
          {step === 0 && <fieldset><legend>You and the idea</legend><p>Enough detail to know who I am speaking with and what kind of build may fit.</p><div className="form-grid two"><TextField id="name" label="Full name" value={data.name} onChange={(value) => update('name', value)} error={errors.name} required autoComplete="name" /><TextField id="email" type="email" label="Email address" value={data.email} onChange={(value) => update('email', value)} error={errors.email} required autoComplete="email" /><TextField id="phone" label="WhatsApp number" hint="Optional, include country code" value={data.phone} onChange={(value) => update('phone', value)} error={errors.phone} autoComplete="tel" /><TextField id="organisation" label="Organisation or project name" value={data.organisation} onChange={(value) => update('organisation', value)} error={errors.organisation} required /></div><SelectField id="projectType" label="Project type" value={data.projectType} options={projectTypes} onChange={(value) => update('projectType', value)} error={errors.projectType} required /></fieldset>}
          {step === 1 && <fieldset><legend>The project</legend><p>Describe the real situation. Bullet points and untidy notes are welcome.</p><TextArea id="projectSummary" label="What do you want to build?" value={data.projectSummary} onChange={(value) => update('projectSummary', value)} error={errors.projectSummary} max={1500} required /><TextArea id="problemStatement" label="What problem should it solve?" value={data.problemStatement} onChange={(value) => update('problemStatement', value)} error={errors.problemStatement} max={1500} required /><TextArea id="targetUsers" label="Who will use it?" value={data.targetUsers} onChange={(value) => update('targetUsers', value)} error={errors.targetUsers} max={800} required /><TextArea id="features" label="Important features" hint="List what feels essential. Scope will be clarified later." value={data.features} onChange={(value) => update('features', value)} error={errors.features} max={1500} required /><div className="form-grid two"><TextField id="existingWebsite" type="url" label="Existing website" hint="Optional" value={data.existingWebsite} onChange={(value) => update('existingWebsite', value)} error={errors.existingWebsite} /><TextField id="referenceLinks" label="Reference links" hint="Optional, one or more links" value={data.referenceLinks} onChange={(value) => update('referenceLinks', value)} error={errors.referenceLinks} /></div><TextArea id="additionalNotes" label="Anything else?" hint="Optional constraints, context or questions" value={data.additionalNotes} onChange={(value) => update('additionalNotes', value)} error={errors.additionalNotes} max={1500} /></fieldset>}
          {step === 2 && <fieldset><legend>Timing, budget and contact</legend><p>These answers help me judge fit. A range is enough at this stage.</p><div className="form-grid two"><SelectField id="preferredTimeline" label="Preferred completion period" value={data.preferredTimeline} options={timelineOptions} onChange={(value) => update('preferredTimeline', value)} error={errors.preferredTimeline} required /><SelectField id="budgetRange" label="Budget range" value={data.budgetRange} options={budgetOptions} onChange={(value) => update('budgetRange', value)} error={errors.budgetRange} required /><SelectField id="preferredContact" label="Preferred contact method" value={data.preferredContact} options={contactOptions} onChange={(value) => update('preferredContact', value)} error={errors.preferredContact} required /><TextField id="discoverySource" label="How did you find Pwavwe Studio?" hint="Optional" value={data.discoverySource} onChange={(value) => update('discoverySource', value)} error={errors.discoverySource} /></div><CheckboxField id="contactConsent" checked={data.contactConsent} onChange={(value) => update('contactConsent', value)} error={errors.contactConsent} required>I agree that Pwavwe Studio may use the information supplied here to contact me about this project request. This does not subscribe me to marketing emails.</CheckboxField><CheckboxField id="marketingConsent" checked={data.marketingConsent} onChange={(value) => update('marketingConsent', value)}>Send me occasional Build Notes, project stories and useful digital resources. <strong>Optional and unchecked by default.</strong></CheckboxField></fieldset>}
          {submitError && <div className="form-alert" role="alert">{submitError}</div>}
          <div className="form-actions">{step > 0 && <button className="button button-ghost" type="button" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={17} /> Back</button>}<span />{step < steps.length - 1 ? <button className="button" type="button" onClick={nextStep}>Continue <ArrowRight size={17} /></button> : <button className="button" type="submit" disabled={submitting}>{submitting ? <><LoaderCircle className="spin" size={18} /> Sending securely…</> : <>Send project request <ArrowRight size={17} /></>}</button>}</div>
        </form>
      </div>
    </section>
  </>;
}

export function SuccessPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const reference = params.get('reference');
  const emailDelayed = Boolean((location.state as { emailDelayed?: boolean } | null)?.emailDelayed);
  return <section className="success-state section-pad"><Seo title="Request Received — Pwavwe Studio" description="Your Pwavwe Studio project request has been received." path="/request/success" noIndex /><div className="success-icon"><CheckCircle2 /></div><p className="eyebrow">REQUEST RECEIVED</p><h1>That is safely<br /><em>in the studio.</em></h1>{reference ? <div className="reference-box"><span>Your reference</span><strong>{reference}</strong><small>Keep this for follow-up.</small></div> : <p>Your request was received. Check your confirmation message for its reference.</p>}<p>I’ll review the problem, scope and timing before replying. Submission is not a contract or a payment commitment.</p>{emailDelayed && <p className="notice" role="status">Your request was stored successfully, but the confirmation email may be delayed. Your reference is still valid.</p>}<div className="button-row"><Link className="button" to="/work">Browse the work</Link><a className="button button-ghost" href={`mailto:projects@pwavwe.com${reference ? `?subject=${encodeURIComponent(`Build request ${reference}`)}` : ''}`}>Contact the studio</a></div></section>;
}

function issuesToErrors(issues: ZodIssue[]): Record<string, string> {
  return issues.reduce<Record<string, string>>((all, issue) => {
    const key = String(issue.path[0] ?? 'form');
    if (!all[key]) all[key] = issue.message;
    return all;
  }, {});
}

type FieldProps = { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; hint?: string; required?: boolean; type?: string; autoComplete?: string };

function TextField({ id, label, value, onChange, error, hint, required, type = 'text', autoComplete }: FieldProps) {
  return <div className="field"><label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>{hint && <small id={`${id}-hint`}>{hint}</small>}<input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={`${hint ? `${id}-hint ` : ''}${error ? `${id}-error` : ''}`.trim() || undefined} autoComplete={autoComplete} />{error && <span className="field-error" id={`${id}-error`} role="alert">{error}</span>}</div>;
}

function TextArea({ id, label, value, onChange, error, hint, required, max }: FieldProps & { max: number }) {
  return <div className="field"><div className="field-label-row"><label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label><span aria-live="polite">{value.length}/{max}</span></div>{hint && <small id={`${id}-hint`}>{hint}</small>}<textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} maxLength={max} rows={5} aria-invalid={Boolean(error)} aria-describedby={`${hint ? `${id}-hint ` : ''}${error ? `${id}-error` : ''}`.trim() || undefined} />{error && <span className="field-error" id={`${id}-error`} role="alert">{error}</span>}</div>;
}

function SelectField({ id, label, value, options, onChange, error, required }: Omit<FieldProps, 'type'> & { options: readonly string[] }) {
  return <div className="field"><label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label><select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}><option value="">Select an option</option>{options.map((option) => <option key={option}>{option}</option>)}</select>{error && <span className="field-error" id={`${id}-error`} role="alert">{error}</span>}</div>;
}

function CheckboxField({ id, checked, onChange, error, required, children }: { id: string; checked: boolean; onChange: (value: boolean) => void; error?: string; required?: boolean; children: React.ReactNode }) {
  return <div className="checkbox-wrap"><label htmlFor={id}><input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} /><span>{children}{required && <span className="sr-only"> Required.</span>}</span></label>{error && <span className="field-error" id={`${id}-error`} role="alert">{error}</span>}</div>;
}
