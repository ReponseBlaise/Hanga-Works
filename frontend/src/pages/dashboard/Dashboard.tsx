import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { ProgressBar } from '../../components/shared/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import { getApplications, getJobs, type JobSummary } from '../../services/jobs.service';
import { getMyProgress, type CourseEnrollment } from '../../services/courses.service';
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
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [certificates, setCertificates] = useState<LearnerCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([getJobs(), getMyProgress(), getApplications(), getMyCertificates()])
      .then(([jobsResponse, progressItems, applicationItems, certificateItems]) => {
        if (!active) return;
        setJobs(jobsResponse?.jobs ?? []);
        setEnrollments(progressItems ?? []);
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
    return enrollments.slice(0, 3).map((enrollment) => ({
      id: enrollment.course.id,
      title: enrollment.course.title,
      provider: 'Hanga Works',
      enrollments: 1,
      modules: 0,
    }));
  }, [enrollments]);

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
        detail: `Keep up your learning momentum.`,
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

    [...jobs.flatMap((job) => job.skills ?? [])].forEach((entry) => {
      counts.set(entry.skill.name, (counts.get(entry.skill.name) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [jobs]);

  const progressValue = useMemo(() => {
    const applicationScore = Math.min(40, applications.length * 8);
    const certificateScore = Math.min(30, certificates.length * 15);
    const learningScore = Math.min(30, enrollments.length * 6);
    return applicationScore + certificateScore + learningScore;
  }, [applications.length, certificates.length, enrollments.length]);

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
  const topSkills = skillCounts.slice(0, 4);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <aside className="app-shell-sidebar">
          <div className="app-shell-brand">
            <strong>Hanga Works</strong>
            <span>Main menu</span>
          </div>
          <nav className="app-shell-nav">
            <Link to="/dashboard" className="app-shell-nav__item is-active">Dashboard</Link>
            <Link to="/jobs" className="app-shell-nav__item">Job listings</Link>
            <Link to="/applications" className="app-shell-nav__item">My applications</Link>
            <Link to="/courses" className="app-shell-nav__item">Learning</Link>
            <Link to="/profile" className="app-shell-nav__item">Edit profile</Link>
            <Link to="/notifications" className="app-shell-nav__item">Messages</Link>
            <Link to="/certifications" className="app-shell-nav__item">Certificates</Link>
          </nav>
        </aside>

        <div className="studio-dashboard studio-dashboard--learner dashboard-redesign" id="dashboard-home">
        <section className="dashboard-redesign__hero">
          <div>
            <p className="eyebrow">{roleLabel} dashboard</p>
            <h1 className="display">Your learning and hiring command center</h1>
            <p className="lead">
              Keep the same workflow, now with clearer progress insights, action shortcuts, and a denser performance layout.
            </p>
            <div className="studio-action-row">
              <Button to="/courses" variant="secondary">Continue learning</Button>
              <Button to="/jobs" variant="primary" className="button--pill">Explore jobs</Button>
              <Button to="/applications" variant="ghost">Track applications</Button>
            </div>
          </div>
          <div className="dashboard-redesign__headline-stats">
            <div>
              <span>Learning momentum</span>
              <strong>{learningMomentum}</strong>
            </div>
            <div>
              <span>Open applications</span>
              <strong>{loading ? '...' : applications.length}</strong>
            </div>
            <div>
              <span>Courses active</span>
              <strong>{loading ? '...' : enrollments.length}</strong>
            </div>
            <div>
              <span>Certificates</span>
              <strong>{loading ? '...' : certificates.length}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-redesign__quick-metrics">
          {progressCards.map((metric) => (
            <Card key={metric.title} className="dashboard-redesign__metric">
              <CardEyebrow>{metric.title}</CardEyebrow>
              <strong>{loading ? '...' : metric.value}</strong>
              <ProgressBar value={Math.min(100, metric.value)} />
              <CardMeta>{metric.meta}</CardMeta>
            </Card>
          ))}
        </section>

        <section className="dashboard-redesign__layout">
          <main className="dashboard-main-column">
            <Card className="studio-block">
              <div className="studio-section__head">
                <div>
                  <p className="eyebrow">Recommended jobs</p>
                  <h2>Matched from your profile and course signals</h2>
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
            </Card>

            <Card className="studio-block">
              <div className="studio-section__head">
                <div>
                  <p className="eyebrow">Activity timeline</p>
                  <h2>Latest movement across your account</h2>
                </div>
                <Button to="/profile" variant="ghost">Profile settings</Button>
              </div>
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
          </main>

          <aside className="dashboard-rail">
            <Card className="studio-block">
              <CardEyebrow>Learning progress</CardEyebrow>
              <CardTitle>{continueLearningCourse ? continueLearningCourse.title : 'No active course yet'}</CardTitle>
              <CardMeta>
                {continueLearningCourse
                  ? `${continueLearningCourse.provider}`
                  : 'Start from the course catalog to build your learning streak.'}
              </CardMeta>
              <ProgressBar value={Math.min(100, progressValue)} label="Learning momentum" />
              <Button to={continueLearningCourse ? `/courses/${continueLearningCourse.id}` : '/courses'} variant="primary" className="button--pill">
                {continueLearningCourse ? 'Resume course' : 'Browse courses'}
              </Button>
            </Card>

            <Card className="studio-block">
              <CardEyebrow>Upcoming actions</CardEyebrow>
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

            <Card className="studio-block">
              <CardEyebrow>Top skills in demand</CardEyebrow>
              <div className="studio-chip-row">
                {topSkills.length === 0 ? (
                  <CardMeta>No skill demand yet from current jobs.</CardMeta>
                ) : (
                  topSkills.map((skill) => (
                    <span key={skill.name} className="dashboard-chip">
                      {skill.name} · {skill.count}
                    </span>
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
            </Card>
          </aside>
        </section>
        </div>
      </div>
    </SiteLayout>
  );
}
