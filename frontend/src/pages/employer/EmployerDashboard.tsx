import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/shared/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import { getEmployerAnalytics, getEmployerJobs, type EmployerStats } from '../../services/employer.service';

export default function EmployerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<EmployerStats | null>(null);
  const [jobs, setJobs] = useState<Awaited<ReturnType<typeof getEmployerJobs>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([getEmployerAnalytics(), getEmployerJobs()])
      .then(([analytics, employerJobs]) => {
        if (!active) return;
        setStats(analytics);
        setJobs(employerJobs);
      })
      .catch((error) => {
        console.error('Failed to load employer dashboard', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const ownJobs = useMemo(() => {
    if (!user?.organizationId) return jobs;
    return jobs.filter((job) => job.employer.id === user.organizationId);
  }, [jobs, user?.organizationId]);

  const pipeline = useMemo(
    () => [
      { stage: 'APPLIED', count: stats?.breakdown.APPLIED ?? 0 },
      { stage: 'REVIEWING', count: stats?.breakdown.REVIEWING ?? 0 },
      { stage: 'SHORTLISTED', count: stats?.breakdown.SHORTLISTED ?? 0 },
      { stage: 'HIRED', count: stats?.breakdown.HIRED ?? 0 },
      { stage: 'REJECTED', count: stats?.breakdown.REJECTED ?? 0 },
    ],
    [stats]
  );

  const pipelineScore = useMemo(() => {
    const total = pipeline.reduce((acc, curr) => acc + curr.count, 0);
    return Math.min(100, (total * 10)); // Arbitrary health score calculation for the progress bar
  }, [pipeline]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <aside className="app-shell-sidebar">
          <div className="app-shell-brand">
            <strong>Hanga Works</strong>
            <span>Employer Menu</span>
          </div>
          <nav className="app-shell-nav">
            <Link to="/employer" className="app-shell-nav__item is-active">Dashboard</Link>
            <Link to="/employer/post-job" className="app-shell-nav__item">Post a Job</Link>
            <Link to="/employer/applicants" className="app-shell-nav__item">Applicant Board</Link>
            <Link to="/candidates" className="app-shell-nav__item">Candidate Database</Link>
            <Link to="/notifications" className="app-shell-nav__item">Messages</Link>
            <Link to="/profile" className="app-shell-nav__item">Company Profile</Link>
          </nav>
        </aside>

        <div className="studio-dashboard studio-dashboard--employer dashboard-redesign">
          <section className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Employer dashboard</p>
              <h1 className="display">Your hiring command center</h1>
              <p className="lead">
                See open jobs, applicant counts, and pipeline stages in one place. Post a new role or review candidates when you are ready.
              </p>
              <div className="studio-action-row">
                <Button to="/employer/post-job" variant="primary" className="button--pill">Post a job</Button>
                <Button to="/employer/applicants" variant="secondary">Review applicants</Button>
                <Button to="/candidates" variant="ghost">Candidate library</Button>
              </div>
            </div>
            <div className="dashboard-redesign__headline-stats">
              <div>
                <span>Active jobs</span>
                <strong style={{ color: 'var(--text)' }}>{loading ? '...' : (stats?.totalJobs ?? ownJobs.length)}</strong>
              </div>
              <div>
                <span>Total applicants</span>
                <strong style={{ color: 'var(--text)' }}>{loading ? '...' : (stats?.totalApplicants ?? 0)}</strong>
              </div>
              <div>
                <span>Total hires</span>
                <strong style={{ color: 'var(--text)' }}>{loading ? '...' : (stats?.breakdown.HIRED ?? 0)}</strong>
              </div>
            </div>
          </section>

          <section className="dashboard-redesign__quick-metrics">
            <Card className="dashboard-redesign__metric">
              <CardEyebrow>Hiring Pipeline Health</CardEyebrow>
              <strong>{loading ? '...' : `${pipelineScore}%`}</strong>
              <ProgressBar value={pipelineScore} />
              <CardMeta>Based on active candidate engagement.</CardMeta>
            </Card>
            <Card className="dashboard-redesign__metric">
              <CardEyebrow>Interviews & Reviews</CardEyebrow>
              <strong>{loading ? '...' : (stats?.breakdown.REVIEWING ?? 0)}</strong>
              <ProgressBar value={Math.min(100, (stats?.breakdown.REVIEWING ?? 0) * 15)} />
              <CardMeta>Candidates currently in review stage.</CardMeta>
            </Card>
            <Card className="dashboard-redesign__metric">
              <CardEyebrow>Total Shortlisted</CardEyebrow>
              <strong>{loading ? '...' : (stats?.breakdown.SHORTLISTED ?? 0)}</strong>
              <ProgressBar value={Math.min(100, (stats?.breakdown.SHORTLISTED ?? 0) * 20)} />
              <CardMeta>Top talent waiting for offers.</CardMeta>
            </Card>
          </section>

          <section className="dashboard-redesign__layout">
            <main className="dashboard-main-column">
              <Card className="studio-block">
                <div className="studio-section__head">
                  <div>
                    <p className="eyebrow">Open requisitions</p>
                    <h2>Posted jobs and hiring load</h2>
                  </div>
                  <Button to="/employer/post-job" variant="secondary">Create posting</Button>
                </div>
                <div className="studio-jobs-grid">
                  {ownJobs.length === 0 ? (
                    <div className="studio-inline-item">
                      <div>
                        <strong>No jobs posted yet</strong>
                        <p>Publish your first job to start receiving applications.</p>
                      </div>
                    </div>
                  ) : ownJobs.map((job) => (
                    <Card key={job.id} className="studio-job-card">
                      <div className="studio-job-card__head">
                        <div>
                          <CardMeta>{job.jobType.replace('_', ' ')}</CardMeta>
                          <CardTitle><Link to={`/jobs/${job.id}`}>{job.title}</Link></CardTitle>
                        </div>
                        <span className="dashboard-chip">{job.location ?? 'Remote'}</span>
                      </div>
                      <CardMeta>{job.salaryMin || job.salaryMax ? `Salary range: ${job.salaryMin ?? 0} - ${job.salaryMax ?? 0}` : 'Salary not specified'}</CardMeta>
                      <div className="studio-action-row mt-md">
                        <Button to={`/employer/jobs/${job.id}/applicants`} variant="secondary">Review applicants</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </main>

            <aside className="dashboard-rail">
              <Card className="studio-block">
                <CardEyebrow>Hiring Pipeline Overview</CardEyebrow>
                <div className="studio-stage-list">
                  {pipeline.map((stage) => (
                    <div key={stage.stage} className="studio-stage-item">
                      <span>{stage.stage}</span>
                      <strong>{stage.count}</strong>
                    </div>
                  ))}
                </div>
                <Button to="/employer/applicants" variant="primary" className="mt-md w-full">Open applicant board</Button>
              </Card>
            </aside>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
