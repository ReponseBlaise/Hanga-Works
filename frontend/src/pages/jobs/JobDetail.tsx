import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { applyForJob, getJobById, getJobs, type JobSummary } from '../../services/jobs.service';

export default function JobDetail() {
	const { id } = useParams<{ id: string }>();
	const [job, setJob] = useState<JobSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [status, setStatus] = useState('');
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [similarJobs, setSimilarJobs] = useState<JobSummary[]>([]);

	useEffect(() => {
		if (!id) return;
		let active = true;
		setLoading(true);
		setError('');
		Promise.all([getJobById(id), getJobs()])
			.then(([foundJob, allJobs]) => {
				if (!active) return;
				setJob(foundJob ?? null);
				setSimilarJobs((allJobs.jobs ?? []).filter((item) => item.id !== id).slice(0, 4));
			})
			.catch((fetchError) => {
				console.error(fetchError);
				if (active) setError('This job could not be loaded.');
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		return () => {
			active = false;
		};
	}, [id]);

	const employerInitials = useMemo(() => {
		if (!job?.employer.name) return 'HW';
		return job.employer.name
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('');
	}, [job?.employer.name]);

	async function handleApply() {
		if (!job) return;
		if (!isAuthenticated) {
			// redirect to login and return here after auth
			navigate('/login', { state: { from: location.pathname } });
			return;
		}
		setStatus('Applying...');
		try {
			await applyForJob(job.id);
			setStatus('Application submitted successfully.');
		} catch (applyError) {
			console.error(applyError);
			setStatus('Could not submit application.');
		}
	}

	return (
		<SiteLayout>
			<section className="job-detail-page">
				<Link to="/jobs" className="course-detail__back">← Back to jobs</Link>

				{loading ? <p>Loading job details…</p> : null}
				{!loading && error ? <Card className="courses-empty"><CardTitle>{error}</CardTitle><CardMeta>Try another role from the marketplace.</CardMeta></Card> : null}

				{job ? (
					<>
						<section className="course-detail__hero card">
							<div className="course-detail__hero-copy">
								<CardEyebrow>{job.employer.name}</CardEyebrow>
								<h2 className="course-detail__title">{job.title}</h2>
								<p className="card-meta">{job.description}</p>
								<p className="course-detail__meta">{job.location ?? 'Remote friendly'} · {job.jobType.replace('_', ' ')} · {formatSalary(job.salaryMin, job.salaryMax)}</p>
							</div>
							<div className="course-detail__hero-panel">
								<div className="employer-branding">
									<div className="employer-branding__mark" aria-hidden="true">{employerInitials}</div>
									<div>
										<strong>{job.employer.name}</strong>
										<p>{job.employer.website ?? 'Employer branding ready for preview'}</p>
									</div>
								</div>
								{isAuthenticated ? (
									<Button type="button" variant="primary" onClick={handleApply}>One-click apply</Button>
								) : (
									<Button to="/login" variant="primary">Sign in to apply</Button>
								)}
								{isAuthenticated ? (
									<Button type="button" variant="secondary" onClick={handleApply}>Save role</Button>
								) : (
									<Button to="/login" variant="secondary">Sign in to save</Button>
								)}
								{status ? <p className="course-detail__quiz-note">{status}</p> : null}
							</div>
						</section>

						<section className="dashboard-section">
							<div className="section-head">
								<div>
									<p className="section-head__eyebrow">Why this role</p>
									<h2>Role highlights</h2>
								</div>
							</div>
							<div className="job-detail-grid">
								<Card>
									<CardTitle>Skills to show</CardTitle>
									<CardMeta>Tailor your application to the employer's keywords.</CardMeta>
									<div className="job-card__tags">
										{job.description.split(' ').slice(0, 10).map((word) => <span key={word}>{word.replace(/[.,]/g, '')}</span>)}
									</div>
								</Card>
								<Card>
									<CardTitle>Employer link</CardTitle>
									<CardMeta>{job.employer.website ?? 'No public website provided'}</CardMeta>
									<p className="card-meta">This section is ready for expanded branding assets and company details.</p>
								</Card>
							</div>
						</section>

						<section className="dashboard-section">
							<div className="section-head">
								<div>
									<p className="section-head__eyebrow">Similar roles</p>
									<h2>Other openings</h2>
								</div>
							</div>
							<div className="job-grid">
								{similarJobs.map((item) => (
									<Card key={item.id} className="job-card">
										<CardEyebrow>{item.employer.name}</CardEyebrow>
										<CardTitle><Link to={`/jobs/${item.id}`}>{item.title}</Link></CardTitle>
										<CardMeta>{item.location ?? 'Location flexible'}</CardMeta>
										<div className="job-card__actions">
											<Button to={`/jobs/${item.id}`} variant="secondary">Open</Button>
										</div>
									</Card>
								))}
							</div>
						</section>
					</>
				) : null}
			</section>
		</SiteLayout>
	);
}

function formatSalary(min?: number | null, max?: number | null) {
	if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
	if (min) return `From $${min.toLocaleString()}`;
	if (max) return `Up to $${max.toLocaleString()}`;
	return 'Competitive salary';
}
