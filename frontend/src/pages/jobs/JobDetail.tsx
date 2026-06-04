import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { getApplications, getJobById, getJobs, type JobSummary } from '../../services/jobs.service';
import type { JobApplication } from '../../types/job.types';

export default function JobDetail() {
	const { id } = useParams<{ id: string }>();
	const [job, setJob] = useState<JobSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [application, setApplication] = useState<JobApplication | null>(null);
	const { isAuthenticated } = useAuth();
	const [similarJobs, setSimilarJobs] = useState<JobSummary[]>([]);
	const role = (useAuth().user?.role ?? '').toUpperCase();
	const canApply = !role || role === 'LEARNER';

	useEffect(() => {
		if (!id) return;
		let active = true;
		if (!loading) {
			setTimeout(() => {
				if (active) setLoading(true);
			}, 0);
		}
		if (error) {
			setTimeout(() => {
				if (active) setError('');
			}, 0);
		}
		const applicationsPromise = isAuthenticated ? getApplications() : Promise.resolve([]);
		Promise.all([getJobById(id), getJobs(), applicationsPromise])
			.then(([foundJob, allJobs, items]) => {
				if (!active) return;
				setJob(foundJob ?? null);
				setSimilarJobs((allJobs.jobs ?? []).filter((item) => item.id !== id).slice(0, 4));
				setApplication(items.find((item) => item.job.id === id) ?? null);
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
	}, [id, isAuthenticated, error, loading]);

	const employerInitials = useMemo(() => {
		const name = job?.employer?.name;
		if (!name) return 'HW';
		return name
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('');
	}, [job]);

	return (
		<SiteLayout>
			<section className="studio-job-detail job-detail-redesign">
				<Link to="/jobs" className="studio-inline-link">Back to jobs</Link>

				{loading ? <p>Loading job details...</p> : null}
				{!loading && error ? <Card className="studio-block"><CardTitle>{error}</CardTitle><CardMeta>Try another role from the marketplace.</CardMeta></Card> : null}

				{job ? (
					<>
						<header className="studio-job-detail__head">
							<div>
								<p className="eyebrow">{job.employer.name}</p>
								<h1 className="display">{job.title}</h1>
								<p className="lead">{job.description.slice(0, 260)}{job.description.length > 260 ? '...' : ''}</p>
								<p className="muted">{job.location ?? 'Remote friendly'} · {job.jobType.replace('_', ' ')} · {formatSalary(job.salaryMin, job.salaryMax)}</p>
							</div>
							<div className="studio-employer-card">
								<div className="studio-employer-mark" aria-hidden="true">{employerInitials}</div>
								<div>
									<strong>{job.employer.name}</strong>
									<p>{job.employer.website ?? 'Employer website not provided'}</p>
								</div>
							</div>
						</header>

						<section className="job-detail-redesign__layout mt-lg">
							<div className="job-detail-redesign__content">
								<Card className="studio-block">
									<CardEyebrow>Overview</CardEyebrow>
									<div className="job-detail-redesign__overview">
										<div><span>Industry</span><strong>{job.employer.name}</strong></div>
										<div><span>Job level</span><strong>{job.jobType.replace('_', ' ')}</strong></div>
										<div><span>Salary</span><strong>{formatSalary(job.salaryMin, job.salaryMax)}</strong></div>
										<div><span>Location</span><strong>{job.location ?? 'Remote friendly'}</strong></div>
									</div>
									<CardMeta>{job.description}</CardMeta>
									<div className="studio-chip-row">
										{(job.skills ?? []).map((entry) => (
											<span key={entry.id} className="dashboard-chip">{entry.skill.name}</span>
										))}
									</div>
								</Card>

								<Card className="studio-block">
									<div className="studio-section__head">
										<div>
											<p className="eyebrow">Role details</p>
											<h2>What the hiring team is looking for</h2>
										</div>
									</div>
									<div className="job-detail-redesign__copy">
										<h3>Responsibilities</h3>
										<ul>
											<li>Contribute to outcomes with strong ownership and clear communication.</li>
											<li>Collaborate with cross-functional teams and share progress frequently.</li>
											<li>Deliver quality work aligned with employer standards and timelines.</li>
										</ul>
										<h3>Preferred experience</h3>
										<ul>
											<li>Practical experience with the main skill stack listed above.</li>
											<li>Ability to work in distributed teams and iterate quickly.</li>
											<li>Portfolio or projects demonstrating problem-solving ability.</li>
										</ul>
									</div>
								</Card>
							</div>

							<aside className="job-detail-redesign__sidebar">
								<Card className="studio-block">
									<CardEyebrow>Office & contact</CardEyebrow>
									<div className="job-detail-redesign__map">Map preview unavailable in this view</div>
									<CardMeta>{job.location ?? 'Location not specified'}</CardMeta>
									<CardMeta>{job.employer.website ?? 'No public employer website provided'}</CardMeta>
								</Card>

								<Card className="studio-block">
									<CardEyebrow>Similar jobs</CardEyebrow>
									<div className="studio-stack">
										{similarJobs.map((item) => (
											<Link key={item.id} to={`/jobs/${item.id}`} className="studio-inline-item">
												<div>
													<strong>{item.title}</strong>
													<p>{item.employer.name}</p>
												</div>
												<span>{item.location ?? 'Remote'}</span>
											</Link>
										))}
									</div>
								</Card>

								<Card className="studio-block">
									<CardEyebrow>Apply</CardEyebrow>
									<CardTitle>Submit your application on a dedicated page</CardTitle>
									<CardMeta>
										Use the application page for the guided 3-step form and final submission.
									</CardMeta>
									<div className="studio-action-row">
										{!canApply ? (
											<Button type="button" variant="secondary" disabled>
												This role can view jobs only
											</Button>
										) : !isAuthenticated ? (
											<Button to="/login" variant="primary" className="button--pill">Sign in to apply</Button>
										) : (
											<Button to={`/jobs/${job.id}/apply`} variant="primary" className="button--pill">
												Go to application form
											</Button>
										)}
									</div>
									{application ? (
										<CardMeta>Application status: {application.status.toLowerCase()} · Updated {new Date(application.updatedAt).toLocaleDateString()}</CardMeta>
									) : null}
								</Card>
							</aside>
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
