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

type DashboardTask = {
  title: string;
  detail: string;
  meta: string;
  href?: string;
};

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

  const roleLabel = user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'Learner';

  const recentCourses = useMemo(() => {
    return courses.slice(0, 3).map((course) => ({
      id: course.id,
      title: course.title,
      provider: course.institution?.name ?? 'Hanga Works',
      enrollments: course._count?.enrollments ?? 0,
      modules: course._count?.modules ?? course.modules?.length ?? 0,
    }));
  }, [courses]);

  const recommendedJobs = useMemo(() => {
    return [...jobs]
      .sort(
        (left, right) =>
          (right.matchScore ?? 0) - (left.matchScore ?? 0) ||
          (right._count?.applications ?? 0) - (left._count?.applications ?? 0),
      )
      .slice(0, 3);
  }, [jobs]);

  const continueLearningCourse = recentCourses[0] ?? null;

  const upcomingDeadlines = useMemo<DashboardTask[]>(() => {
    const tasks: DashboardTask[] = [];

    if (continueLearningCourse) {
      tasks.push({
        title: `Continue ${continueLearningCourse.title}`,
        detail: `${continueLearningCourse.modules} modules and ${continueLearningCourse.enrollments} enrollments in the queue.`,
        meta: 'Today',
        href: `/courses/${continueLearningCourse.id}`,
      });
    }

    if (applications[0]) {
      tasks.push({
        title: `Follow up on ${applications[0].job.title}`,
        detail: `Applied to ${applications[0].job.employer.name} in ${formatLocation(applications[0].job.location)}.`,
        meta: 'This week',
        href: `/jobs/${applications[0].job.id}`,
      });
    }

    tasks.push({
      title: 'Refresh your public profile',
      detail: 'Keep your summary, skills, and profile photo aligned with the roles you want.',
      meta: 'Next step',
      href: '/profile',
    });

    return tasks.slice(0, 3);
  }, [applications, continueLearningCourse]);

  const recentActivity = useMemo(() => {
    const items = [
      ...applications.slice(0, 4).map((application) => ({
        id: application.id,
        title: `Application ${application.status.toLowerCase()}`,
        detail: `${application.job.title} · ${application.job.employer.name}`,
        date: application.updatedAt,
        href: '/applications',
      })),
      ...certificates.slice(0, 2).map((certificate) => ({
        id: certificate.id,
        title: 'Certificate issued',
        detail: certificate.courseTitle,
        date: certificate.issuedAt,
        href: '/certifications',
      })),
    ];

    return items.sort((left, right) => Date.parse(right.date) - Date.parse(left.date)).slice(0, 6);
  }, [applications, certificates]);

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

  const progressCards = useMemo(
    () => [
      {
        title: 'Profile completion',
        value: Math.min(100, progressValue),
        meta: 'Based on applications, certificates, and learning activity.',
      },
      {
        title: 'Applications in review',
        value: applications.filter((item) => item.status === 'REVIEWING' || item.status === 'SHORTLISTED').length,
        meta: 'Live pipeline statuses from the backend.',
      },
      {
        title: 'Verified certificates',
        value: certificates.length,
        meta: 'Digital certificates available on your profile.',
      },
    ],
    [applications, certificates.length, progressValue],
  );

  const applicationStages = useMemo(() => {
    return ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED', 'REJECTED'].map((stage) => ({
      stage,
      count: applications.filter((item) => item.status === stage).length,
    }));
  }, [applications]);

  const learningMomentum = loading ? '...' : `${Math.min(100, progressValue)}%`;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SiteLayout>
      <div className="studio-dashboard studio-dashboard--learner" id="dashboard-home">
        <section className="studio-hero">
          <div className="studio-hero__intro">
            <p className="eyebrow">{roleLabel} mode</p>
            <h1 className="display-large">Design your week across learning and hiring.</h1>
            <p className="lead">Your next lesson, strongest matching roles, and pending deadlines are arranged as one operating canvas.</p>
            <div className="studio-hero__actions">
              <Button to="/courses" variant="secondary" className="button--lg">Continue learning</Button>
              <Button to="/jobs" variant="primary" className="button--lg button--pill">Match jobs</Button>
              <Button to="/applications" variant="ghost">Application board</Button>
            </div>
          </div>

          <Card className="studio-hero__spotlight">
            <CardEyebrow>Momentum index</CardEyebrow>
            <div className="studio-ring">{learningMomentum}</div>
            <div className="studio-stat-grid">
              <div>
                <span>Courses</span>
                <strong>{loading ? '...' : courses.length}</strong>
              </div>
              <div>
                <span>Applications</span>
                <strong>{loading ? '...' : applications.length}</strong>
              </div>
              <div>
                <span>Certificates</span>
                <strong>{loading ? '...' : certificates.length}</strong>
              </div>
              <div>
                <span>Top skill</span>
                <strong>{skillCounts[0]?.name ?? 'N/A'}</strong>
              </div>
            </div>
          </Card>
        </section>

        <section className="dashboard-layout mt-lg">
          <aside className="dashboard-rail">
            <Card className="studio-block">
              <CardEyebrow>Now learning</CardEyebrow>
              <CardTitle>{continueLearningCourse ? continueLearningCourse.title : 'No active course yet'}</CardTitle>
              <CardMeta>
                {continueLearningCourse
                  ? `${continueLearningCourse.provider} · ${continueLearningCourse.modules} modules`
                  : 'Start from the course catalog to build your learning streak.'}
              </CardMeta>
              <ProgressBar value={Math.min(100, progressValue)} label="Learning momentum" />
              <Button to={continueLearningCourse ? `/courses/${continueLearningCourse.id}` : '/courses'} variant="primary" className="button--pill">
                {continueLearningCourse ? 'Resume course' : 'Browse courses'}
              </Button>
            </Card>

            <Card className="studio-block">
              <CardEyebrow>Upcoming deadlines</CardEyebrow>
              <div className="studio-stack">
                {upcomingDeadlines.map((task) => (
                  <Link key={task.title} to={task.href ?? '/dashboard'} className="studio-inline-item">
                    <div>
                      <strong>{task.title}</strong>
                      <p>{task.detail}</p>
                    </div>
                    <span>{task.meta}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </aside>

          <main className="dashboard-main-column">
            <section className="studio-section">
              <div className="studio-section__head">
                <div>
                  <p className="eyebrow">Performance board</p>
                  <h2>Your current momentum</h2>
                </div>
                <Button to="/profile" variant="ghost">Profile settings</Button>
              </div>
              <div className="studio-metric-grid">
                {progressCards.map((metric) => (
                  <Card key={metric.title} className="studio-metric">
                    <CardEyebrow>{metric.title}</CardEyebrow>
                    <strong>{loading ? '...' : metric.value}</strong>
                    <ProgressBar value={Math.min(100, metric.value)} />
                    <CardMeta>{metric.meta}</CardMeta>
                  </Card>
                ))}
              </div>
            </section>

            <section className="studio-section">
              <div className="studio-section__head">
                <div>
                  <p className="eyebrow">Cross-platform</p>
                  <h2>Recommended jobs from your learning signals</h2>
                </div>
                <Button to="/jobs" variant="secondary">Open marketplace</Button>
              </div>
              <div className="studio-job-grid">
                {recommendedJobs.map((job) => (
                  <Card key={job.id} className="studio-job-card">
                    <div className="studio-job-card__head">
                      <div>
                        <CardEyebrow>{job.employer.name}</CardEyebrow>
                        <CardTitle>{job.title}</CardTitle>
                      </div>
                      <span className="dashboard-chip">{job.matchScore ?? job._count?.applications ?? 0}% match</span>
                    </div>
                    <CardMeta>{formatLocation(job.location)} · {job.jobType.replace('_', ' ')}</CardMeta>
                    <CardMeta>{formatSalary(job.salaryMin, job.salaryMax)}</CardMeta>
                    <div className="studio-chip-row">
                      {(job.skills ?? []).slice(0, 4).map((skill) => (
                        <span key={skill.id} className="dashboard-chip">{skill.skill.name}</span>
                      ))}
                    </div>
                    <div className="studio-action-row">
                      <Button to={`/jobs/${job.id}`} variant="secondary">Details</Button>
                      <Button to={`/jobs/${job.id}`} variant="primary">Apply</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </main>

          <aside className="dashboard-rail dashboard-rail--right">
            <Card className="studio-block">
              <CardEyebrow>Recent activity</CardEyebrow>
              <div className="studio-stack">
                {recentActivity.length === 0 ? (
                  <div className="studio-inline-item">
                    <div>
                      <strong>No recent updates</strong>
                      <p>Your timeline appears as soon as you apply or complete a course.</p>
                    </div>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <Link key={activity.id} to={activity.href} className="studio-inline-item">
                      <div>
                        <strong>{activity.title}</strong>
                        <p>{activity.detail}</p>
                      </div>
                      <span>{new Date(activity.date).toLocaleDateString()}</span>
                    </Link>
                  ))
                )}
              </div>
            </Card>

            <Card className="studio-block">
              <CardEyebrow>Application stages</CardEyebrow>
              <div className="studio-stage-list">
                {applicationStages.map((stage) => (
                  <div key={stage.stage} className="studio-stage-item">
                    <span>{stage.stage.replace('_', ' ')}</span>
                    <strong>{stage.count}</strong>
                  </div>
                ))}
              </div>
              <Button to="/applications" variant="ghost">Open pipeline</Button>
            </Card>
          </aside>
        </section>

        <div className="studio-floating-actions" aria-label="Quick learner actions">
          <Button to="/jobs" variant="primary">Jobs</Button>
          <Button to="/courses" variant="secondary">Courses</Button>
        </div>
      </div>
    </SiteLayout>
  );
}
