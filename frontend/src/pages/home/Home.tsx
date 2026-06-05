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
      <section className="studio-catalog" id="home">
        <section className="studio-hero">
          <div className="studio-hero__intro">
            <p className="eyebrow">Talent and learning platform</p>
            <h1 className="display-large">Find work, build skills, and move faster in one workspace.</h1>
            <p className="lead">
              Hanga Works connects live jobs, active courses, and hiring workflows in a layout built for serious learners, recruiters, and institutions.
            </p>
            <div className="studio-hero__actions">
              <Button to={isAuthenticated ? '/jobs' : '/register'} variant="primary" className="button--lg button--pill">
                {isAuthenticated ? 'Browse jobs' : 'Create account'}
              </Button>
              <Button to="/login" variant="secondary" className="button--lg">Sign in</Button>
            </div>
            <div className="studio-stat-grid mt-lg">
              {stats.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <Card className="studio-hero__spotlight">
            <CardEyebrow>Smart search</CardEyebrow>
            <CardTitle>Search jobs and courses</CardTitle>
            <div className="form-stack mt-md mb-md">
              <label>Keyword<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Frontend, analytics, mentorship..." /></label>
              <label>Location<input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kigali, remote..." /></label>
              <label>Role type<select value={roleType} onChange={(e) => setRoleType(e.target.value)}><option value="ALL">All roles</option><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option><option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="INTERNSHIP">Internship</option><option value="FREELANCE">Freelance</option></select></label>
            </div>
            <div className="studio-action-row">
              <Button to="#featured-jobs" variant="primary">Find jobs</Button>
              <Button to="#courses" variant="secondary">View courses</Button>
            </div>
          </Card>
        </section>

        <section className="dashboard-layout dashboard-layout--two-col-right mt-lg">
          <main className="dashboard-main-column">
            <section className="studio-section" id="featured-jobs">
              <div className="studio-section__head">
                <div><p className="eyebrow">Jobs</p><h2>Featured roles</h2></div>
                <Button to="/jobs" variant="ghost">View all jobs</Button>
              </div>
              <div className="studio-job-grid">
                {featuredJobs.length === 0 ? (
                  <Card className="studio-block"><CardTitle>No jobs match this filter</CardTitle><CardMeta>Adjust the fields in the search card to uncover more live openings.</CardMeta></Card>
                ) : (
                  featuredJobs.map((job) => (
                    <Card key={job.id} className="studio-job-card">
                      <div className="studio-job-card__head">
                        <div>
                          <CardEyebrow>{job.employer.name}</CardEyebrow>
                          <CardTitle><Link to={`/jobs/${job.id}`}>{job.title}</Link></CardTitle>
                        </div>
                        <span className="dashboard-chip">{job.jobType.replace('_', ' ')}</span>
                      </div>
                      <CardMeta>{formatLocation(job.location)}</CardMeta>
                      <CardMeta>{formatSalary(job.salaryMin, job.salaryMax)}</CardMeta>
                      <p className="muted">{job.description}</p>
                      <div className="studio-chip-row">
                        {(job.skills ?? []).slice(0, 3).map((skill) => <span key={skill.id} className="dashboard-chip">{skill.skill.name}</span>)}
                      </div>
                      <div className="studio-action-row mt-md">
                        <Button to={`/jobs/${job.id}`} variant="secondary">Open details</Button>
                        <Button to={`/jobs/${job.id}`} variant="primary" className="button--pill">Apply now</Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </section>

            <section className="studio-section" id="courses">
              <div className="studio-section__head">
                <div><p className="eyebrow">Learning</p><h2>Recently published courses</h2></div>
                <Button to="/courses" variant="ghost">Browse courses</Button>
              </div>
              <div className="studio-job-grid">
                {courses.map((course) => (
                  <Card key={course.id} className="studio-job-card">
                    <CardEyebrow>{course.institution?.name ?? 'Hanga Works'}</CardEyebrow>
                    <CardTitle><Link to={`/courses/${course.id}`}>{course.title}</Link></CardTitle>
                    <CardMeta>{course.description}</CardMeta>
                    <div className="studio-action-row mt-md">
                      <Button to={`/courses/${course.id}`} variant="ghost">Open course</Button>
                      <Button to={`/courses/${course.id}`} variant="primary">Start course</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </main>

          <aside className="dashboard-rail dashboard-rail--right">
            <Card className="studio-block">
              <CardEyebrow>Quick actions</CardEyebrow>
              <CardTitle>Move faster</CardTitle>
              <div className="studio-stack mt-md">
                <Button to="/login" variant="secondary">Sign in</Button>
                <Button to="/jobs" variant="ghost">Search jobs</Button>
                <Button to="/courses" variant="ghost">Explore courses</Button>
                <Button to="/register" variant="ghost">Create account</Button>
              </div>
            </Card>
            <Card className="studio-block">
              <CardEyebrow>Why it works</CardEyebrow>
              <CardTitle>Designed for trust</CardTitle>
              <div className="studio-stack mt-md">
                <div className="studio-inline-item"><div><strong>Unified state</strong><p>Jobs, learning, and profiles remain connected.</p></div></div>
                <div className="studio-inline-item"><div><strong>Live data</strong><p>Every card uses the backend feed.</p></div></div>
                <div className="studio-inline-item"><div><strong>Clear hierarchy</strong><p>Primary actions stay visually dominant.</p></div></div>
              </div>
            </Card>
          </aside>
        </section>
      </section>
    </SiteLayout>
  );
}
<bdi></bdi>