import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { applyForJob, getApplications, getJobById, type JobSummary } from '../../services/jobs.service';
import type { JobApplication } from '../../types/job.types';

export default function JobApply() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const role = (user?.role ?? '').toUpperCase();
  const canApply = !role || role === 'LEARNER';

  const [job, setJob] = useState<JobSummary | null>(null);
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [applying, setApplying] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    portfolio: '',
    coverLetter: '',
    resumeSummary: '',
  });

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);

    Promise.all([getJobById(id), getApplications()])
      .then(([foundJob, items]) => {
        if (!active) return;
        setJob(foundJob ?? null);
        const existing = items.find((item) => item.job.id === id) ?? null;
        setApplication(existing);
        if (existing) {
          setStatus('Application already submitted. You can track this from the applications page.');
        }
      })
      .catch((error) => {
        console.error('Failed to load application context', error);
        if (active) setStatus('This job could not be loaded for application.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function handleApply() {
    if (!job) return;
    if (application || applying) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!canApply) {
      setStatus('Only learner accounts can submit applications.');
      return;
    }

    setApplying(true);
    setStatus('Submitting your application...');
    try {
      await applyForJob(job.id);
      setStatus('Application submitted successfully.');
      const refreshed = await getApplications();
      setApplication(refreshed.find((item) => item.job.id === job.id) ?? null);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setStatus('You already applied for this job.');
      } else {
        setStatus('Could not submit application right now. Try again later.');
      }
    } finally {
      setApplying(false);
    }
  }

  return (
    <SiteLayout>
      <section className="studio-job-detail job-detail-redesign">
        <Link to={id ? `/jobs/${id}` : '/jobs'} className="studio-inline-link">Back to job details</Link>
        <Card className="studio-block">
          <CardEyebrow>Application</CardEyebrow>
          <CardTitle>{loading ? 'Loading...' : `Apply for ${job?.title ?? 'this role'}`}</CardTitle>
          <CardMeta>{job?.employer.name ?? 'Employer'}</CardMeta>
        </Card>

        <Card className="studio-block">
          <CardEyebrow>Application form</CardEyebrow>
          <CardTitle>Step {formStep} of 3</CardTitle>
          <div className="studio-stepper">
            <span className={formStep >= 1 ? 'is-active' : ''}>1</span>
            <span className={formStep >= 2 ? 'is-active' : ''}>2</span>
            <span className={formStep >= 3 ? 'is-active' : ''}>3</span>
          </div>

          {formStep === 1 ? (
            <div className="form-stack">
              <label>Full name<input value={applicationForm.fullName} onChange={(event) => setApplicationForm((prev) => ({ ...prev, fullName: event.target.value }))} placeholder="Your full name" /></label>
              <label>Email<input type="email" value={applicationForm.email} onChange={(event) => setApplicationForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="you@example.com" /></label>
              <label>Phone<input value={applicationForm.phone} onChange={(event) => setApplicationForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="+250..." /></label>
            </div>
          ) : null}

          {formStep === 2 ? (
            <div className="form-stack">
              <label>Portfolio URL<input value={applicationForm.portfolio} onChange={(event) => setApplicationForm((prev) => ({ ...prev, portfolio: event.target.value }))} placeholder="https://portfolio.example" /></label>
              <label>Resume summary<textarea rows={4} value={applicationForm.resumeSummary} onChange={(event) => setApplicationForm((prev) => ({ ...prev, resumeSummary: event.target.value }))} placeholder="Highlight your role-specific strengths" /></label>
            </div>
          ) : null}

          {formStep === 3 ? (
            <div className="form-stack">
              <label>Cover letter<textarea rows={6} value={applicationForm.coverLetter} onChange={(event) => setApplicationForm((prev) => ({ ...prev, coverLetter: event.target.value }))} placeholder="Explain why you are a fit for this role" /></label>
              <CardMeta>Review your details then submit to finalize your application.</CardMeta>
            </div>
          ) : null}

          <div className="studio-action-row">
            <Button type="button" variant="ghost" disabled={formStep === 1} onClick={() => setFormStep((prev) => Math.max(1, prev - 1))}>Back</Button>
            {formStep < 3 ? (
              <Button type="button" variant="secondary" onClick={() => setFormStep((prev) => Math.min(3, prev + 1))}>Next</Button>
            ) : null}
            {!canApply ? (
              <Button type="button" variant="secondary" disabled>This role can view jobs only</Button>
            ) : isAuthenticated ? (
              <Button type="button" variant="primary" className="button--pill" onClick={handleApply} disabled={applying || !!application || loading}>
                {application ? 'Already applied' : applying ? 'Submitting...' : 'Submit application'}
              </Button>
            ) : (
              <Button to="/login" variant="primary" className="button--pill">Sign in to apply</Button>
            )}
          </div>

          {application ? (
            <CardMeta>Application status: {application.status.toLowerCase()} · Updated {new Date(application.updatedAt).toLocaleDateString()}</CardMeta>
          ) : null}
          {status ? <CardMeta>{status}</CardMeta> : null}
        </Card>
      </section>
    </SiteLayout>
  );
}
