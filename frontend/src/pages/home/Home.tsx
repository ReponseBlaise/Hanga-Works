import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Topbar';
import Footer from '../../components/layout/Footer';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const lifecycleSteps = [
  {
    step: '01',
    title: 'Learn',
    copy: 'Structured learning pathways, quizzes, and progress tracking for career growth.',
  },
  {
    step: '02',
    title: 'Certify',
    copy: 'Digital credentials and verifiable certificates that prove skills beyond a CV.',
  },
  {
    step: '03',
    title: 'Match',
    copy: 'Skills-first recommendations that connect verified talent to relevant jobs.',
  },
  {
    step: '04',
    title: 'Employ',
    copy: 'Employer tools for pipeline management, candidate review, and faster hiring.',
  },
  {
    step: '05',
    title: 'Improve',
    copy: 'Analytics and career intelligence to keep the growth loop moving forward.',
  },
];

const stakeholderCards = [
  {
    title: 'Learners and job seekers',
    eyebrow: 'User layer',
    meta: 'Build a verifiable skill profile, follow learning paths, and apply with confidence.',
  },
  {
    title: 'Employers',
    eyebrow: 'Employment layer',
    meta: 'Search candidates, post jobs, and manage recruitment with an ATS-style workflow.',
  },
  {
    title: 'Institutions and mentors',
    eyebrow: 'Learning layer',
    meta: 'Publish courses, issue certifications, and support guided progress at scale.',
  },
  {
    title: 'Administrators and planners',
    eyebrow: 'Intelligence layer',
    meta: 'Monitor workforce signals, activity, and platform health from one environment.',
  },
];

const platformModules = [
  'Digital learning and competency development',
  'Intelligent job and talent marketplace',
  'Career intelligence and recommendation engine',
  'Digital certification and credential verification',
  'Employer recruitment dashboard',
  'Workforce analytics and labor market intelligence',
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page">
      <Navbar />

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <p className="landing-kicker">Skills employment & workforce intelligence</p>
            <h1>Learn, certify, match, and hire on one intelligent platform.</h1>
            <p className="landing-lead">
              HANGA WORKS turns the SRS vision into a public entry point for learners, employers, institutions, and administrators. It replaces CV-first hiring with verified skills, learning progress, and data-driven opportunities.
            </p>

            <div className="landing-hero__actions">
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="button button-primary">
                {isAuthenticated ? 'Go to dashboard' : 'Create account'}
              </Link>
              <Link to="/login" className="button button-secondary">
                Sign in
              </Link>
            </div>

            <div className="landing-hero__chips" aria-label="Platform highlights">
              <span>Skills-first profiles</span>
              <span>Verifiable certificates</span>
              <span>Employer ATS tools</span>
              <span>Career intelligence</span>
            </div>
          </div>

          <div className="landing-hero__visual">
            <Card className="landing-orbit-card">
              <CardEyebrow>Platform overview</CardEyebrow>
              <CardTitle>One system, five connected journeys.</CardTitle>
              <CardMeta>
                The platform is organized around a continuous loop of learning, certification, matching, employment, and improvement.
              </CardMeta>

              <div className="landing-metric-grid">
                <div className="landing-metric">
                  <strong>5</strong>
                  <span>architectural layers</span>
                </div>
                <div className="landing-metric">
                  <strong>6</strong>
                  <span>core platform modules</span>
                </div>
                <div className="landing-metric">
                  <strong>4</strong>
                  <span>primary stakeholder groups</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="landing-section">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">Lifecycle</p>
              <h2>The platform flow described in the SRS</h2>
            </div>
          </div>

          <div className="landing-lifecycle">
            {lifecycleSteps.map((item) => (
              <Card key={item.title} className="landing-step-card">
                <span className="landing-step-card__step">{item.step}</span>
                <CardTitle>{item.title}</CardTitle>
                <CardMeta>{item.copy}</CardMeta>
              </Card>
            ))}
          </div>
        </section>

        <section className="landing-section landing-section--split">
          <Card className="landing-panel">
            <CardEyebrow>Stakeholders</CardEyebrow>
            <CardTitle>Designed for the full workforce ecosystem</CardTitle>
            <CardMeta>
              The SRS frames the product as a shared operating environment for learners, employers, institutions, mentors, and administrators.
            </CardMeta>

            <div className="landing-stakeholder-grid">
              {stakeholderCards.map((item) => (
                <article key={item.title} className="landing-stakeholder">
                  <p className="landing-stakeholder__eyebrow">{item.eyebrow}</p>
                  <h3>{item.title}</h3>
                  <p>{item.meta}</p>
                </article>
              ))}
            </div>
          </Card>

          <Card className="landing-panel landing-panel--accent">
            <CardEyebrow>Core modules</CardEyebrow>
            <CardTitle>Public entry points into the platform</CardTitle>
            <CardMeta>
              Each module below maps directly to the SRS domains that shape the product architecture and user experience.
            </CardMeta>

            <ul className="landing-module-list">
              {platformModules.map((module) => (
                <li key={module}>{module}</li>
              ))}
            </ul>

            <div className="landing-panel__actions">
              <Link to="/register" className="button button-primary">
                Start free
              </Link>
              <Button href="#" variant="ghost" className="landing-panel__ghost">
                Explore features
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}