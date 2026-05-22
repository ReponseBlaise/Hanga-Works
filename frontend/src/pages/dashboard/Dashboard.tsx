import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { ProgressBar } from '../../components/shared/ProgressBar';
import { courses } from '../../data/courses';

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

const recentCourses = courses
	.filter((course) => course.enrolled && course.progress < 100)
	.slice(0, 3)
	.map((course) => ({
		id: course.id,
		title: course.title,
		provider: course.provider,
		progress: course.progress,
		lesson: `Next lesson: ${course.modules.find((m) => !m.completed)?.title ?? 'course complete'}`,
	}));

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
						<strong>14</strong>
						<p>3 moved to interview stage this week.</p>
					</div>
					<div className="hero-stat" id="notifications">
						<span>New alerts</span>
						<strong>4</strong>
						<p>Fresh messages from hiring managers and coaches.</p>
					</div>
				</div>
			</section>

			<section className="dashboard-section" id="progress-overview">
				<DashboardSectionTitle eyebrow="Progress" title="Your current momentum" />
				<div className="progress-grid">
					{progressCards.map((card) => (
						<Card key={card.title} className="progress-card">
							<CardEyebrow>{card.title}</CardEyebrow>
							<div className="progress-card__value">{card.value}%</div>
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
						<Card key={`${job.role}-${job.company}`} className="job-card">
							<div className="job-card__top">
								<div>
									<CardEyebrow>{job.company}</CardEyebrow>
									<CardTitle>{job.role}</CardTitle>
								</div>
								<div className="job-card__match">{job.match}% match</div>
							</div>
							<CardMeta>
								{job.location} · {job.salary}
							</CardMeta>
							<div className="job-card__tags">
								{job.tags.map((tag) => (
									<span key={tag}>{tag}</span>
								))}
							</div>
							<div className="job-card__actions">
								<Button href="#" variant="secondary">Save</Button>
								<Button href="#" variant="primary">Apply now</Button>
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
								<strong>{course.progress}%</strong>
							</div>
							<ProgressBar value={course.progress} />
							<CardMeta>{course.lesson}</CardMeta>
							<div className="course-card__actions">
								<Button to={`/courses/${course.id}`} variant="ghost">Continue</Button>
							</div>
						</Card>
					))}
				</div>
			</section>

			<section className="dashboard-section dashboard-section--split" id="messages">
				<Card className="info-card">
					<CardEyebrow>Messages</CardEyebrow>
					<CardTitle>Hiring manager follow-ups</CardTitle>
					<CardMeta>2 interviews need a reply before Friday.</CardMeta>
				</Card>
				<Card className="info-card" id="settings">
					<CardEyebrow>Settings</CardEyebrow>
					<CardTitle>Notification preferences</CardTitle>
					<CardMeta>Choose how often you want updates from jobs and courses.</CardMeta>
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
