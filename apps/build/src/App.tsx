import { lazy, Suspense } from 'react';
import { LoaderCircle } from 'lucide-react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';

const WorkPage = lazy(() => import('./pages/WorkPages').then((module) => ({ default: module.WorkPage })));
const ProjectPage = lazy(() => import('./pages/WorkPages').then((module) => ({ default: module.ProjectPage })));
const ServicesPage = lazy(() => import('./pages/InfoPages').then((module) => ({ default: module.ServicesPage })));
const ProcessPage = lazy(() => import('./pages/InfoPages').then((module) => ({ default: module.ProcessPage })));
const AboutPage = lazy(() => import('./pages/InfoPages').then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages/InfoPages').then((module) => ({ default: module.ContactPage })));
const PrivacyPage = lazy(() => import('./pages/InfoPages').then((module) => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/InfoPages').then((module) => ({ default: module.TermsPage })));
const RequestPage = lazy(() => import('./pages/RequestPages').then((module) => ({ default: module.RequestPage })));
const SuccessPage = lazy(() => import('./pages/RequestPages').then((module) => ({ default: module.SuccessPage })));
const FeedbackPage = lazy(() => import('./pages/FeedbackPages').then((module) => ({ default: module.FeedbackPage })));
const FeedbackSuccessPage = lazy(() => import('./pages/FeedbackPages').then((module) => ({ default: module.FeedbackSuccessPage })));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage').then((module) => ({ default: module.TestimonialsPage })));
const AdminPage = lazy(() => import('./pages/AdminPages').then((module) => ({ default: module.AdminPage })));
const AdminRequestPage = lazy(() => import('./pages/AdminPages').then((module) => ({ default: module.AdminRequestPage })));
const AdminFeedbackPage = lazy(() => import('./pages/AdminPages').then((module) => ({ default: module.AdminFeedbackPage })));
const AdminTestimonialPage = lazy(() => import('./pages/AdminPages').then((module) => ({ default: module.AdminTestimonialPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

function LoadingPage() {
  return <div className="route-loading" role="status" aria-live="polite"><LoaderCircle className="spin" /> Loading page…</div>;
}

export default function App() {
  return <BrowserRouter><Suspense fallback={<LoadingPage />}><Routes><Route element={<Layout />}><Route index element={<HomePage />} /><Route path="work" element={<WorkPage />} /><Route path="work/:slug" element={<ProjectPage />} /><Route path="services" element={<ServicesPage />} /><Route path="process" element={<ProcessPage />} /><Route path="request" element={<RequestPage />} /><Route path="request/success" element={<SuccessPage />} /><Route path="feedback" element={<FeedbackPage />} /><Route path="feedback/success" element={<FeedbackSuccessPage />} /><Route path="testimonials" element={<TestimonialsPage />} /><Route path="about" element={<AboutPage />} /><Route path="contact" element={<ContactPage />} /><Route path="privacy" element={<PrivacyPage />} /><Route path="terms" element={<TermsPage />} /><Route path="admin" element={<AdminPage />} /><Route path="admin/requests/:requestId" element={<AdminRequestPage />} /><Route path="admin/feedback" element={<AdminFeedbackPage />} /><Route path="admin/feedback/:testimonialId" element={<AdminTestimonialPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes></Suspense></BrowserRouter>;
}
