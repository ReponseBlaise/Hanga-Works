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

	// additional filters
	const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
	const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
	const [salaryMin, setSalaryMin] = useState<number | undefined>(undefined);
	const [salaryMax, setSalaryMax] = useState<number | undefined>(undefined);

	// pagination + sorting
	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(12);
	const [sortBy, setSortBy] = useState<'newest' | 'relevance' | 'salary-desc' | 'salary-asc'>('newest');
	const [totalResults, setTotalResults] = useState(0);

	useEffect(() => {
		let active = true;
		setLoading(true);

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

			// industry filter (best-effort: match industry label in description)
			const matchesIndustry =
				selectedIndustries.length === 0 ||
				selectedIndustries.some((ind) => (job.description ?? '').toLowerCase().includes(ind.toLowerCase()));

			// keyword filter: any selected keyword contained in title/description/employer
			const matchesKeywords =
				selectedKeywords.length === 0 ||
				selectedKeywords.some((kw) => {
					const k = kw.toLowerCase();
					return (
						job.title.toLowerCase().includes(k) ||
						job.description.toLowerCase().includes(k) ||
						job.employer.name.toLowerCase().includes(k)
					);
				});

			// salary filter (best-effort using min/max bounds)
			const salaryOk = (() => {
				if (!salaryMin && !salaryMax) return true;
				const min = job.salaryMin ?? 0;
				const max = job.salaryMax ?? min;
				if (salaryMin && max < salaryMin) return false;
				if (salaryMax && min > salaryMax) return false;
				return true;
			})();

			return matchesQuery && matchesLocation && matchesType && matchesRemote;
		});
	}, [filters, jobs]);

	// apply additional filters
	const fullyFilteredJobs = useMemo(() => {
		return filteredJobs.filter((job) => {
			const industryOk = selectedIndustries.length === 0 || selectedIndustries.some((ind) => (job.description ?? '').toLowerCase().includes(ind.toLowerCase()));
			const keywordsOk = selectedKeywords.length === 0 || selectedKeywords.some((kw) => {
				const k = kw.toLowerCase();
				return job.title.toLowerCase().includes(k) || job.description.toLowerCase().includes(k) || job.employer.name.toLowerCase().includes(k);
			});
			const salaryOk = (() => {
				if (!salaryMin && !salaryMax) return true;
				const min = job.salaryMin ?? 0;
				const max = job.salaryMax ?? min;
				if (salaryMin && max < salaryMin) return false;
				if (salaryMax && min > salaryMax) return false;
				return true;
			})();
			return industryOk && keywordsOk && salaryOk;
		});
	}, [filteredJobs, selectedIndustries, selectedKeywords, salaryMin, salaryMax]);

	// sorting
	const sortedJobs = useMemo(() => {
		const copy = [...fullyFilteredJobs];
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
	}, [fullyFilteredJobs, sortBy]);

	// pagination (server provides paginated results; `jobs` is the current page)
	const totalPages = Math.max(1, Math.ceil(totalResults / perPage));
	const paginatedJobs = useMemo(() => sortedJobs, [sortedJobs]);

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

				{/* Main body: left filter column + results grid */}
				<div className="job-market-body">
					<aside className="advance-filter card">
						<h3>Advance Filter</h3>
						<button className="button button-ghost" onClick={() => {
							setFilters({ search: '', location: '', jobType: 'ALL', remoteOnly: false });
						}}>Reset</button>
						<div className="filter-section">
							<label>Location</label>
							<input value={filters.location} onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))} placeholder="New York, US" />
						</div>

						<div className="filter-section">
							<p className="filter-section__title">Industry</p>
							<div className="filter-checkbox-list">
								<label><input type="checkbox" /> All</label>
								<label><input type="checkbox" /> Software</label>
								<label><input type="checkbox" /> Finance</label>
								<label><input type="checkbox" /> Recruiting</label>
							</div>
						</div>

						<div className="filter-section">
							<label>Salary Range</label>
							<div className="salary-range">
								<input type="number" placeholder="$0" />
								<input type="number" placeholder="$500" />
							</div>
						</div>

						<div className="filter-section">
							<p className="filter-section__title">Popular Keyword</p>
							<div className="filter-checkbox-list">
								<label><input type="checkbox" /> Software</label>
								<label><input type="checkbox" /> Developer</label>
								<label><input type="checkbox" /> Web</label>
							</div>
						</div>

						<div className="filter-section">
							<p className="filter-section__title">Position</p>
							<label><input type="radio" name="position" /> Senior</label>
							<label><input type="radio" name="position" /> Junior</label>
							<label><input type="radio" name="position" /> Fresher</label>
						</div>

						<div className="filter-section">
							<p className="filter-section__title">Experience Level</p>
							<label><input type="checkbox" /> Internship</label>
							<label><input type="checkbox" /> Entry Level</label>
							<label><input type="checkbox" /> Mid Level</label>
						</div>

						<div className="filter-section">
							<label><input type="checkbox" checked={filters.remoteOnly} onChange={(e) => setFilters((p) => ({ ...p, remoteOnly: e.target.checked }))} /> Onsite/Remote: Remote only</label>
						</div>
					</aside>

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
						{loading ? <p>Loading jobs…</p> : null}
						{!loading && totalResults === 0 ? (
						<Card className="courses-empty">
							<CardTitle>No jobs match your filters</CardTitle>
							<CardMeta>Broaden your search or clear a filter to view more openings.</CardMeta>
						</Card>
						) : null}
						<div className="job-grid">
							{paginatedJobs.map((job) => (
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
						{/* pagination controls */}
						{totalResults > perPage && (
							<div className="job-market-pagination">
								<button className="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
								<div className="pagination-pages">Page {page} / {totalPages}</div>
								<button className="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
							</div>
						)}
					</section>
					</div>
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
