import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';

export function NotFoundPage() {
  return <section className="empty-state section-pad"><Seo title="Page Not Found — Pwavwe Studio" description="The requested Pwavwe Studio page could not be found." noIndex /><p className="eyebrow">404 · OFF THE MAP</p><h1>This route did not<br /><em>make the build.</em></h1><p>The page may have moved, or the address may need a second look.</p><Link className="button" to="/"><ArrowLeft size={16} /> Return home</Link></section>;
}
