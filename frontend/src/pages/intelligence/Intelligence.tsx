import { useEffect, useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { getJobs, type JobSummary } from '../../services/jobs.service';
import { getCareerPathway, getSkillGapAnalysis, type CareerPathway } from '../../services/intelligence.service';

function formatCount(value?: number) {
	return typeof value === 'number' ? value.toLocaleString() : '0';
}

export default function Intelligence() {
	const { isAuthenticated } = useAuth();
	const [jobs, setJobs] = useState<JobSummary[]>([]);
	const [selectedJobId, setSelectedJobId] = useState('');
	const [gapAnalysis, setGapAnalysis] = useState<null | Awaited<ReturnType<typeof getSkillGapAnalysis>>>(null);
	const [pathway, setPathway] = useState<CareerPathway | null>(null);
	const [loadingJobs, setLoadingJobs] = useState(true);
	const [loadingAnalysis, setLoadingAnalysis] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let active = true;
		Promise.all([getJobs(), getCareerPathway()])
			.then(([jobsResponse, pathwayResponse]) => {
				if (!active) return;
				setJobs(jobsResponse.jobs ?? []);
				setPathway(pathwayResponse);
				setSelectedJobId((jobsResponse.jobs ?? [])[0]?.id ?? '');
			})
			.catch((fetchError) => {
				console.error('Failed to load intelligence data', fetchError);
				if (active) setError('The intelligence dashboard could not load right now.');
			})
			.finally(() => {
				if (active) setLoadingJobs(false);
			});

		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (!selectedJobId) {
			setGapAnalysis(null);
			setLoadingAnalysis(false);
			return;
		}

		let active = true;
		setLoadingAnalysis(true);
		getSkillGapAnalysis(selectedJobId)
			.then((analysis) => {
				if (active) setGapAnalysis(analysis);
			})
			.catch((fetchError) => {
				console.error('Failed to load gap analysis', fetchError);
				if (active) setGapAnalysis(null);
			})
			.finally(() => {
				if (active) setLoadingAnalysis(false);
			});

		return () => {
			active = false;
		};
	}, [selectedJobId]);

	const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId) ?? null, [jobs, selectedJobId]);

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return (
		<SiteLayout>
			<div className="page-shell intelligence-page">
				<header className="page-head intelligence-page__hero">
					<div>
						<p className="section-head__eyebrow">Career intelligence</p>
						<h1>Match skills to live opportunities</h1>
						<p className="muted">This view is backed by the NestJS intelligence endpoints and the live jobs catalog.</p>
					</div>
					<div className="intelligence-page__actions">
						<Button to="/jobs" variant="secondary">Browse jobs</Button>
						<Button to="/courses" variant="primary">Browse courses</Button>
					</div>
				</header>

				{error ? <Card><CardTitle>{error}</CardTitle><CardMeta>Try refreshing the page or checking the backend API.</CardMeta></Card> : null}

				<section className="dashboard-section dashboard-section--split">
					<Card>
						<CardEyebrow>Skill gap</CardEyebrow>
						<CardTitle>Compare yourself to a live role</CardTitle>
						<CardMeta>Select a job to see matching and missing skills from the backend analysis.</CardMeta>
						<label className="intelligence-page__select">
							<span>Target job</span>
							<select value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)}>
								{jobs.map((job) => (
									<option key={job.id} value={job.id}>{job.title} · {job.employer.name}</option>
								))}
							</select>
						</label>
						{loadingAnalysis ? <CardMeta>Loading live gap analysis…</CardMeta> : null}
						{selectedJob && gapAnalysis ? (
							<div className="intelligence-pills">
								<div className="hero-stat"><span>Match score</span><strong>{gapAnalysis.matchScore}%</strong><p>{selectedJob.title}</p></div>
								<div className="hero-stat"><span>Matching skills</span><strong>{formatCount(gapAnalysis.matchingSkills.length)}</strong><p>{gapAnalysis.matchingSkills.join(', ') || 'No overlaps yet.'}</p></div>
								<div className="hero-stat"><span>Missing skills</span><strong>{formatCount(gapAnalysis.missingSkills.length)}</strong><p>{gapAnalysis.missingSkills.join(', ') || 'Nothing missing.'}</p></div>
							</div>
						) : null}
					</Card>

					<Card>
						<CardEyebrow>Pathway</CardEyebrow>
						<CardTitle>Recommended next step</CardTitle>
						<CardMeta>
							{pathway?.currentLevel ?? 'Loading level'} → {pathway?.nextMilestone ?? 'Loading milestone'}
						</CardMeta>
						<div className="dashboard-trend-list">
							{(pathway?.trendingSkillsToLearn ?? []).slice(0, 5).map((skill) => (
								<div key={skill.skillId} className="dashboard-trend-row">
									<span>Skill {skill.skillId.slice(0, 8)}</span>
									<strong>{skill._count?.skillId ?? 0}</strong>
								</div>
							))}
						</div>
					</Card>
				</section>

				<section className="dashboard-section">
					<div className="section-head">
						<div>
							<p className="section-head__eyebrow">Recommended courses</p>
							<h2>Training that closes the gap</h2>
						</div>
					</div>
					<div className="course-stack">
						{(pathway?.recommendedCourses ?? []).map((course) => (
							<Card key={course.id} className="course-card">
								<div className="course-card__top">
									<div>
										<CardEyebrow>{course.institution?.name ?? 'Hanga Works'}</CardEyebrow>
										<CardTitle>
											<Link to={`/courses/${course.id}`}>{course.title}</Link>
										</CardTitle>
									</div>
									<strong>{course._count?.modules ?? course.modules?.length ?? 0} modules</strong>
								</div>
								<CardMeta>{course.description}</CardMeta>
								<div className="course-card__actions">
									<Button to={`/courses/${course.id}`} variant="secondary">Open course</Button>
								</div>
							</Card>
						))}
						{!loadingJobs && !(pathway?.recommendedCourses?.length ?? 0) ? (
							<Card>
								<CardTitle>No recommendations yet</CardTitle>
								<CardMeta>As you add skills and apply to jobs, the pathway view will become more specific.</CardMeta>
							</Card>
						) : null}
					</div>
				</section>
			</div>
		</SiteLayout>
	);
}
