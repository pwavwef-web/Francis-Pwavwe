import { useEffect, useState } from 'react';
import { AlertTriangle, LayoutGrid, LoaderCircle, LockKeyhole, LogIn, LogOut, MessageSquareQuote } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { Seo } from './Seo';
import { auth, googleProvider, verifyBuildAdmin } from '../lib/firebase';
import type { AdminContext } from '../lib/adminContext';

type AccessState = { loading: boolean; user: User | null; authorized: boolean; denied: boolean };

const tabs = [
  { to: '/admin', label: 'Requests', icon: LayoutGrid, match: (path: string) => path === '/admin' || path.startsWith('/admin/requests') },
  { to: '/admin/feedback', label: 'Testimonials', icon: MessageSquareQuote, match: (path: string) => path.startsWith('/admin/feedback') },
] as const;

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

export function AdminLayout() {
  const access = useAdminAccess();
  const location = useLocation();
  const [signInError, setSignInError] = useState('');

  if (access.loading) {
    return <GateScreen icon={<LoaderCircle className="spin" />} title="Checking access…" message="Verifying the signed-in account." />;
  }

  if (!access.user || !access.authorized) {
    return <GateScreen
      icon={access.denied ? <AlertTriangle /> : <LockKeyhole />}
      title={access.denied ? 'Access denied' : 'Studio admin'}
      message={access.denied
        ? 'That account is not authorised to manage Pwavwe Studio requests.'
        : 'Sign in with an approved Google account. Authentication alone does not grant access.'}
      action={<>
        <button className="button" type="button" onClick={async () => {
          setSignInError('');
          try { await signInWithPopup(auth, googleProvider); }
          catch { setSignInError('Sign-in did not complete. Try again or use another approved account.'); }
        }}><LogIn size={18} /> Sign in with Google</button>
        {signInError && <p className="field-error" role="alert">{signInError}</p>}
      </>}
    />;
  }

  const path = location.pathname;
  return (
    <div className="dash">
      <header className="dash-bar">
        <Link className="dash-brand" to="/admin">
          <span className="brand-mark" aria-hidden="true">P/</span>
          <span className="dash-brand-text">Pwavwe <b>Studio</b><small>Admin console</small></span>
        </Link>
        <nav className="dash-tabs" aria-label="Admin sections">
          {tabs.map(({ to, label, icon: Icon, match }) => (
            <NavLink key={to} to={to} className={match(path) ? 'is-active' : undefined} end={to === '/admin'}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="dash-account">
          <span className="dash-account-email" title={access.user.email ?? undefined}>{access.user.email}</span>
          <button className="button button-ghost button-small" type="button" onClick={() => void signOut(auth)}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>
      <main className="dash-content">
        <Outlet context={{ user: access.user } satisfies AdminContext} />
      </main>
    </div>
  );
}

function GateScreen({ icon, title, message, action }: { icon: React.ReactNode; title: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="dash-gate">
      <Seo title="Studio Admin — Pwavwe Studio" description="Protected Pwavwe Studio management console." path="/admin" noIndex />
      <Link className="dash-brand dash-gate-brand" to="/">
        <span className="brand-mark" aria-hidden="true">P/</span>
        <span>Pwavwe <b>Studio</b></span>
      </Link>
      <div className="dash-gate-panel">
        {icon}
        <p className="eyebrow">PROTECTED AREA</p>
        <h1>{title}</h1>
        <p>{message}</p>
        {action}
      </div>
    </div>
  );
}
