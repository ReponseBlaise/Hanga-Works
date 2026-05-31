import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Topbar';
import Footer from './Footer';

export default function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.includes('/register');

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-page__main">
        <div className="auth-studio-shell">
          <aside className="auth-studio-rail">
            <p className="eyebrow">{isRegister ? 'Create account' : 'Secure sign in'}</p>
            <h1 className="auth-rail__title">
              {isRegister ? 'Open one workspace for learning and hiring outcomes.' : 'Return to your personalized career workspace.'}
            </h1>
            <p className="auth-rail__lead">
              {isRegister
                ? 'Create a single account that powers learner, job-seeker, and recruiter journeys from one platform.'
                : 'Access your dashboard, applications, and role-specific workflows with a single login.'}
            </p>

            <div className="auth-studio-points">
              <div className="auth-note"><span className="auth-note__dot" /><p>Role-aware navigation adapts instantly after authentication.</p></div>
              <div className="auth-note"><span className="auth-note__dot" /><p>Course progress and applications remain connected to one identity.</p></div>
              <div className="auth-note"><span className="auth-note__dot" /><p>Recruiter and learner modes share the same trusted system.</p></div>
            </div>
          </aside>

          <section className="auth-studio-content">
            <Outlet />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
