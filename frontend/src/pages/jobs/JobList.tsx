import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { getJobs, type JobSummary, type JobType } from '../../services/jobs.service';
import type { JobFilterState } from '../../types/job.types';

const filterOptions: Array<{ label: string; value: JobFilterState['jobType'] }> = [
	{ label: 'All roles', value: 'ALL' },
	{ label: 'Full time', value: 'FULL_TIME' },
	{ label: 'Part time', value: 'PART_TIME' },
	{ label: 'Remote', value: 'REMOTE' },
	{ label: 'Hybrid', value: 'HYBRID' },
	{ label: 'Internship', value: 'INTERNSHIP' },
	{ label: 'Freelance', value: 'FREELANCE' },
];

export default function JobList() {
	const [jobs, setJobs] = useState<JobSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState<JobFilterState>({
		search: '',
		location: '',
		jobType: 'ALL',
		remoteOnly: false,
	});

	useEffect(() => {
		let active = true;
		setLoading(true);
		getJobs()
			.then((items) => {
				if (!active) return;
				setJobs(items ?? []);
			})
			.catch((error) => {
				console.error('Failed to load jobs', error);
				if (active) setJobs([]);
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		return () => {
			active = false;
		};
	}, []);

	const filteredJobs = useMemo(() => {
		const query = filters.search.trim().toLowerCase();
		const locationQuery = filters.location.trim().toLowerCase();
		return jobs.filter((job) => {
			const matchesQuery =
				!query ||
				job.title.toLowerCase().includes(query) ||
				job.description.toLowerCase().includes(query) ||
				job.employer.name.toLowerCase().includes(query);
			const matchesLocation = !locationQuery || (job.location ?? '').toLowerCase().includes(locationQuery);
			const matchesType = filters.jobType === 'ALL' || job.jobType === filters.jobType;
			const matchesRemote = !filters.remoteOnly || job.jobType === 'REMOTE' || job.remoteOnly;
			return matchesQuery && matchesLocation && matchesType && matchesRemote;
		});
	}, [filters, jobs]);

	return (
		<DashboardLayout>
			<section className="job-market-page">
				<header className="job-market-hero card">
					<div>
						<p className="section-head__eyebrow">Job marketplace</p>
						<h2>Explore roles that fit your next move</h2>
						<p className="card-meta">Search by title, employer, location, or role type. Open each posting for branding, details, and one-click apply.</p>
					</div>
					<div className="job-market-hero__stats">
						<div className="hero-stat">
							<span>Open roles</span>
							<strong>{jobs.length}</strong>
							<p>Loaded from the NestJS jobs endpoint.</p>
						</div>
						<div className="hero-stat">
							<span>Visible now</span>
							<strong>{filteredJobs.length}</strong>
							<p>Match your current filters.</p>
						</div>
					</div>
				</header>

				<section className="job-market-toolbar card">
					<label className="courses-search">
						<span className="courses-search__label">Search</span>
						<input value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} placeholder="Frontend, analytics, mentorship..." />
					</label>
					<label className="courses-search">
						<span className="courses-search__label">Location</span>
						<input value={filters.location} onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))} placeholder="Kigali, remote, hybrid..." />
					</label>
					<label className="courses-filter">
						<span>Role type</span>
						<select value={filters.jobType} onChange={(e) => setFilters((prev) => ({ ...prev, jobType: e.target.value as JobType | 'ALL' }))}>
							{filterOptions.map((option) => (
								<option key={option.value} value={option.value}>{option.label}</option>
							))}
						</select>
					</label>
					<label className="job-market-toolbar__toggle">
						<input type="checkbox" checked={filters.remoteOnly} onChange={(e) => setFilters((prev) => ({ ...prev, remoteOnly: e.target.checked }))} />
						<span>Remote only</span>
					</label>
				</section>

				<section className="job-market-results">
					{loading ? <p>Loading jobs…</p> : null}
					{!loading && filteredJobs.length === 0 ? (
						<Card className="courses-empty">
							<CardTitle>No jobs match your filters</CardTitle>
							<CardMeta>Broaden your search or clear a filter to view more openings.</CardMeta>
						</Card>
					) : null}
					<div className="job-grid">
						{filteredJobs.map((job) => (
							<Card key={job.id} className="job-card job-card--marketplace">
								<div className="job-card__top">
									<div>
										<CardEyebrow>{job.employer.name}</CardEyebrow>
										<CardTitle><Link to={`/jobs/${job.id}`}>{job.title}</Link></CardTitle>
									</div>
									<div className="job-card__match">{job.jobType.replace('_', ' ')}</div>
								</div>
								<CardMeta>{job.location ?? 'Remote friendly'} · {formatSalary(job.salaryMin, job.salaryMax)}</CardMeta>
								<p className="job-card__description">{job.description}</p>
								<div className="job-card__actions">
									<Button to={`/jobs/${job.id}`} variant="secondary">Open details</Button>
									<Button to={`/jobs/${job.id}`} variant="primary">Apply now</Button>
								</div>
							</Card>
						))}
					</div>
				</section>
			</section>
		</DashboardLayout>
	);
}

function formatSalary(min?: number | null, max?: number | null) {
	if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
	if (min) return `From $${min.toLocaleString()}`;
	if (max) return `Up to $${max.toLocaleString()}`;
	return 'Competitive salary';
}
