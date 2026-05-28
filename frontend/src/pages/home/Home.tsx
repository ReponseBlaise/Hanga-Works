import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Topbar';
import Footer from '../../components/layout/Footer';
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

function HeroVisualCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Card className="hero-visual-card">
      <div className="hero-visual-card__badge">{title}</div>
      <div className="hero-visual-card__art">
        <img
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80"
          alt="Team collaboration"
          className="hero-visual-card__image hero-visual-card__image--large"
          loading="lazy"
        />
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
          alt="Employer hiring meeting"
          className="hero-visual-card__image hero-visual-card__image--small"
          loading="lazy"
        />
      </div>
      <p>{subtitle}</p>
    </Card>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState<JobSummary[]>([]);
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [roleType, setRoleType] = useState('ALL');

  useEffect(() => {
    let active = true;
    Promise.all([getJobs(), getCourses()])
      .then(([jobs, courseItems]) => {
        if (!active) return;
        setFeaturedJobs(jobs.slice(0, 6));
        setCourses(courseItems.slice(0, 6));
      })
      .catch((error) => console.error('Failed to load home data', error));

    return () => {
      active = false;
    };
  }, []);

  const topSkills = useMemo(() => {
    const counts = new Map<string, number>();
    [...featuredJobs.flatMap((job) => job.skills ?? []), ...courses.flatMap((course) => course.skills ?? [])].forEach((item) => {
      const name = item.skill.name;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [courses, featuredJobs]);

  const topLocations = useMemo(() => {
    const counts = new Map<string, number>();
    featuredJobs.forEach((job) => {
      const location = formatLocation(job.location);
      counts.set(location, (counts.get(location) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([location, count]) => ({ location, count }));
  }, [featuredJobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const locationQuery = location.trim().toLowerCase();

    return featuredJobs.filter((job) => {
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
  }, [featuredJobs, location, roleType, search]);

  const quickChips = ['React', 'TypeScript', 'Node.js', 'Python', 'Data Analysis'];

  return (
    <div className="landing-page">
      <Navbar />

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <h1>The Easiest Way to Get Your New Job</h1>
            <p className="landing-lead">
              HANGA WORKS connects learners and employers through live jobs, published courses, and a backend-driven hiring pipeline.
            </p>

            <div className="landing-filter-card card" role="search" aria-label="Search jobs">
              <div className="landing-filter-card__grid">
                <label className="landing-filter-card__field landing-filter-card__field--wide">
                  <span>Keyword</span>
                  <input
                    type="search"
                    placeholder="Search by title, company, or skill"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>

                <label className="landing-filter-card__field">
                  <span>Location</span>
                  <input
                    type="text"
                    placeholder="Kigali, remote..."
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  />
                </label>

                <label className="landing-filter-card__field">
                  <span>Role type</span>
                  <select value={roleType} onChange={(event) => setRoleType(event.target.value)}>
                    <option value="ALL">All roles</option>
                    <option value="FULL_TIME">Full time</option>
                    <option value="PART_TIME">Part time</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </label>

                <Button
                  type="button"
                  variant="primary"
                  className="landing-filter-card__button"
                  onClick={() => {
                    const firstMatch = filteredJobs[0];
                    if (firstMatch) {
                      window.location.hash = '#jobs-of-the-day';
                    }
                  }}
                >
                  Find jobs
                </Button>
              </div>

              <div className="landing-filter-card__chips">
                <span className="landing-filter-card__chips-label">Quick filters</span>
                {quickChips.map((chip) => (
                  <button key={chip} type="button" className="landing-filter-card__chip" onClick={() => setSearch(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="landing-popular-searches">
              <span>Popular Searches:</span>
              {['Designer', 'Web', 'iOS', 'Developer', 'PHP', 'Senior', 'Engineer'].map((item) => (
                <button key={item} type="button" onClick={() => setSearch(item)}>
                  {item}
                </button>
              ))}
            </div>

            <div className="landing-hero__actions">
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="button button-primary">
                {isAuthenticated ? 'Go to dashboard' : 'Create account'}
              </Link>
              <Link to="/login" className="button button-secondary">
                Sign in
              </Link>
            </div>
          </div>

          <div className="landing-hero__visual">
            <HeroVisualCard title="Live listings" subtitle={`${featuredJobs.length} jobs are loaded from the backend API.`} />
            <HeroVisualCard title="Published courses" subtitle={`${courses.length} live courses are loaded from the backend database.`} />
          </div>
        </section>

        <section className="landing-section">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">Trending skills</p>
              <h2>Skills appearing most in live jobs and courses</h2>
            </div>
          </div>

          <div className="landing-category-row">
            {topSkills.map((item) => (
              <Card key={item.name} className="landing-category-card">
                <div className="landing-category-card__icon">★</div>
                <div>
                  <CardTitle>{item.name}</CardTitle>
                  <CardMeta>{item.count} live mentions</CardMeta>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="landing-banner-card">
          <div>
            <p className="landing-banner-card__kicker">We are hiring</p>
            <h2>Let’s work together and explore opportunities</h2>
          </div>
          <Button href="#jobs-of-the-day" variant="primary">
            Apply now
          </Button>
        </section>

        <section className="landing-section" id="jobs-of-the-day">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">Jobs of the day</p>
              <h2>Open roles from the live database.</h2>
            </div>
            <div className="landing-section__meta">
              <span>{filteredJobs.length} matching job{filteredJobs.length === 1 ? '' : 's'}</span>
            </div>
          </div>

          <div className="landing-job-grid">
            {filteredJobs.length === 0 ? (
              <Card className="landing-job-card">
                <CardTitle>No jobs match this filter</CardTitle>
                <CardMeta>Adjust the keyword, location, or role type to see more live openings.</CardMeta>
              </Card>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="landing-job-card">
                  <CardEyebrow>{job.employer.name}</CardEyebrow>
                  <CardTitle>{job.title}</CardTitle>
                  <CardMeta>{formatLocation(job.location)} · {job.jobType}</CardMeta>
                  <p>{formatSalary(job.salaryMin, job.salaryMax)}</p>
                  <div className="job-card__tags">
                    {(job.skills ?? []).slice(0, 3).map((skill) => (
                      <span key={skill.id}>{skill.skill.name}</span>
                    ))}
                  </div>
                  <Button to={`/jobs/${job.id}`} variant="secondary">View details</Button>
                </Card>
              ))
            )}
          </div>
        </section>

        <section className="landing-section">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">Jobs by location</p>
              <h2>Where the backend says the openings are</h2>
            </div>
          </div>

          <div className="landing-location-grid">
            {topLocations.map((location) => (
              <Card key={location.location} className="landing-location-card">
                <div className="landing-location-card__image" />
                <div className="landing-location-card__body">
                  <CardTitle>{location.location}</CardTitle>
                  <CardMeta>{location.count} live jobs</CardMeta>
                  <span>Loaded from database listings</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="landing-section landing-news-section">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">Latest learning</p>
              <h2>Recently published courses from the LMS</h2>
            </div>
          </div>

          <div className="landing-blog-grid">
            {courses.length === 0 ? (
              <Card className="landing-blog-card">
                <CardTitle>No courses available yet</CardTitle>
                <CardMeta>The backend course feed will appear here once content is published.</CardMeta>
              </Card>
            ) : (
              courses.map((course) => (
                <Card key={course.id} className="landing-blog-card">
                  {course.thumbnailUrl ? <img src={course.thumbnailUrl} alt={course.title} className="landing-blog-card__image" loading="lazy" /> : null}
                  <div className="landing-blog-card__body">
                    <CardEyebrow>{course.institution?.name ?? 'Hanga Works'}</CardEyebrow>
                    <CardTitle>{course.title}</CardTitle>
                    <CardMeta>{course.description}</CardMeta>
                    <div className="landing-blog-card__meta">
                      <span>{course._count?.modules ?? course.modules?.length ?? 0} modules</span>
                      <span>{course._count?.enrollments ?? 0} enrollments</span>
                      <span>{course.published ? 'Published' : 'Draft'}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="landing-blog-actions">
            <Button to="/courses" variant="primary">
              Browse courses
            </Button>
          </div>
        </section>

        <section id="contact" className="landing-newsletter">
          <div>
            <p className="landing-banner-card__kicker">Newsletter</p>
            <h2>New Things Will Always Update Regularly</h2>
          </div>

          <div className="landing-newsletter__form">
            <input type="email" placeholder="Enter your email here" aria-label="Email address" />
            <Button type="button" variant="primary">
              Subscribe
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
