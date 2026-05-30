import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
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
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<JobFilterState>({
		search: '',
		location: '',
		jobType: 'ALL',
		remoteOnly: false,
	});

	// pagination + sorting
	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(12);
	const [sortBy, setSortBy] = useState<'newest' | 'relevance' | 'salary-desc' | 'salary-asc'>('newest');
	const [totalResults, setTotalResults] = useState(0);

	useEffect(() => {
		let active = true;
		setLoading(true);
		setError(null);

		getJobs({
			search: filters.search,
			location: filters.location,
			jobType: filters.jobType === 'ALL' ? undefined : filters.jobType,
			page,
			perPage,
		})
			.then((resp) => {
				if (!active) return;
				setJobs(resp.jobs ?? []);
				setTotalResults(resp.total ?? (resp.jobs?.length ?? 0));
			})
			.catch((err) => {
				console.error('Failed to load jobs', err);
				if (active) {
					setJobs([]);
					setError((err && (err.message || String(err))) || 'Unable to reach the jobs API.');
				}
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		return () => {
			active = false;
		};
	}, [filters.search, filters.location, filters.jobType, filters.remoteOnly, page, perPage]);

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
			const matchesRemote = !filters.remoteOnly || job.jobType === 'REMOTE';

			return matchesQuery && matchesLocation && matchesType && matchesRemote;
		});
	}, [filters.search, filters.location, filters.jobType, filters.remoteOnly, jobs]);

	// sorting
	const sortedJobs = useMemo(() => {
		const copy = [...filteredJobs];
		switch (sortBy) {
			case 'salary-desc':
				return copy.sort((a, b) => (b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0));
			case 'salary-asc':
				return copy.sort((a, b) => (a.salaryMin ?? 0) - (b.salaryMin ?? 0));
			case 'relevance':
				return copy.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
			case 'newest':
			default:
				return copy.sort((a, b) => {
					const da = a.postedAt ? Date.parse(a.postedAt) : 0;
					const db = b.postedAt ? Date.parse(b.postedAt) : 0;
					return db - da;
				});
		}
	}, [filteredJobs, sortBy]);

	// pagination (server provides paginated results; `jobs` is the current page)
	const totalPages = Math.max(1, Math.ceil(totalResults / perPage));
	const paginatedJobs = useMemo(() => sortedJobs, [sortedJobs]);

	return (
		<SiteLayout>
			<section className="job-market-page">
				<header className="job-market-hero card no-stats">
					<div>
						<p className="section-head__eyebrow">Job marketplace</p>
						<h2>Explore roles that fit your next move</h2>
						<p className="card-meta">Search by title, employer, location, or role type. Open each posting for branding, details, and one-click apply.</p>
					</div>
					{/* hero stats removed per request */}
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
					<div className="job-market-controls">
						<div className="job-market-counts">Showing {Math.min((page - 1) * perPage + 1, totalResults)}-{Math.min(page * perPage, totalResults)} of {totalResults} jobs</div>
						<div className="job-market-sorting">
							<label>
								Sort by
								<select value={sortBy} onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}>
									<option value="newest">Newest</option>
									<option value="relevance">Relevance</option>
									<option value="salary-desc">Salary (high → low)</option>
									<option value="salary-asc">Salary (low → high)</option>
								</select>
							</label>
							<label>
								Per page
								<select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
									<option value={6}>6</option>
									<option value={12}>12</option>
									<option value={24}>24</option>
								</select>
							</label>
						</div>
					</div>
					{loading ? (
						<Card className="courses-empty">
							<CardTitle>Loading jobs</CardTitle>
							<CardMeta>Fetching the latest openings — please wait. If this takes too long, check your connection or try again.</CardMeta>
						</Card>
					) : null}

					{error ? (
						<Card className="courses-empty">
							<CardTitle>Unable to load jobs</CardTitle>
							<CardMeta>{error}. Try refreshing the page or adjusting your filters.</CardMeta>
						</Card>
					) : null}

					{!loading && !error && totalResults === 0 ? (
						<Card className="courses-empty">
							<CardTitle>No jobs match your filters</CardTitle>
							<CardMeta>Try a broader keyword, clear filters, or remove the location to see more openings.</CardMeta>
						</Card>
					) : null}
					<div className="job-grid">
						{paginatedJobs.map((job) => (
							<Card key={job.id} className="job-card job-card--marketplace">
								<div className="job-card__top">
									<div className="job-card__avatar">
										<div className="avatar avatar-sm" aria-hidden>
											{job.employer.name.split(' ').map((p) => p[0]).join('').slice(0,2).toUpperCase()}
										</div>
									</div>
									<div className="job-card__titlewrap">
										<CardEyebrow>{job.employer.name}</CardEyebrow>
										<CardTitle><Link to={`/jobs/${job.id}`}>{job.title}</Link></CardTitle>
									</div>
									<div className="job-card__match">{job.jobType.replace('_', ' ')}</div>
								</div>

								<CardMeta>
									<span className="job-card__metaitem">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
											<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
											<circle cx="12" cy="9" r="2.2" fill="currentColor" />
										</svg>
										{job.location ?? 'Remote friendly'}
									</span>
									<span className="job-card__metaitem">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
											<path d="M12 1v22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
											<path d="M6 6h12v6H6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
										{formatSalary(job.salaryMin, job.salaryMax)}
									</span>
								</CardMeta>

								{job.skills && job.skills.length ? (
									<div className="job-card__tags">
										{job.skills.slice(0,6).map((js) => (
											<span key={js.id} title={js.skill.name} className="job-tag">
												<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
													<path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
													<path d="M12 5v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
												</svg>
												{js.skill.name}
											</span>
										))}
									</div>
								) : null}

								<p className="job-card__description">{job.description}</p>
								<div className="job-card__actions">
									<Button to={`/jobs/${job.id}`} variant="secondary">Open details</Button>
									<Button to={`/jobs/${job.id}`} variant="primary">Apply now</Button>
								</div>
							</Card>
						))}
					</div>
					{totalResults > perPage && (
						<div className="job-market-pagination">
							<button className="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
							<div className="pagination-pages">Page {page} / {totalPages}</div>
							<button className="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
						</div>
					)}
				</section>
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
