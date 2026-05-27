import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { ProgressBar } from '../../components/shared/ProgressBar';
import { getJobs, type JobSummary } from '../../services/jobs.service';
import { getCourses, type BackendCourse } from '../../services/courses.service';

const progressCards = [
	{ title: 'Profile completion', value: 82, meta: '7 profile fields left to unlock premium matches.' },
	{ title: 'Applications in review', value: 64, meta: 'Hiring teams opened 9 of your 14 applications.' },
	{ title: 'Learning streak', value: 73, meta: 'You have completed 11 study sessions this month.' },
];

const recommendedJobs = [
	{
		role: 'Frontend Developer',
		company: 'Nexus Labs',
		location: 'Remote',
		salary: 'RWF 2.8M - 3.6M',
		tags: ['React', 'TypeScript', 'Design systems'],
		match: 96,
	},
	{
		role: 'Product Operations Associate',
		company: 'Kigali Growth Hub',
		location: 'Hybrid',
		salary: 'RWF 1.9M - 2.4M',
		tags: ['Operations', 'Analytics', 'Planning'],
		match: 89,
	},
	{
		role: 'Learning Experience Designer',
		company: 'SkillBridge Africa',
		location: 'Kigali',
		salary: 'RWF 2.3M - 2.9M',
		tags: ['Curriculum', 'Content', 'UX'],
		match: 84,
	},
];

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

function DashboardContent() {
	const [jobs, setJobs] = useState<JobSummary[]>([]);
	const [courses, setCourses] = useState<BackendCourse[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let active = true;

		Promise.all([getJobs(), getCourses()])
			.then(([jobItems, courseItems]) => {
				if (!active) return;
				setJobs(jobItems ?? []);
				setCourses(courseItems ?? []);
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

	const recentCourses = useMemo<DashboardCourse[]>(() => {
		return courses
			.slice(0, 3)
			.map((course) => ({
				id: course.id,
				title: course.title,
				provider: course.institution?.name ?? 'Hanga Works',
				enrollments: course._count?.enrollments ?? 0,
				modules: course._count?.modules ?? course.modules?.length ?? 0,
				description: course.description,
			}));
	}, [courses]);

	const recommendedJobs = useMemo(() => jobs.slice(0, 3), [jobs]);

	const progressCards = useMemo(() => [
		{ title: 'Open jobs', value: jobs.length, meta: 'Live listings pulled from the backend.' },
		{ title: 'Published courses', value: courses.length, meta: 'Learning content stored in the database.' },
		{ title: 'Available enrollments', value: courses.reduce((total, course) => total + (course._count?.enrollments ?? 0), 0), meta: 'Tracked from the LMS tables.' },
	], [courses, jobs]);

	return (
		<div className="dashboard-grid" id="dashboard-home">
			<section className="dashboard-hero card card--hero">
				<div className="dashboard-hero__copy">
					<CardEyebrow>Career momentum</CardEyebrow>
					<CardTitle>Track progress, find matches, and keep learning in one place.</CardTitle>
					<CardMeta>
						Your dashboard is tuned for quick action: review the strongest job matches, pick up where you left off in courses, and keep your profile moving.
					</CardMeta>
				</div>

				<div className="dashboard-hero__stats">
					<div className="hero-stat" id="applications">
						<span>Open applications</span>
						<strong>{loading ? '...' : jobs.reduce((sum, job) => sum + (job._count?.applications ?? 0), 0)}</strong>
						<p>Loaded from the live job marketplace.</p>
					</div>
					<div className="hero-stat" id="notifications">
						<span>Published courses</span>
						<strong>{loading ? '...' : courses.length}</strong>
						<p>Learning content is now database-backed.</p>
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
							<ProgressBar value={Math.min(100, card.value * 20)} />
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
									<CardTitle>{job.title}</CardTitle>
								</div>
								<div className="job-card__match">{job._count?.applications ?? 0} applicants</div>
							</div>
							<CardMeta>
								{job.location ?? 'Remote friendly'} · {job.jobType}
							</CardMeta>
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
					<CardEyebrow>Data source</CardEyebrow>
					<CardTitle>All dashboard data now comes from the backend</CardTitle>
					<CardMeta>Jobs and courses are fetched from the live API instead of static fixtures.</CardMeta>
				</Card>
				<Card className="info-card" id="settings">
					<CardEyebrow>Coverage</CardEyebrow>
					<CardTitle>Backend-connected sections</CardTitle>
					<CardMeta>Home, dashboard, jobs, and courses are all wired to database-backed data.</CardMeta>
				</Card>
			</section>
		</div>
	);
}

export function Dashboard() {
	return (
		<DashboardLayout>
			<DashboardContent />
		</DashboardLayout>
	);
}
