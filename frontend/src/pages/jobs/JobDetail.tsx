import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { applyForJob, getApplications, getJobById, getJobs, type JobSummary } from '../../services/jobs.service';
import type { JobApplication } from '../../types/job.types';

export default function JobDetail() {
	const { id } = useParams<{ id: string }>();
	const [job, setJob] = useState<JobSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [status, setStatus] = useState('');
	const [applying, setApplying] = useState(false);
	const [application, setApplication] = useState<JobApplication | null>(null);
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [similarJobs, setSimilarJobs] = useState<JobSummary[]>([]);
	const [formStep, setFormStep] = useState(1);
	const [applicationForm, setApplicationForm] = useState({
		fullName: '',
		email: '',
		phone: '',
		portfolio: '',
		coverLetter: '',
		resumeSummary: '',
	});

	useEffect(() => {
		if (!id) return;
		let active = true;
		setLoading(true);
		setError('');
		Promise.all([getJobById(id), getJobs(), getApplications()])
			.then(([foundJob, allJobs, items]) => {
				if (!active) return;
				setJob(foundJob ?? null);
				setSimilarJobs((allJobs.jobs ?? []).filter((item) => item.id !== id).slice(0, 4));
				setApplication(items.find((item) => item.job.id === id) ?? null);
				if (items.find((item) => item.job.id === id)) {
					setStatus('Application already submitted. Use the applications page to track its status.');
				}
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
		if (applying) return;
		if (application) {
			setStatus('You already applied for this role. Open the applications page to view the current status and avoid duplicate submissions.');
			return;
		}
		if (!isAuthenticated) {
			// redirect to login and return here after auth
			navigate('/login', { state: { from: location.pathname } });
			return;
		}
		setApplying(true);
		setStatus('Submitting your application. The request is sent once and the button is locked to prevent duplicate submissions.');
		try {
			await applyForJob(job.id);
			setStatus('Application submitted successfully. The employer can now review your profile and submission.');
		} catch (applyError) {
			console.error(applyError);
			if (axios.isAxiosError(applyError) && applyError.response?.status === 409) {
				setStatus('You already applied for this job. The platform blocks duplicate applications so the employer sees one clean submission.');
			} else {
				setStatus('Could not submit application right now. Try again later or check your connection.');
			}
		} finally {
			setApplying(false);
		}
	}

	function moveToNextStep() {
		setFormStep((prev) => Math.min(3, prev + 1));
	}

	function moveToPreviousStep() {
		setFormStep((prev) => Math.max(1, prev - 1));
	}

	return (
		<SiteLayout>
			<section className="studio-job-detail">
				<Link to="/jobs" className="studio-inline-link">Back to jobs</Link>

				{loading ? <p>Loading job details...</p> : null}
				{!loading && error ? <Card className="studio-block"><CardTitle>{error}</CardTitle><CardMeta>Try another role from the marketplace.</CardMeta></Card> : null}

				{job ? (
					<>
						<header className="studio-job-detail__head">
							<div>
								<p className="eyebrow">{job.employer.name}</p>
								<h1 className="display">{job.title}</h1>
								<p className="lead">{job.description}</p>
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

						<section className="studio-job-detail__layout">
							<div className="studio-job-detail__main">
								<Card className="studio-block">
									<CardEyebrow>Job highlights</CardEyebrow>
									<div className="studio-chip-row">
										{job.description
											.split(' ')
											.slice(0, 14)
											.map((word) => (
												<span key={word} className="dashboard-chip">{word.replace(/[.,]/g, '')}</span>
											))}
									</div>
								</Card>

								<Card className="studio-block">
									<div className="studio-section__head">
										<div>
											<p className="eyebrow">Similar roles</p>
											<h2>Explore related openings</h2>
										</div>
									</div>
									<div className="studio-job-grid">
										{similarJobs.map((item) => (
											<Card key={item.id} className="studio-job-card">
												<CardEyebrow>{item.employer.name}</CardEyebrow>
												<CardTitle><Link to={`/jobs/${item.id}`}>{item.title}</Link></CardTitle>
												<CardMeta>{item.location ?? 'Location flexible'}</CardMeta>
												<Button to={`/jobs/${item.id}`} variant="secondary">View</Button>
											</Card>
										))}
									</div>
								</Card>
							</div>

							<aside className="studio-job-detail__apply">
								<Card className="studio-block">
									<CardEyebrow>Application form</CardEyebrow>
									<CardTitle>Step {formStep} of 3</CardTitle>
									<div className="studio-stepper">
										<span className={formStep >= 1 ? 'is-active' : ''}>1</span>
										<span className={formStep >= 2 ? 'is-active' : ''}>2</span>
										<span className={formStep >= 3 ? 'is-active' : ''}>3</span>
									</div>

									{formStep === 1 ? (
										<div className="form-stack">
											<label>Full name<input value={applicationForm.fullName} onChange={(event) => setApplicationForm((prev) => ({ ...prev, fullName: event.target.value }))} placeholder="Your full name" /></label>
											<label>Email<input type="email" value={applicationForm.email} onChange={(event) => setApplicationForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="you@example.com" /></label>
											<label>Phone<input value={applicationForm.phone} onChange={(event) => setApplicationForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="+250..." /></label>
										</div>
									) : null}

									{formStep === 2 ? (
										<div className="form-stack">
											<label>Portfolio URL<input value={applicationForm.portfolio} onChange={(event) => setApplicationForm((prev) => ({ ...prev, portfolio: event.target.value }))} placeholder="https://portfolio.example" /></label>
											<label>Resume summary<textarea rows={4} value={applicationForm.resumeSummary} onChange={(event) => setApplicationForm((prev) => ({ ...prev, resumeSummary: event.target.value }))} placeholder="Highlight your role-specific strengths" /></label>
										</div>
									) : null}

									{formStep === 3 ? (
										<div className="form-stack">
											<label>Cover letter<textarea rows={6} value={applicationForm.coverLetter} onChange={(event) => setApplicationForm((prev) => ({ ...prev, coverLetter: event.target.value }))} placeholder="Explain why you are a fit for this role" /></label>
											<CardMeta>Review your details then submit to finalize your application.</CardMeta>
										</div>
									) : null}

									<div className="studio-action-row">
										<Button type="button" variant="ghost" disabled={formStep === 1} onClick={moveToPreviousStep}>Back</Button>
										{formStep < 3 ? (
											<Button type="button" variant="secondary" onClick={moveToNextStep}>Next</Button>
										) : null}
										{isAuthenticated ? (
											<Button type="button" variant="primary" className="button--pill" onClick={handleApply} disabled={applying || !!application}>
												{application ? 'Already applied' : applying ? 'Submitting...' : 'Submit application'}
											</Button>
										) : (
											<Button to="/login" variant="primary" className="button--pill">Sign in to apply</Button>
										)}
									</div>

									{application ? (
										<CardMeta>Application status: {application.status.toLowerCase()} · Updated {new Date(application.updatedAt).toLocaleDateString()}</CardMeta>
									) : null}
									{status ? <CardMeta>{status}</CardMeta> : null}
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
