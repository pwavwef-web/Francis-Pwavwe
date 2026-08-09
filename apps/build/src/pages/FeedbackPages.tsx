import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, LoaderCircle, Lock, Star } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { ZodIssue } from 'zod';
import { Seo } from '../components/Seo';
import { track } from '../lib/analytics';
import { submitTestimonial } from '../lib/firebase';
import { emptyFeedback, feedbackSchema, type FeedbackFormData } from '../lib/feedbackSchema';

export function FeedbackPage() {
  const [params] = useSearchParams();
  const [data, setData] = useState<FeedbackFormData>(() => emptyFeedback());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const startedTracking = useRef(false);

  // A shared link may pre-fill the project context, e.g.
  //   /feedback?project=UCC%20SRC%20App&ref=PWS-2026-ABC123
  const lockedProject = params.get('project') ?? '';
  useEffect(() => {
    const project = params.get('project');
    const ref = params.get('ref');
    if (project || ref) setData((current) => ({ ...current, projectName: project ?? current.projectName, projectRef: ref ?? current.projectRef }));
  }, [params]);

  const update = <K extends keyof FeedbackFormData>(key: K, value: FeedbackFormData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
    setErrors((current) => { const next = { ...current }; delete next[key]; return next; });
    if (!startedTracking.current) { startedTracking.current = true; void track('feedback_form_start'); }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    const parsed = feedbackSchema.safeParse(data);
    if (!parsed.success) {
      const nextErrors = issuesToErrors(parsed.error.issues);
      setErrors(nextErrors);
      const firstField = parsed.error.issues[0]?.path[0];
      window.setTimeout(() => document.getElementById(String(firstField))?.focus(), 0);
      void track('feedback_form_error', { type: 'validation' });
      return;
    }
    setSubmitting(true);
    void track('feedback_form_submit');
    try {
      const result = await submitTestimonial(parsed.data as unknown as Record<string, unknown>);
      void track('feedback_form_success');
      navigate(`/feedback/success?reference=${encodeURIComponent(result.data.reference)}`);
    } catch {
      setSubmitError('We could not send your feedback just now. Check your connection and try again — your words on this page are not lost.');
      void track('feedback_form_error', { type: 'network_or_server' });
    } finally {
      setSubmitting(false);
    }
  };

  return <>
    <Seo title="Share Your Feedback — Pwavwe Studio" description="Tell Francis Pwavwe how the project went and leave a testimonial." path="/feedback" noIndex />
    <section className="request-layout section-pad">
      <aside className="request-intro">
        <p className="eyebrow">PROJECT FEEDBACK</p>
        <h1>How did the<br /><em>build go?</em></h1>
        <p>Thank you for working with me{lockedProject ? <> on <strong>{lockedProject}</strong></> : ''}. Your honest reflection helps me improve — and, with your permission, helps the next person decide to work together.</p>
        <div className="request-assurance"><Lock size={18} /><span>Nothing is published automatically. A testimonial only appears publicly after I review it, and only if you tick the permission box below.</span></div>
      </aside>
      <div className="form-panel">
        <div className="form-progress" aria-hidden="true"><span style={{ width: '100%' }} /></div>
        <p className="step-label">A FEW MINUTES</p>
        <form onSubmit={onSubmit} noValidate>
          <div className="honeypot" aria-hidden="true"><label htmlFor="website">Leave this blank</label><input id="website" name="website" value={data.website} onChange={(e) => update('website', e.target.value)} tabIndex={-1} autoComplete="off" /></div>
          <fieldset>
            <legend>Your rating</legend>
            <p>Overall, how happy are you with the result?</p>
            <StarRating id="rating" value={data.rating} onChange={(value) => update('rating', value)} error={errors.rating} />
          </fieldset>
          <fieldset>
            <legend>Your words</legend>
            <p>A sentence or two is perfect. What did we build, and what difference has it made?</p>
            <TextArea id="testimonial" label="Your testimonial" hint="This is the part that may be shown publicly, with your permission." value={data.testimonial} onChange={(value) => update('testimonial', value)} error={errors.testimonial} max={1200} required />
            <TextArea id="privateFeedback" label="Private feedback" hint="Optional and never published — anything that could have been better, or that I should know." value={data.privateFeedback} onChange={(value) => update('privateFeedback', value)} error={errors.privateFeedback} max={1500} />
            <CheckboxField id="wouldRecommend" checked={data.wouldRecommend} onChange={(value) => update('wouldRecommend', value)}>I would recommend Pwavwe Studio to others.</CheckboxField>
          </fieldset>
          <fieldset>
            <legend>About you</legend>
            <p>So the words can be attributed properly if you allow them to be shown.</p>
            <div className="form-grid two">
              <TextField id="authorName" label="Your name" value={data.authorName} onChange={(value) => update('authorName', value)} error={errors.authorName} required autoComplete="name" />
              <TextField id="authorEmail" type="email" label="Email" hint="Optional, only so I can reach you" value={data.authorEmail} onChange={(value) => update('authorEmail', value)} error={errors.authorEmail} autoComplete="email" />
              <TextField id="authorRole" label="Your role or title" hint="Optional, e.g. SRC President" value={data.authorRole} onChange={(value) => update('authorRole', value)} error={errors.authorRole} />
              <TextField id="authorOrganisation" label="Organisation" hint="Optional" value={data.authorOrganisation} onChange={(value) => update('authorOrganisation', value)} error={errors.authorOrganisation} />
            </div>
            <TextField id="projectName" label="Project" hint="What we worked on together" value={data.projectName} onChange={(value) => update('projectName', value)} error={errors.projectName} readOnly={Boolean(lockedProject)} />
          </fieldset>
          <fieldset>
            <legend>Permission</legend>
            <CheckboxField id="publishConsent" checked={data.publishConsent} onChange={(value) => update('publishConsent', value)} error={errors.publishConsent} required>I give Pwavwe Studio permission to show my testimonial publicly (for example on the website). I understand I can ask for it to be removed at any time.</CheckboxField>
            <CheckboxField id="displayNameConsent" checked={data.displayNameConsent} onChange={(value) => update('displayNameConsent', value)}>Show my full name with it. <strong>Optional — if left unchecked, only my first name is used.</strong></CheckboxField>
          </fieldset>
          {submitError && <div className="form-alert" role="alert">{submitError}</div>}
          <div className="form-actions"><span /><span /><button className="button" type="submit" disabled={submitting}>{submitting ? <><LoaderCircle className="spin" size={18} /> Sending…</> : <>Send feedback <ArrowRight size={17} /></>}</button></div>
        </form>
      </div>
    </section>
  </>;
}

export function FeedbackSuccessPage() {
  const [params] = useSearchParams();
  const reference = params.get('reference');
  return <section className="success-state section-pad">
    <Seo title="Thank You — Pwavwe Studio" description="Your feedback has been received." path="/feedback/success" noIndex />
    <div className="success-icon"><CheckCircle2 /></div>
    <p className="eyebrow">FEEDBACK RECEIVED</p>
    <h1>Thank you.<br /><em>Truly.</em></h1>
    {reference ? <div className="reference-box"><span>Your reference</span><strong>{reference}</strong><small>Keep it if you ever want a change.</small></div> : null}
    <p>Your feedback is with me. If you gave permission to show your testimonial, I’ll review it before anything appears publicly. It means a great deal that you took the time.</p>
    <div className="button-row"><Link className="button" to="/work">See the work</Link><Link className="button button-ghost" to="/testimonials">Read other testimonials</Link></div>
  </section>;
}

function StarRating({ id, value, onChange, error }: { id: string; value: number; onChange: (value: number) => void; error?: string }) {
  const [hover, setHover] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
  const active = hover || value;
  return <div className="field star-field">
    <div className="star-rating" id={id} role="radiogroup" aria-label="Overall rating" aria-invalid={Boolean(error)} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" role="radio" aria-checked={value === star} aria-label={`${star} star${star > 1 ? 's' : ''}`} className={`star ${star <= active ? 'is-on' : ''}`} onMouseEnter={() => setHover(star)} onFocus={() => setHover(star)} onBlur={() => setHover(0)} onClick={() => onChange(star)}>
          <Star fill={star <= active ? 'currentColor' : 'none'} />
        </button>
      ))}
      <span className="star-label" aria-live="polite">{labels[active] ?? ''}</span>
    </div>
    {error && <span className="field-error" id={`${id}-error`} role="alert">{error}</span>}
  </div>;
}

function issuesToErrors(issues: ZodIssue[]): Record<string, string> {
  return issues.reduce<Record<string, string>>((all, issue) => {
    const key = String(issue.path[0] ?? 'form');
    if (!all[key]) all[key] = issue.message;
    return all;
  }, {});
}

type FieldProps = { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; hint?: string; required?: boolean; type?: string; autoComplete?: string; readOnly?: boolean };

function TextField({ id, label, value, onChange, error, hint, required, type = 'text', autoComplete, readOnly }: FieldProps) {
  return <div className="field"><label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>{hint && <small id={`${id}-hint`}>{hint}</small>}<input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} readOnly={readOnly} aria-invalid={Boolean(error)} aria-describedby={`${hint ? `${id}-hint ` : ''}${error ? `${id}-error` : ''}`.trim() || undefined} autoComplete={autoComplete} />{error && <span className="field-error" id={`${id}-error`} role="alert">{error}</span>}</div>;
}

function TextArea({ id, label, value, onChange, error, hint, required, max }: FieldProps & { max: number }) {
  return <div className="field"><div className="field-label-row"><label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label><span aria-live="polite">{value.length}/{max}</span></div>{hint && <small id={`${id}-hint`}>{hint}</small>}<textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} maxLength={max} rows={5} aria-invalid={Boolean(error)} aria-describedby={`${hint ? `${id}-hint ` : ''}${error ? `${id}-error` : ''}`.trim() || undefined} />{error && <span className="field-error" id={`${id}-error`} role="alert">{error}</span>}</div>;
}

function CheckboxField({ id, checked, onChange, error, required, children }: { id: string; checked: boolean; onChange: (value: boolean) => void; error?: string; required?: boolean; children: React.ReactNode }) {
  return <div className="checkbox-wrap"><label htmlFor={id}><input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} /><span>{children}{required && <span className="sr-only"> Required.</span>}</span></label>{error && <span className="field-error" id={`${id}-error`} role="alert">{error}</span>}</div>;
}
