import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getEmployerAnalytics, getEmployerJobs, type EmployerStats } from '../../services/employer.service';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmployerStats | null>(null);
  const [jobs, setJobs] = useState<Awaited<ReturnType<typeof getEmployerJobs>>>([]);

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
      { stage: 'Applied', count: stats?.breakdown.APPLIED ?? 0 },
      { stage: 'Reviewing', count: stats?.breakdown.REVIEWING ?? 0 },
      { stage: 'Shortlisted', count: stats?.breakdown.SHORTLISTED ?? 0 },
      { stage: 'Hired', count: stats?.breakdown.HIRED ?? 0 },
      { stage: 'Rejected', count: stats?.breakdown.REJECTED ?? 0 },
    ],
    [stats],
  );

  return (
    <SiteLayout>
      <section className="studio-recruiter studio-recruiter--employer employer-page">
        <header className="studio-recruiter__hero employer-page__head">
          <div>
            <p className="eyebrow">Employer dashboard</p>
            <h1 className="display">Your hiring overview</h1>
            <p className="lead">See open jobs, applicant counts, and pipeline stages in one place. Post a new role or review candidates when you are ready.</p>
            <div className="studio-action-row">
              <Button to="/employer/post-job" variant="primary" className="button--pill">Post a job</Button>
              <Button to="/employer/applicants" variant="secondary">Review applicants</Button>
              <Button to="/candidates" variant="ghost">Candidate library</Button>
            </div>
          </div>
          <div className="studio-recruiter__stats">
            <div><span>Active jobs</span><strong>{stats?.totalJobs ?? ownJobs.length}</strong></div>
            <div><span>Total applicants</span><strong>{stats?.totalApplicants ?? 0}</strong></div>
            <div><span>Hires</span><strong>{stats?.breakdown.HIRED ?? 0}</strong></div>
          </div>
        </header>

        <section className="dashboard-layout dashboard-layout--two-col-right mt-lg">
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
                  <Card className="studio-job-card">
                    <CardTitle>No jobs posted yet</CardTitle>
                    <CardMeta>Publish your first job to start receiving applications.</CardMeta>
                  </Card>
                ) : ownJobs.map((job) => (
                  <Card key={job.id} className="studio-job-card">
                    <div className="studio-job-card__head">
                      <div>
                        <CardMeta>{job.jobType.replace('_', ' ')}</CardMeta>
                        <CardTitle><Link to={`/jobs/${job.id}`}>{job.title}</Link></CardTitle>
                      </div>
                      <span className="studio-employer-chip">{job.location ?? 'Remote'}</span>
                    </div>
                    <CardMeta>{job.salaryMin || job.salaryMax ? `Salary range: ${job.salaryMin ?? 0} - ${job.salaryMax ?? 0}` : 'Salary not specified'}</CardMeta>
                    <div className="studio-action-row mt-md">
                      <Button to="/employer/applicants" variant="secondary">Review applicants</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </main>

          <aside className="dashboard-rail dashboard-rail--right">
            <Card className="studio-block">
              <CardTitle>Hiring pipeline</CardTitle>
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
      </section>
    </SiteLayout>
  );
}
