import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdTitle,
  MdDescription,
  MdLocationOn,
  MdWork,
  MdAttachMoney,
  MdPreview,
  MdPublish,
  MdRefresh,
} from 'react-icons/md';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { JOB_TYPE_OPTIONS, formatJobType, type JobTypeValue } from '../../constants/jobTypes';
import { createEmployerJob, type EmployerJob } from '../../services/employer.service';

export default function PostJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState<JobTypeValue>('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [publishedJob, setPublishedJob] = useState<EmployerJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function resetForm() {
    setTitle('');
    setDescription('');
    setLocation('');
    setJobType('FULL_TIME');
    setSalaryMin('');
    setSalaryMax('');
    setPublishedJob(null);
    setError('');
  }

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
        setError(err?.response?.data?.message || err.message || 'Could not publish this job. Please try again.');
      })
      .finally(() => setLoading(false));
  }

  return (
    <SiteLayout>
      <section className="studio-post-job studio-post-job--employer employer-page">
        <header className="studio-post-job__head employer-page__head">
          <div>
            <p className="eyebrow">Post a job</p>
            <h1 className="display">Share a new opening with candidates</h1>
            <p className="lead">Fill in the details below. The preview updates as you type so you can check everything before publishing.</p>
          </div>
        </header>

        <div className="studio-post-job__layout employer-page__layout">
          <Card className="studio-block employer-form-card">
            <CardEyebrow>Job information</CardEyebrow>
            <CardTitle>Create your listing</CardTitle>
            <form onSubmit={onSubmit} className="form-stack employer-form">
              <label className="employer-form__label">
                <span className="employer-form__label-row"><MdTitle className="employer-form__icon" aria-hidden /> Job title</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend developer" required />
              </label>

              <label className="employer-form__label">
                <span className="employer-form__label-row"><MdDescription className="employer-form__icon" aria-hidden /> About the role</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  placeholder="Describe responsibilities, requirements, and what makes this role a good fit."
                  required
                />
              </label>

              <div className="employer-form__grid">
                <label className="employer-form__label">
                  <span className="employer-form__label-row"><MdLocationOn className="employer-form__icon" aria-hidden /> Location</span>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kigali or Remote" />
                </label>
                <label className="employer-form__label">
                  <span className="employer-form__label-row"><MdWork className="employer-form__icon" aria-hidden /> Work style</span>
                  <select value={jobType} onChange={(e) => setJobType(e.target.value as JobTypeValue)}>
                    {JOB_TYPE_OPTIONS.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </label>
                <label className="employer-form__label">
                  <span className="employer-form__label-row"><MdAttachMoney className="employer-form__icon" aria-hidden /> Minimum pay (RWF)</span>
                  <input type="number" min={0} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="Optional" />
                </label>
                <label className="employer-form__label">
                  <span className="employer-form__label-row"><MdAttachMoney className="employer-form__icon" aria-hidden /> Maximum pay (RWF)</span>
                  <input type="number" min={0} value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="Optional" />
                </label>
              </div>

              <div className="studio-action-row">
                <Button type="submit" variant="primary" className="button--pill" disabled={loading}>
                  <span className="ui-icon" aria-hidden><MdPublish /></span>
                  {loading ? 'Publishing…' : 'Publish job'}
                </Button>
                <Button variant="secondary" type="button" onClick={resetForm}>
                  <span className="ui-icon" aria-hidden><MdRefresh /></span>
                  Clear form
                </Button>
              </div>
              {error ? <p className="employer-form__error">{error}</p> : null}
            </form>
          </Card>

          <aside className="employer-page__aside">
            <Card className="studio-block employer-preview-card">
              <CardEyebrow><span className="ui-icon" aria-hidden><MdPreview /></span> Preview</CardEyebrow>
              <CardTitle>{title || 'Your job title'}</CardTitle>
              <CardMeta>
                <span className="employer-preview__meta"><MdLocationOn aria-hidden /> {location || 'Location not set'}</span>
              </CardMeta>
              <CardMeta>
                <span className="employer-preview__meta"><MdWork aria-hidden /> {formatJobType(jobType)}</span>
              </CardMeta>
              <CardMeta>
                <span className="employer-preview__meta">
                  <MdAttachMoney aria-hidden />
                  {salaryMin || salaryMax ? `RWF ${salaryMin || '—'} – ${salaryMax || '—'}` : 'Pay range not set'}
                </span>
              </CardMeta>
              <p className="employer-preview__body">{description || 'Your job description will appear here.'}</p>
            </Card>

            {publishedJob ? (
              <Card className="studio-block employer-success-card">
                <CardEyebrow>Published</CardEyebrow>
                <CardTitle>Your job is live</CardTitle>
                <CardMeta>
                  <Link to={`/jobs/${publishedJob.id}`}>{publishedJob.title}</Link>
                </CardMeta>
                <p className="muted">{publishedJob.location ?? 'No location'} · {formatJobType(publishedJob.jobType)}</p>
                <Button to={`/jobs/${publishedJob.id}`} variant="secondary">View job page</Button>
              </Card>
            ) : null}
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
