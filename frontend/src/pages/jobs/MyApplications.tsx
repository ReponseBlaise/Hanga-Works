import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { getApplications } from '../../services/jobs.service';
import type { JobApplication, JobApplicationStage } from '../../types/job.types';

const stageLabels: Record<JobApplicationStage, string> = {
  APPLIED: 'Applied',
  REVIEWING: 'Reviewing',
  SHORTLISTED: 'Shortlisted',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
};

const stages: JobApplicationStage[] = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED', 'REJECTED'];

export default function MyApplications() {
  const { isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      if (applications.length > 0) setApplications([]);
      if (loading) setLoading(false);
      return;
    }

    let active = true;
    getApplications()
      .then((items) => {
        if (active) setApplications(items ?? []);
      })
      .catch((error) => {
        console.error('Failed to load applications', error);
        if (active) setApplications([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const grouped = useMemo(() => {
    return stages.reduce<Record<JobApplicationStage, JobApplication[]>>((acc, stage) => {
      acc[stage] = applications.filter((item) => item.status === stage);
      return acc;
    }, {} as Record<JobApplicationStage, JobApplication[]>);
  }, [applications]);

  return (
    <SiteLayout>
      <section className="studio-applicants" id="applications">
        <header className="studio-applicants__head">
          <div>
            <p className="eyebrow">Applications</p>
            <h1 className="display-large">Track every application from applied to hired.</h1>
            <p className="lead">
              Review your pipeline with direct links back to each job posting and a clear stage-by-stage view of every application.
            </p>
            <div className="studio-action-row mt-md">
              <Button to="/jobs" variant="primary" className="button--lg button--pill">Search jobs</Button>
              <Button to="/profile" variant="secondary" className="button--lg">Update profile</Button>
            </div>
            <div className="studio-stat-grid mt-lg">
              <div><span>Total applications</span><strong>{applications.length}</strong></div>
              <div><span>In review</span><strong>{grouped.REVIEWING.length + grouped.SHORTLISTED.length}</strong></div>
              <div><span>Pipeline stages</span><strong>{stages.length}</strong></div>
            </div>
          </div>
        </header>

        {loading ? <p className="muted">Loading applications…</p> : null}

        <div className="studio-applicants__kanban">
          {stages.map((stage) => (
            <div className="studio-column" key={stage}>
              <div className="studio-section__head">
                <div><p className="eyebrow">{stageLabels[stage]}</p><h2>{grouped[stage].length}</h2></div>
              </div>
              <div className="studio-stack mt-md">
                {grouped[stage].length === 0 ? (
                  <Card className="studio-block"><CardMeta>No applications in this stage.</CardMeta></Card>
                ) : null}
                {grouped[stage].map((application) => (
                  <Card key={application.id} className="studio-job-card">
                    <CardEyebrow>{application.job.employer.name}</CardEyebrow>
                    <CardTitle><Link to={`/jobs/${application.job.id}`}>{application.job.title}</Link></CardTitle>
                    <CardMeta>{application.job.location ?? 'Remote friendly'}</CardMeta>
                    <span className="muted">Updated {new Date(application.updatedAt).toLocaleDateString()}</span>
                    <div className="studio-action-row mt-md">
                      <Button to={`/jobs/${application.job.id}`} variant="secondary">View job</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
