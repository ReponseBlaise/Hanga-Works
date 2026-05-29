import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getEmployerAnalytics, getEmployerJobs, type EmployerStats } from '../../services/employer.service';

export default function EmployerDashboard() {
  const navigate = useNavigate();
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

  return (
    <SiteLayout>
      <section>
        <header className="page-header">
          <h2>Employer Dashboard</h2>
          <div>
            <Button to="/employer/post-job">Post Job</Button>
            <Button variant="secondary" to="/employer/applicants">View Applicants</Button>
          </div>
        </header>

        <div className="grid-columns">
          <Card>
            <CardTitle>Active Jobs</CardTitle>
            <CardMeta>{stats?.totalJobs ?? ownJobs.length}</CardMeta>
          </Card>
          <Card>
            <CardTitle>New Applicants</CardTitle>
            <CardMeta>{stats?.totalApplicants ?? 0}</CardMeta>
          </Card>
          <Card>
            <CardTitle>Hires</CardTitle>
            <CardMeta>{stats?.breakdown.HIRED ?? 0}</CardMeta>
          </Card>
        </div>

        <section className="dashboard-section">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">Backend data</p>
              <h2>Your posted jobs</h2>
            </div>
          </div>

          <div className="job-grid">
            {ownJobs.length === 0 ? (
              <Card>
                <CardTitle>No jobs yet</CardTitle>
                <CardMeta>Use the backend job creation form to publish your first listing.</CardMeta>
              </Card>
            ) : (
              ownJobs.map((job) => (
                <Card key={job.id}>
                  <CardTitle>{job.title}</CardTitle>
                  <CardMeta>
                    {job.location ?? 'Remote'} · {job.jobType}
                  </CardMeta>
                  <CardMeta>
                    {job.salaryMin || job.salaryMax
                      ? `Salary: ${job.salaryMin ?? 0} - ${job.salaryMax ?? 0}`
                      : 'Salary not specified'}
                  </CardMeta>
                  <Button to="/employer/applicants" variant="ghost">Review applicants</Button>
                </Card>
              ))
            )}
          </div>
        </section>
      </section>
    </SiteLayout>
  );
}
