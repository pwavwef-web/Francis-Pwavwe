import { ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { packages } from '../data/packages';
import { studio } from '../data/studio';
import { track } from '../lib/analytics';

type PackagesProps = {
  heading?: string;
  eyebrow?: string;
  intro?: string;
};

export function Packages({
  heading = 'Clear packages. Honest starting prices.',
  eyebrow = 'PACKAGES & STARTING PRICES',
  intro = 'A fixed starting point, not a final quote. The exact price is confirmed in a written proposal after your request.',
}: PackagesProps) {
  return (
    <section className="section-pad packages-section" id="packages" aria-labelledby="packages-heading">
      <div className="section-heading">
        <div><p className="eyebrow">{eyebrow}</p><h2 id="packages-heading">{heading}</h2></div>
        <p>{intro}</p>
      </div>
      <div className="package-grid">
        {packages.map((pkg) => (
          <article className={`package-card${pkg.featured ? ' is-featured' : ''}`} key={pkg.slug}>
            {pkg.featured && <span className="package-flag">Most requested</span>}
            <h3>{pkg.name}</h3>
            <p className="package-price"><span>from</span>{pkg.priceFrom}</p>
            <p className="package-tagline">{pkg.tagline}</p>
            <ul>{pkg.includes.map((item) => <li key={item}><Check size={16} /> <span>{item}</span></li>)}</ul>
            <p className="package-best"><strong>Best for:</strong> {pkg.bestFor}</p>
            <Link
              className={`button${pkg.featured ? '' : ' button-ghost'}`}
              to={`/request?type=${encodeURIComponent(pkg.requestType)}`}
              onClick={() => void track('package_cta_click', { package: pkg.slug })}
            >
              Request {pkg.name} <ArrowUpRight size={16} />
            </Link>
          </article>
        ))}
      </div>
      <p className="packages-note">
        <strong>Deposit:</strong> {studio.deposit}. Submitting a request is free and not a commitment —{' '}
        <Link className="text-link" to="/services#payment">see how payment works</Link>.
      </p>
    </section>
  );
}
