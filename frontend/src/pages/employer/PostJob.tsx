import { useState } from 'react';
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
    <section>
      <header className="page-header">
        <h2>Post a Job</h2>
      </header>

      <form onSubmit={onSubmit} className="form-stack">
        <label>
          Job Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} required />
        </label>
        <label>
          Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kigali, Rwanda" />
        </label>
        <label>
          Job Type
          <select value={jobType} onChange={(e) => setJobType(e.target.value as typeof jobType)}>
            {JOB_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Salary Min
          <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="0" />
        </label>
        <label>
          Salary Max
          <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="0" />
        </label>

        <div>
          <Button type="submit" disabled={loading}>{loading ? 'Publishing…' : 'Publish'}</Button>
          <Button variant="secondary" type="button" onClick={() => {
            setTitle('');
            setDescription('');
            setLocation('');
            setJobType('FULL_TIME');
            setSalaryMin('');
            setSalaryMax('');
            setPublishedJob(null);
            setError('');
          }}>Reset</Button>
        </div>
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      </form>

      {publishedJob && (
        <Card>
          <CardTitle>{publishedJob.title}</CardTitle>
          <CardMeta>
            {publishedJob.location ?? 'No location'} · {publishedJob.jobType}
          </CardMeta>
          <p>{publishedJob.description}</p>
        </Card>
      )}
    </section>
  );
}
