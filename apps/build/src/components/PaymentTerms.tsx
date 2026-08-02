import { ArrowUpRight, BadgeCheck, HandCoins, Smartphone } from 'lucide-react';
import { hasMomo, hasPaystack, hasWhatsApp, studio, whatsappLink } from '../data/studio';
import { track } from '../lib/analytics';

const steps = [
  ['Proposal', 'After your request you receive a written proposal with a fixed price, scope and timeline. Nothing starts until you approve it.'],
  ['50% deposit', 'A 50% deposit confirms your slot and begins the work.'],
  ['Build in milestones', 'The work is delivered in reviewable stages so you can see progress and give feedback.'],
  ['Balance on delivery', 'The remaining 50% is due on final delivery, before launch and handover.'],
] as const;

export function PaymentTerms({ contrast = false }: { contrast?: boolean }) {
  const online = hasPaystack() || hasMomo();
  return (
    <section className={`section-pad payment-section${contrast ? ' section-contrast' : ''}`} id="payment" aria-labelledby="payment-heading">
      <div className="section-heading">
        <div><p className="eyebrow">PAYMENT &amp; DEPOSIT</p><h2 id="payment-heading">Simple, honest payment.</h2></div>
        <p>You always know the price and the next step before any money changes hands. A request never commits you to paying.</p>
      </div>
      <div className="payment-grid">
        <ol className="payment-steps">
          {steps.map(([title, body], index) => (
            <li key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div></li>
          ))}
        </ol>
        <aside className="payment-methods">
          <h3><HandCoins size={20} /> Paying the deposit</h3>
          <p>Payment is simple — {studio.deposit}. That split keeps things fair for both sides.</p>
          {online ? (
            <div className="pay-options">
              {hasPaystack() && (
                <a className="button" href={studio.paystackUrl} target="_blank" rel="noopener noreferrer" onClick={() => void track('payment_paystack_click')}>
                  Pay with card or MoMo (Paystack) <ArrowUpRight size={16} />
                </a>
              )}
              {hasMomo() && (
                <div className="pay-momo">
                  <Smartphone size={18} />
                  <div>
                    <span>{studio.momo.network || 'Mobile Money'}</span>
                    <strong>{studio.momo.number}</strong>
                    <small>{studio.momo.name}</small>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="pay-pending">Your secure payment details (Paystack card/MoMo and direct Mobile Money) are shared with your proposal.</p>
          )}
          <p className="pay-contact">
            <BadgeCheck size={16} /> Questions about payment?{' '}
            {hasWhatsApp() && (
              <>
                <a href={whatsappLink('Hi Francis, I have a question about paying a deposit for a build.')} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                {' or '}
              </>
            )}
            <a href={`mailto:${studio.email}`}>{studio.email}</a>.
          </p>
        </aside>
      </div>
    </section>
  );
}
