import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getJobs, type JobSummary } from '../../services/jobs.service';
import { getCourses, type BackendCourse } from '../../services/courses.service';

function formatSalary(min?: number | null, max?: number | null) {
  if (min == null && max == null) return 'Salary not listed';
  if (min != null && max != null) return `RWF ${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (min != null) return `From RWF ${min.toLocaleString()}`;
  return `Up to RWF ${max?.toLocaleString()}`;
}

function formatLocation(location?: string | null) {
  return location?.trim() ? location : 'Remote';
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [roleType, setRoleType] = useState('ALL');

  useEffect(() => {
    let active = true;
    Promise.all([getJobs(), getCourses()])
      .then(([jobResult, courseItems]) => {
        if (!active) return;
        setJobs(jobResult.jobs.slice(0, 6));
        setCourses(courseItems.slice(0, 6));
      })
      .catch((error) => console.error('Failed to load home data', error));

    return () => {
      active = false;
    };
  }, []);

  const featuredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const locationQuery = location.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesQuery =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.employer.name.toLowerCase().includes(query) ||
        (job.skills ?? []).some((skill) => skill.skill.name.toLowerCase().includes(query));
      const matchesLocation = !locationQuery || formatLocation(job.location).toLowerCase().includes(locationQuery);
      const matchesType = roleType === 'ALL' || job.jobType === roleType;
      return matchesQuery && matchesLocation && matchesType;
    });
  }, [jobs, location, roleType, search]);

  const topSkills = useMemo(() => {
    const counts = new Map<string, number>();
    [...jobs.flatMap((job) => job.skills ?? []), ...courses.flatMap((course) => course.skills ?? [])].forEach((item) => {
      counts.set(item.skill.name, (counts.get(item.skill.name) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name, count]) => ({ name, count }));
  }, [courses, jobs]);

  const stats = [
    { label: 'Live jobs', value: jobs.length },
    { label: 'Courses', value: courses.length },
    { label: 'Skills tracked', value: topSkills.length },
  ];

  return (
    <SiteLayout>
      <section className="dashboard-page">
        <section className="dashboard-hero card card--hero">
          <div className="dashboard-hero__copy">
            <p className="eyebrow">Talent and learning platform</p>
            <h1 className="display-large">Find work, build skills, and move faster in one workspace.</h1>
            <p className="dashboard-hero__lead">
              Hanga Works connects live jobs, active courses, and hiring workflows in a layout built for serious learners, recruiters, and institutions.
            </p>
            <div className="dashboard-hero__actions">
              <Button to={isAuthenticated ? '/jobs' : '/register'} variant="primary" className="button--lg button--pill">
                {isAuthenticated ? 'Browse jobs' : 'Create account'}
              </Button>
              <Button to="/login" variant="secondary" className="button--lg">Sign in</Button>
            </div>
            <div className="dashboard-hero__metrics">
              {stats.map((item) => (
                <div key={item.label} className="dashboard-metric">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p className="muted">Loaded live from the backend.</p>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-hero__visual">
            <Card className="dashboard-panel">
              <CardEyebrow>Smart search</CardEyebrow>
              <CardTitle>Search jobs and courses together</CardTitle>
              <div className="form-stack">
                <label>Keyword<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Frontend, analytics, mentorship..." /></label>
                <label>Location<input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kigali, remote..." /></label>
                <label>Role type<select value={roleType} onChange={(e) => setRoleType(e.target.value)}><option value="ALL">All roles</option><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option><option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="INTERNSHIP">Internship</option><option value="FREELANCE">Freelance</option></select></label>
              </div>
              <div className="dashboard-card__actions">
                <Button to="#featured-jobs" variant="primary">Find jobs</Button>
                <Button to="#courses" variant="secondary">View courses</Button>
              </div>
            </Card>
            <Card className="dashboard-panel">
              <CardEyebrow>Top skills</CardEyebrow>
              <CardTitle>Most common across live data</CardTitle>
              <div className="dashboard-summary__grid">
                {topSkills.map((skill) => (
                  <div key={skill.name} className="dashboard-summary__stat">
                    <span>{skill.name}</span>
                    <strong>{skill.count}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <div className="dashboard-layout">
          <main className="dashboard-main-column">
            <section className="dashboard-section" id="featured-jobs">
              <div className="dashboard-section__head">
                <div><p className="eyebrow">Jobs</p><h2>Featured roles</h2></div>
                <Button to="/jobs" variant="ghost" className="dashboard-section__action">View all jobs</Button>
              </div>
              <div className="dashboard-card-grid dashboard-card-grid--wide">
                {featuredJobs.length === 0 ? (
                  <Card className="dashboard-panel"><CardTitle>No jobs match this filter</CardTitle><CardMeta>Adjust the fields in the search card to uncover more live openings.</CardMeta></Card>
                ) : (
                  featuredJobs.map((job) => (
                    <Card key={job.id} className="dashboard-card">
                      <div className="dashboard-card__top">
                        <div>
                          <CardEyebrow>{job.employer.name}</CardEyebrow>
                          <div className="dashboard-card__title"><Link to={`/jobs/${job.id}`}>{job.title}</Link></div>
                        </div>
                        <div className="job-card__match">{job.jobType.replace('_', ' ')}</div>
                      </div>
                      <CardMeta>{formatLocation(job.location)}</CardMeta>
                      <CardMeta>{formatSalary(job.salaryMin, job.salaryMax)}</CardMeta>
                      <p className="dashboard-card__meta">{job.description}</p>
                      <div className="dashboard-card__tags">
                        {(job.skills ?? []).slice(0, 3).map((skill) => <span key={skill.id} className="dashboard-chip">{skill.skill.name}</span>)}
                      </div>
                      <div className="dashboard-card__actions">
                        <Button to={`/jobs/${job.id}`} variant="secondary">Open details</Button>
                        <Button to={`/jobs/${job.id}`} variant="primary" className="button--lg button--pill">Apply now</Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </section>

            <section className="dashboard-section" id="courses">
              <div className="dashboard-section__head">
                <div><p className="eyebrow">Learning</p><h2>Recently published courses</h2></div>
                <Button to="/courses" variant="ghost" className="dashboard-section__action">Browse courses</Button>
              </div>
              <div className="dashboard-card-grid">
                {courses.map((course) => (
                  <Card key={course.id} className="dashboard-card">
                    <CardEyebrow>{course.institution?.name ?? 'Hanga Works'}</CardEyebrow>
                    <div className="dashboard-card__title"><Link to={`/courses/${course.id}`}>{course.title}</Link></div>
                    <CardMeta>{course.description}</CardMeta>
                    <div className="dashboard-card__actions">
                      <Button to={`/courses/${course.id}`} variant="ghost">Open course</Button>
                      <Button to={`/courses/${course.id}`} variant="primary">Start course</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </main>

          <aside className="dashboard-rail dashboard-rail--right">
            <Card className="dashboard-panel">
              <CardEyebrow>Quick actions</CardEyebrow>
              <CardTitle>Move faster</CardTitle>
              <div className="dashboard-panel__actions">
                <Button to="/login" variant="secondary">Sign in</Button>
                <Button to="/jobs" variant="ghost">Search jobs</Button>
                <Button to="/courses" variant="ghost">Explore courses</Button>
                <Button to="/register" variant="ghost">Create account</Button>
              </div>
            </Card>
            <Card className="dashboard-panel">
              <CardEyebrow>Why it works</CardEyebrow>
              <CardTitle>Designed for trust</CardTitle>
              <div className="dashboard-list">
                <div className="dashboard-list__item"><div><strong>Unified state</strong><div className="dashboard-list__meta">Jobs, learning, and profiles remain connected.</div></div></div>
                <div className="dashboard-list__item"><div><strong>Live data</strong><div className="dashboard-list__meta">Every card uses the backend feed.</div></div></div>
                <div className="dashboard-list__item"><div><strong>Clear hierarchy</strong><div className="dashboard-list__meta">Primary actions stay visually dominant.</div></div></div>
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
