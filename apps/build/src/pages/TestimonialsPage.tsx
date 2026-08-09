import { useEffect, useState } from 'react';
import { ArrowUpRight, LoaderCircle, Quote, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { fetchPublicTestimonials, type PublicTestimonial } from '../lib/firebase';

export function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const items = await fetchPublicTestimonials();
        if (!cancelled) setTestimonials(items);
      } catch {
        if (!cancelled) { setFailed(true); setTestimonials([]); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const hasAny = Boolean(testimonials && testimonials.length);

  return <>
    <Seo title="Testimonials — Pwavwe Studio" description="What clients say after working with Francis Pwavwe on websites, applications, campus platforms and AI-enabled systems." path="/testimonials" />
    <section className="page-hero section-pad">
      <p className="eyebrow">TESTIMONIALS</p>
      <h1>The words of the<br /><em>people I built for.</em></h1>
      <p>Every quote here comes from a real client, shared after a real project, and published only with their permission.</p>
    </section>
    <section className="section-pad testimonials-section">
      {testimonials === null ? (
        <div className="route-loading"><LoaderCircle className="spin" /> Loading testimonials…</div>
      ) : !hasAny ? (
        <div className="testimonials-empty">
          <Quote />
          <h2>{failed ? 'Testimonials are taking a break.' : 'The first testimonials are on the way.'}</h2>
          <p>{failed ? 'They could not be loaded just now. Please try again shortly.' : 'Recently finished a project with me? Your words could be the first ones here.'}</p>
          <Link className="button" to="/work">See the work <ArrowUpRight size={18} /></Link>
        </div>
      ) : (
        <ul className="testimonial-wall">
          {testimonials!.map((testimonial, index) => (
            <li key={testimonial.sourceId ?? index} className={`testimonial-card ${testimonial.featured ? 'is-featured' : ''}`}>
              <Quote className="testimonial-quote-mark" aria-hidden="true" />
              <Rating rating={testimonial.rating} />
              <blockquote>{testimonial.quote}</blockquote>
              <figcaption>
                <strong>{testimonial.name}</strong>
                <span>{[testimonial.role, testimonial.organisation].filter(Boolean).join(' · ')}</span>
                {testimonial.projectName && <span className="testimonial-project">{testimonial.projectName}</span>}
              </figcaption>
            </li>
          ))}
        </ul>
      )}
    </section>
    <section className="request-band section-pad"><div><p className="eyebrow">WANT RESULTS LIKE THESE?</p><h2>Start with the untidy version.</h2><p>Tell me the problem you are trying to solve. A working system starts with one honest conversation.</p></div><Link className="button button-light" to="/request">Request a Build <ArrowUpRight size={18} /></Link></section>
  </>;
}

function Rating({ rating }: { rating: number }) {
  const value = Math.max(0, Math.min(5, Math.round(rating)));
  return <div className="testimonial-stars" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} fill={star <= value ? 'currentColor' : 'none'} className={star <= value ? 'is-on' : ''} />)}
  </div>;
}
