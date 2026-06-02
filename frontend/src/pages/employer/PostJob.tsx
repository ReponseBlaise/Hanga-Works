import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { createEmployerJob, type EmployerJob } from '../../services/employer.service';

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'HYBRID', 'INTERNSHIP', 'FREELANCE'] as const;

export default function PostJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState<(typeof JOB_TYPES)[number]>('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [publishedJob, setPublishedJob] = useState<EmployerJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    createEmployerJob({
      title,
      description,
      location: location || undefined,
      jobType,
      salaryMin: salaryMin || undefined,
      salaryMax: salaryMax || undefined,
    })
      .then((job) => setPublishedJob(job))
      .catch((err) => {
        console.error(err);
        setError(err?.response?.data?.message || err.message || 'Failed to publish job');
      })
      .finally(() => setLoading(false));
  }

  return (
    <SiteLayout>
      <section className="studio-post-job studio-post-job--employer">
        <header className="studio-post-job__head">
          <div>
            <p className="eyebrow">Recruiter mode</p>
            <h1 className="display">Post a role with a clean, scannable drafting workflow.</h1>
            <p className="lead">Create listings quickly and validate copy quality using the live preview panel before publishing.</p>
          </div>
        </header>

        <div className="studio-post-job__layout">
          <Card className="studio-block">
            <CardTitle>Job details</CardTitle>
            <form onSubmit={onSubmit} className="form-stack">
              <label>
                Job title
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </label>
              <label>
                Job description
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={8} required />
              </label>
              <div className="profile-form-grid">
                <label>
                  Location
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kigali, Rwanda" />
                </label>
                <label>
                  Job type
                  <select value={jobType} onChange={(e) => setJobType(e.target.value as typeof jobType)}>
                    {JOB_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Salary min
                  <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="0" />
                </label>
                <label>
                  Salary max
                  <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="0" />
                </label>
              </div>

              <div className="studio-action-row">
                <Button type="submit" variant="primary" className="button--pill" disabled={loading}>{loading ? 'Publishing...' : 'Publish job'}</Button>
                <Button variant="secondary" type="button" onClick={() => {
                  setTitle('');
                  setDescription('');
                  setLocation('');
                  setJobType('FULL_TIME');
                  setSalaryMin('');
                  setSalaryMax('');
                  setPublishedJob(null);
                  setError('');
                }}>Reset form</Button>
              </div>
              {error && <CardMeta>{error}</CardMeta>}
            </form>
          </Card>

          <aside>
            <Card className="studio-block">
              <CardTitle>Live preview</CardTitle>
              <CardMeta>{title || 'Untitled role'}</CardMeta>
              <p className="muted">{location || 'Location not specified'} · {jobType.replace('_', ' ')}</p>
              <p className="muted">{salaryMin || salaryMax ? `Salary range: ${salaryMin || 0} - ${salaryMax || 0}` : 'Salary range not specified'}</p>
              <p>{description || 'Role description preview will appear here as you type.'}</p>
            </Card>

            {publishedJob ? (
              <Card className="studio-block">
                <CardTitle>Published successfully</CardTitle>
                  <CardMeta><Link to={`/jobs/${publishedJob.id}`}>{publishedJob.title}</Link></CardMeta>
                <p className="muted">{publishedJob.location ?? 'No location'} · {publishedJob.jobType}</p>
                <p>{publishedJob.description}</p>
              </Card>
            ) : null}
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
