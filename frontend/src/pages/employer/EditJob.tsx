import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
import { updateJob, type EmployerJob } from '../../services/employer.service';
import { getJobById } from '../../services/jobs.service';

export default function EditJob() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState<JobTypeValue>('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setFetching(true);
    getJobById(id)
      .then((job) => {
        setTitle(job.title || '');
        setDescription(job.description || '');
        setLocation(job.location || '');
        setJobType((job.jobType as JobTypeValue) || 'FULL_TIME');
        setSalaryMin(job.salaryMin ? job.salaryMin.toString() : '');
        setSalaryMax(job.salaryMax ? job.salaryMax.toString() : '');
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch job details.');
      })
      .finally(() => setFetching(false));
  }, [id]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError('');
    updateJob(id, {
      title,
      description,
      location: location || undefined,
      jobType,
      salaryMin: salaryMin || undefined,
      salaryMax: salaryMax || undefined,
    })
      .then(() => {
        navigate('/employer');
      })
      .catch((err) => {
        console.error(err);
        setError(err?.response?.data?.message || err.message || 'Could not update this job. Please try again.');
      })
      .finally(() => setLoading(false));
  }

  if (fetching) {
    return (
      <SiteLayout>
        <section className="employer-page">
          <p>Loading job details...</p>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="studio-post-job studio-post-job--employer employer-page">
        <header className="studio-post-job__head employer-page__head">
          <div>
            <p className="eyebrow">Edit Job</p>
            <h1 className="display">Update your job listing</h1>
            <p className="lead">Modify the details below and save your changes.</p>
          </div>
        </header>

        <div className="studio-post-job__layout employer-page__layout">
          <Card className="studio-block employer-form-card">
            <CardEyebrow>Job information</CardEyebrow>
            <CardTitle>Edit your listing</CardTitle>
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
                  {loading ? 'Saving…' : 'Save Changes'}
                </Button>
                <Button variant="secondary" type="button" onClick={() => navigate('/employer')}>
                  Cancel
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
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
