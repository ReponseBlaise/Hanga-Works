import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsFillGrid3X3GapFill, BsListUl } from 'react-icons/bs';
import { MdWork, MdLocationOn, MdAttachMoney, MdFilterList } from 'react-icons/md';
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
    salaryMin: '',
    salaryMax: '',
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [sortBy, setSortBy] = useState<'newest' | 'relevance' | 'salary-desc' | 'salary-asc'>('newest');
  const [totalResults, setTotalResults] = useState(0);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('hanga-saved-job-ids');
      if (!raw) return;
      const parsed = JSON.parse(raw) as string[];
      setSavedJobIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSavedJobIds([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('hanga-saved-job-ids', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getJobs({
      search: filters.search,
      location: filters.location,
      jobType: filters.jobType === 'ALL' ? undefined : filters.jobType,
      salaryMin: filters.salaryMin ? Number(filters.salaryMin) : undefined,
      salaryMax: filters.salaryMax ? Number(filters.salaryMax) : undefined,
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
  }, [filters.search, filters.location, filters.jobType, filters.remoteOnly, filters.salaryMin, filters.salaryMax, page, perPage]);
  

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
      const matchesSaved = !savedOnly || savedJobIds.includes(job.id);
      const minSalary = filters.salaryMin ? Number(filters.salaryMin) : null;
      const maxSalary = filters.salaryMax ? Number(filters.salaryMax) : null;
      const jobSalaryMin = job.salaryMin ?? null;
      const jobSalaryMax = job.salaryMax ?? null;
      const matchesSalary =
        (minSalary == null || (jobSalaryMax != null && jobSalaryMax >= minSalary) || (jobSalaryMin != null && jobSalaryMin >= minSalary)) &&
        (maxSalary == null || (jobSalaryMin != null && jobSalaryMin <= maxSalary) || (jobSalaryMax != null && jobSalaryMax <= maxSalary));
      return matchesQuery && matchesLocation && matchesType && matchesRemote && matchesSaved && matchesSalary;
    });
  }, [filters.search, filters.location, filters.jobType, filters.remoteOnly, jobs, savedOnly, savedJobIds]);

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

  const totalPages = Math.max(1, Math.ceil(totalResults / perPage));
  const paginatedJobs = useMemo(() => sortedJobs, [sortedJobs]);

  function toggleSaved(jobId: string) {
    setSavedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId],
    );
  }

  return (
    <SiteLayout>
      <section className="studio-jobs joblist-redesign" id="results">
          <header className="joblist-redesign__hero">
            <div 
              className="joblist-redesign__promo" 
              style={{ 
                backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 100%), url(/career-banner.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem 2rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div style={{ maxWidth: '600px' }}>
                <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>Career Marketplace</p>
                <h1 className="display" style={{ color: 'white', marginBottom: '1rem' }}>Find your next opportunity</h1>
                <p className="lead" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem' }}>Explore roles, save favorites, and apply when you are ready.</p>
                <Button to="/applications" variant="secondary">Track applications</Button>
              </div>
            </div>
            <div className="joblist-redesign__stats">
              <div><span>Results</span><strong>{totalResults}</strong></div>
              <div><span>Saved</span><strong>{savedJobIds.length}</strong></div>
              <div><span>Page</span><strong>{page}/{totalPages}</strong></div>
              <div><span>Sort</span><strong>{sortBy.replace('-', ' ')}</strong></div>
            </div>
          </header>

          <section className="joblist-redesign__layout">
            <aside className="studio-jobs__filters">
              <details className="studio-mobile-filters">
                <summary className="studio-mobile-filters__summary">
                  <span className="ui-icon" aria-hidden="true"><MdFilterList /></span> Filters & Search
                </summary>
                <div className="studio-mobile-filters__content">
                  <Card className="studio-block">
                    <CardEyebrow>Search filters</CardEyebrow>
                    <div className="form-stack">
                <label>
                  Search
                  <input
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    placeholder="Frontend, analytics, mentorship"
                  />
                </label>
                <label>
                  Location
                  <input
                    value={filters.location}
                    onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Kigali, remote, hybrid"
                  />
                </label>
                <label>
                  Role type
                  <select value={filters.jobType} onChange={(e) => setFilters((prev) => ({ ...prev, jobType: e.target.value as JobType | 'ALL' }))}>
                    {filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <div className="profile-form-grid">
                  <label>
                    Min salary
                    <input
                      type="number"
                      min="0"
                      value={filters.salaryMin}
                      onChange={(e) => setFilters((prev) => ({ ...prev, salaryMin: e.target.value }))}
                      placeholder="500000"
                    />
                  </label>
                  <label>
                    Max salary
                    <input
                      type="number"
                      min="0"
                      value={filters.salaryMax}
                      onChange={(e) => setFilters((prev) => ({ ...prev, salaryMax: e.target.value }))}
                      placeholder="1500000"
                    />
                  </label>
                </div>
                <label>
                  Sort by
                  <select value={sortBy} onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}>
                    <option value="newest">Newest</option>
                    <option value="relevance">Relevance</option>
                    <option value="salary-desc">Salary (high to low)</option>
                    <option value="salary-asc">Salary (low to high)</option>
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
                <label className="job-market-toolbar__toggle">
                  <input type="checkbox" checked={filters.remoteOnly} onChange={(e) => setFilters((prev) => ({ ...prev, remoteOnly: e.target.checked }))} />
                  <span>Remote only</span>
                </label>
                <label className="job-market-toolbar__toggle">
                  <input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} />
                  <span>Saved jobs only</span>
                </label>
              </div>
              <div className="studio-action-row">
                <Button type="button" variant="ghost" onClick={() => setFilters({ search: '', location: '', jobType: 'ALL', remoteOnly: false, salaryMin: '', salaryMax: '' })}>Reset filters</Button>
                <Button to="/applications" variant="secondary">My applications</Button>
              </div>
            </Card>
                </div>
              </details>
            </aside>

            <main className="studio-jobs__results">
              <div className="studio-catalog__toolbar">
                <div>
                  <p className="eyebrow">View options</p>
                  <h2>{paginatedJobs.length} roles in this view</h2>
                </div>
                <div className="studio-toggle-group" role="tablist" aria-label="Job list view mode">
                  <button
                    type="button"
                    className={`studio-toggle ${viewMode === 'grid' ? 'is-active' : ''}`.trim()}
                    onClick={() => setViewMode('grid')}
                  >
                    <span className="ui-icon" aria-hidden="true"><BsFillGrid3X3GapFill /></span> Grid
                  </button>
                  <button
                    type="button"
                    className={`studio-toggle ${viewMode === 'list' ? 'is-active' : ''}`.trim()}
                    onClick={() => setViewMode('list')}
                  >
                    <span className="ui-icon" aria-hidden="true"><BsListUl /></span> List
                  </button>
                </div>
              </div>

              {loading ? <Card className="studio-block"><CardTitle>Loading jobs</CardTitle><CardMeta>Fetching the latest openings.</CardMeta></Card> : null}
              {error ? <Card className="studio-block"><CardTitle>Unable to load jobs</CardTitle><CardMeta>{error}</CardMeta></Card> : null}
              {!loading && !error && paginatedJobs.length === 0 ? <Card className="studio-block"><CardTitle>No jobs match your filters</CardTitle><CardMeta>Try broader terms or disable saved-only mode.</CardMeta></Card> : null}

              <div className={viewMode === 'grid' ? 'joblist-redesign__cards' : 'joblist-redesign__cards joblist-redesign__cards--list'}>
                {paginatedJobs.map((job) => {
                  const isSaved = savedJobIds.includes(job.id);
                  return (
                    <Card key={job.id} className="studio-job-card joblist-redesign__card">
                      <div className="studio-job-card__head">
                        <div>
                          <CardEyebrow>{job.employer.name}</CardEyebrow>
                          <CardTitle><Link to={`/jobs/${job.id}`}>{job.title}</Link></CardTitle>
                        </div>
                        <span className="dashboard-chip"><span className="ui-icon" aria-hidden="true"><MdWork /></span>{job.jobType.replace('_', ' ')}</span>
                      </div>
                      <CardMeta><span className="ui-icon" aria-hidden="true"><MdLocationOn /></span>{job.location ?? 'Remote friendly'}</CardMeta>
                      <CardMeta><span className="ui-icon" aria-hidden="true"><MdAttachMoney /></span>{formatSalary(job.salaryMin, job.salaryMax)}</CardMeta>
                      <p className="muted">{job.description}</p>
                      <div className="studio-chip-row">
                        {(job.skills ?? []).slice(0, 6).map((js) => <span key={js.id} className="dashboard-chip">{js.skill.name}</span>)}
                      </div>
                      <div className="studio-action-row">
                        <Button type="button" variant="ghost" onClick={() => toggleSaved(job.id)}>{isSaved ? 'Unsave' : 'Save job'}</Button>
                        <Button to={`/jobs/${job.id}`} variant="secondary">View details</Button>
                        <Button to={`/jobs/${job.id}`} variant="primary" className="button--pill">Apply now</Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {totalResults > perPage ? (
                <div className="studio-pagination">
                  <button className="button button-secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                  <span className="muted">Page {page} / {totalPages}</span>
                  <button className="button button-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
                </div>
              ) : null}
            </main>
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
