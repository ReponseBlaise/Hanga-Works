import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { ProgressBar } from '../../components/shared/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import { getApplications, getJobs, type JobSummary } from '../../services/jobs.service';
import { getCourses, type BackendCourse } from '../../services/courses.service';
import { getMyCertificates, type LearnerCertificate } from '../../services/certificates.service';
import type { JobApplication } from '../../types/job.types';

type DashboardCourse = {
	id: string;
	title: string;
	provider: string;
	enrollments: number;
	modules: number;
	description: string;
};

function DashboardSectionTitle({
	eyebrow,
	title,
	action,
	actionHref = '#',
}: {
	eyebrow: string;
	title: string;
	action?: string;
	actionHref?: string;
}) {
	return (
		<div className="section-head">
			<div>
				<p className="section-head__eyebrow">{eyebrow}</p>
				<h2>{title}</h2>
			</div>
			{action ? (
				<Button to={actionHref} variant="ghost" className="section-head__action">
					{action}
				</Button>
			) : null}
		</div>
	);
}

function formatSalary(min?: number | null, max?: number | null) {
	if (min == null && max == null) return 'Salary not listed';
	if (min != null && max != null) return `RWF ${min.toLocaleString()} - ${max.toLocaleString()}`;
	if (min != null) return `From RWF ${min.toLocaleString()}`;
	return `Up to RWF ${max?.toLocaleString()}`;
}

function formatLocation(location?: string | null) {
	return location?.trim() ? location : 'Remote';
}

export function Dashboard() {
	const { user, isAuthenticated } = useAuth();
	const [jobs, setJobs] = useState<JobSummary[]>([]);
	const [courses, setCourses] = useState<BackendCourse[]>([]);
	const [applications, setApplications] = useState<JobApplication[]>([]);
	const [certificates, setCertificates] = useState<LearnerCertificate[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let active = true;

		Promise.all([getJobs(), getCourses(), getApplications(), getMyCertificates()])
			.then(([jobsResponse, courseItems, applicationItems, certificateItems]) => {
				if (!active) return;
				setJobs(jobsResponse?.jobs ?? []);
				setCourses(courseItems ?? []);
				setApplications(applicationItems ?? []);
				setCertificates(certificateItems ?? []);
			})
			.catch((error) => {
				console.error('Failed to load dashboard data', error);
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		return () => {
			active = false;
		};
	}, []);

	const displayName = user?.name?.trim() || 'there';
	const roleLabel = user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'Learner';

	const recentCourses = useMemo<DashboardCourse[]>(() => {
		return courses.slice(0, 3).map((course) => ({
			id: course.id,
			title: course.title,
			provider: course.institution?.name ?? 'Hanga Works',
			enrollments: course._count?.enrollments ?? 0,
			modules: course._count?.modules ?? course.modules?.length ?? 0,
			description: course.description,
		}));
	}, [courses]);

	const recommendedJobs = useMemo(() => {
		return [...jobs]
			.sort((left, right) => (right.matchScore ?? 0) - (left.matchScore ?? 0) || (right._count?.applications ?? 0) - (left._count?.applications ?? 0))
			.slice(0, 3);
	}, [jobs]);

	const recentApplications = useMemo(() => applications.slice(0, 4), [applications]);
	const continueLearningCourse = recentCourses[0] ?? null;

	const skillCounts = useMemo(() => {
		const counts = new Map<string, number>();
		[...jobs.flatMap((job) => job.skills ?? []), ...courses.flatMap((course) => course.skills ?? [])].forEach((entry) => {
			counts.set(entry.skill.name, (counts.get(entry.skill.name) ?? 0) + 1);
		});
		return Array.from(counts.entries())
			.sort((left, right) => right[1] - left[1])
			.slice(0, 5)
			.map(([name, count]) => ({ name, count }));
	}, [courses, jobs]);

	const progressValue = useMemo(() => {
		const applicationScore = Math.min(40, applications.length * 8);
		const certificateScore = Math.min(30, certificates.length * 15);
		const learningScore = Math.min(30, courses.length * 6);
		return applicationScore + certificateScore + learningScore;
	}, [applications.length, certificates.length, courses.length]);

	const progressCards = useMemo(() => [
		{ title: 'Profile completion', value: Math.min(100, progressValue), meta: 'Based on applications, certificates, and learning activity.' },
		{ title: 'Applications in review', value: applications.filter((item) => item.status === 'REVIEWING' || item.status === 'SHORTLISTED').length, meta: 'Live pipeline statuses from the backend.' },
		{ title: 'Verified certificates', value: certificates.length, meta: 'Digital certificates available on your profile.' },
	], [applications, certificates.length, progressValue]);

	const applicationStages = useMemo(() => {
		return ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED', 'REJECTED'].map((stage) => ({
			stage,
			count: applications.filter((item) => item.status === stage).length,
		}));
	}, [applications]);

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return (
		<SiteLayout>
			<div className="dashboard-shell" id="dashboard-home">
				<aside className="dashboard-sidebar">
					<Card className="dashboard-sidebar__panel">
						<CardEyebrow>Learning path</CardEyebrow>
						<CardTitle>Continue learning</CardTitle>
						<CardMeta>
							Pick up where you left off or jump into the newest published course from the catalog.
						</CardMeta>
						{continueLearningCourse ? (
							<>
								<p className="dashboard-sidebar__course">{continueLearningCourse.title}</p>
								<CardMeta>{continueLearningCourse.provider}</CardMeta>
								<Button to={`/courses/${continueLearningCourse.id}`} variant="primary">Continue learning</Button>
							</>
						) : (
							<Button to="/courses" variant="primary">Browse courses</Button>
						)}
					</Card>

					<Card className="dashboard-sidebar__panel">
						<CardEyebrow>Quick links</CardEyebrow>
						<CardTitle>Shortcuts</CardTitle>
						<div className="dashboard-sidebar__links">
							<Button to="/jobs" variant="ghost">Find jobs</Button>
							<Button to="/courses" variant="ghost">Learning catalog</Button>
							<Button to="/applications" variant="ghost">Applications</Button>
							<Button to="/profile" variant="ghost">Profile</Button>
						</div>
					</Card>

					<Card className="dashboard-sidebar__panel">
						<CardEyebrow>Progress</CardEyebrow>
						<CardTitle>At a glance</CardTitle>
						<div className="dashboard-trend-list">
							<div className="dashboard-trend-row"><span>Jobs</span><strong>{jobs.length}</strong></div>
							<div className="dashboard-trend-row"><span>Courses</span><strong>{courses.length}</strong></div>
							<div className="dashboard-trend-row"><span>Certificates</span><strong>{certificates.length}</strong></div>
						</div>
					</Card>
				</aside>

				<main className="dashboard-main">
				<section className="dashboard-hero card card--hero">
					<div className="dashboard-hero__copy">
						<CardEyebrow>{roleLabel} dashboard</CardEyebrow>
						<CardTitle>Welcome back, {displayName}</CardTitle>
						<CardMeta>
							This workspace is personalized to your account and reflects the SRS flow: Learn, Certify, Match, and Employ.
						</CardMeta>
					</div>

					<div className="dashboard-hero__stats">
						<div className="hero-stat" id="applications">
							<span>Open applications</span>
							<strong>{loading ? '...' : applications.length}</strong>
							<p>From the live applications endpoint.</p>
						</div>
						<div className="hero-stat" id="notifications">
							<span>Published courses</span>
							<strong>{loading ? '...' : courses.length}</strong>
							<p>Directly fetched from the course catalog.</p>
						</div>
					</div>
				</section>

				<section className="dashboard-section" id="progress-overview">
					<DashboardSectionTitle eyebrow="Progress" title="Your current momentum" />
					<div className="progress-grid">
						{progressCards.map((card) => (
							<Card key={card.title} className="progress-card">
								<CardEyebrow>{card.title}</CardEyebrow>
								<div className="progress-card__value">{card.value}</div>
								<ProgressBar value={card.value} />
								<CardMeta>{card.meta}</CardMeta>
							</Card>
						))}
					</div>
				</section>

				<section className="dashboard-section dashboard-section--wide" id="recommended-jobs">
					<DashboardSectionTitle eyebrow="Jobs" title="Recommended jobs" action="View all jobs" actionHref="/jobs" />
					<div className="job-grid">
						{recommendedJobs.map((job) => (
							<Card key={job.id} className="job-card">
								<div className="job-card__top">
									<div>
										<CardEyebrow>{job.employer.name}</CardEyebrow>
										<CardTitle><Link to={`/jobs/${job.id}`}>{job.title}</Link></CardTitle>
									</div>
									<div className="job-card__match">{job.matchScore ?? job._count?.applications ?? 0}% match</div>
								</div>
								<CardMeta>{formatLocation(job.location)} · {job.jobType.replace('_', ' ')}</CardMeta>
								<CardMeta>{formatSalary(job.salaryMin, job.salaryMax)}</CardMeta>
								<p className="job-card__description">{job.description}</p>
								<div className="job-card__tags">
									{job.skills?.slice(0, 3).map((skill) => (
										<span key={skill.id}>{skill.skill.name}</span>
									))}
								</div>
								<div className="job-card__actions">
									<Button to={`/jobs/${job.id}`} variant="secondary">Save</Button>
									<Button to={`/jobs/${job.id}`} variant="primary">Open</Button>
								</div>
							</Card>
						))}
					</div>
				</section>

				<section className="dashboard-section" id="recent-courses">
					<DashboardSectionTitle eyebrow="Learning" title="Recent courses" action="Browse all courses" actionHref="/courses" />
					<div className="course-stack">
						{recentCourses.map((course) => (
							<Card key={course.id} className="course-card">
								<div className="course-card__top">
									<div>
										<CardEyebrow>{course.provider}</CardEyebrow>
										<CardTitle>
											<Link to={`/courses/${course.id}`}>{course.title}</Link>
										</CardTitle>
									</div>
									<strong>{course.modules} modules</strong>
								</div>
								<CardMeta>{course.description}</CardMeta>
								<CardMeta>{course.enrollments} enrollments</CardMeta>
								<div className="course-card__actions">
									<Button to={`/courses/${course.id}`} variant="ghost">Continue</Button>
								</div>
							</Card>
						))}
					</div>
				</section>

				<section className="dashboard-section dashboard-section--split" id="messages">
					<Card className="info-card">
						<CardEyebrow>Certification</CardEyebrow>
						<CardTitle>Verified credentials</CardTitle>
						<CardMeta>{certificates.length} certificate{certificates.length === 1 ? '' : 's'} available on your account.</CardMeta>
						{certificates.length > 0 ? (
							<div className="list-stack">
								{certificates.slice(0, 3).map((certificate) => (
									<div key={certificate.id} className="list-item">
										<div>
											<strong>{certificate.courseTitle}</strong>
											<div className="muted">Issued {new Date(certificate.issuedAt).toLocaleDateString()}</div>
										</div>
										<Button to={certificate.verifyUrl} variant="ghost">Verify</Button>
									</div>
								))}
							</div>
						) : (
							<CardMeta>Complete a course to generate your first verifiable certificate.</CardMeta>
						)}
					</Card>
					<Card className="info-card" id="settings">
						<CardEyebrow>Career intelligence</CardEyebrow>
						<CardTitle>Skill signals and application stages</CardTitle>
						<CardMeta>These summaries reflect the backend data available to your profile and job search flow.</CardMeta>
						<div className="dashboard-trend-list">
							{skillCounts.slice(0, 5).map((skill) => (
								<div key={skill.name} className="dashboard-trend-row">
									<span>{skill.name}</span>
									<strong>{skill.count}</strong>
								</div>
							))}
						</div>
						<div className="dashboard-application-stages">
							{applicationStages.map((stage) => (
								<div key={stage.stage} className="hero-stat">
									<span>{stage.stage.toLowerCase()}</span>
									<strong>{stage.count}</strong>
									<p>Application pipeline status.</p>
								</div>
							))}
						</div>
					</Card>
				</section>

				<section className="dashboard-section" id="applications">
					<DashboardSectionTitle eyebrow="Applications" title="Recent applications" action="View all applications" actionHref="/applications" />
					<div className="list-stack">
						{recentApplications.length === 0 ? (
							<Card className="info-card">
								<CardTitle>No applications yet</CardTitle>
								<CardMeta>Apply to jobs from the marketplace to start tracking application progress here.</CardMeta>
							</Card>
						) : recentApplications.map((application) => (
							<div key={application.id} className="list-item">
								<div>
									<strong>{application.job.title}</strong>
									<div className="muted">{application.job.employer.name} · {formatLocation(application.job.location)}</div>
								</div>
								<div>
									<CardEyebrow>{application.status.toLowerCase()}</CardEyebrow>
									<div className="muted">Applied {new Date(application.appliedAt).toLocaleDateString()}</div>
								</div>
							</div>
						))}
					</div>
				</section>
				</main>
			</div>
		</SiteLayout>
	);
}