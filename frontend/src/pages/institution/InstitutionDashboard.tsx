import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getManageableCourses, type BackendCourse } from '../../services/courses.service';

export default function InstitutionDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getManageableCourses()
      .then((data) => {
        if (!active) return;
        setCourses(data ?? []);
      })
      .catch((error) => {
        console.error('Failed to load courses', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalEnrollments = useMemo(() => {
    return courses.reduce((acc, c) => acc + (c._count?.enrollments ?? 0), 0);
  }, [courses]);

  const publishedCourses = useMemo(() => {
    return courses.filter((c) => c.published).length;
  }, [courses]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <aside className="app-shell-sidebar">
          <div className="app-shell-brand">
            <strong>Hanga Works</strong>
            <span>Institution Menu</span>
          </div>
          <nav className="app-shell-nav">
            <Link to="/institution/dashboard" className="app-shell-nav__item is-active">Dashboard</Link>
            <Link to="/courses/new" className="app-shell-nav__item">Create Course</Link>
            <Link to="/institution/mentors" className="app-shell-nav__item">Mentors</Link>
            <Link to="/institution/certifications" className="app-shell-nav__item">Certifications</Link>
            <Link to="/profile" className="app-shell-nav__item">Institution Profile</Link>
          </nav>
        </aside>

        <div className="studio-dashboard studio-dashboard--employer dashboard-redesign">
          <section className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Institution dashboard</p>
              <h1 className="display">Training & Course Management</h1>
              <p className="lead">
                Monitor enrollments, manage your course catalog, and publish new educational content for learners.
              </p>
              <div className="studio-action-row">
                <Button to="/courses/new" variant="primary" className="button--pill">Create Course</Button>
              </div>
            </div>
            <div className="dashboard-redesign__headline-stats">
              <div>
                <span>Total Courses</span>
                <strong>{loading ? '...' : courses.length}</strong>
              </div>
              <div>
                <span>Published</span>
                <strong>{loading ? '...' : publishedCourses}</strong>
              </div>
              <div>
                <span>Total Enrollments</span>
                <strong>{loading ? '...' : totalEnrollments}</strong>
              </div>
            </div>
          </section>

          <section className="dashboard-redesign__layout">
            <main className="dashboard-main-column">
              <Card className="studio-block">
                <div className="studio-section__head">
                  <div>
                    <p className="eyebrow">Your Course Catalog</p>
                    <h2>Manage existing programs</h2>
                  </div>
                </div>
                <div className="studio-jobs-grid">
                  {courses.length === 0 ? (
                    <div className="studio-inline-item">
                      <div>
                        <strong>No courses created yet</strong>
                        <p>Draft your first course to begin training learners.</p>
                      </div>
                    </div>
                  ) : courses.map((course) => (
                    <Card key={course.id} className="studio-job-card">
                      <div className="studio-job-card__head">
                        <div>
                          <CardMeta>{course.published ? 'Published' : 'Draft'}</CardMeta>
                          <CardTitle><Link to={`/courses/${course.id}`}>{course.title}</Link></CardTitle>
                        </div>
                        <span className="dashboard-chip">{course._count?.enrollments ?? 0} Students</span>
                      </div>
                      <CardMeta>{course.description}</CardMeta>
                      <div className="studio-action-row mt-md">
                        <Button to={`/courses/${course.id}`} variant="secondary">View & Edit</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </main>

            <aside className="dashboard-rail">
              <Card className="studio-block">
                <CardEyebrow>Top Performing Courses</CardEyebrow>
                <div className="studio-stack">
                  {courses.length === 0 ? (
                    <CardMeta>Check back when you have enrollments.</CardMeta>
                  ) : (
                    courses.sort((a,b) => (b._count?.enrollments ?? 0) - (a._count?.enrollments ?? 0)).slice(0, 3).map((course) => (
                      <div key={course.id} className="studio-inline-item">
                        <div>
                          <strong>{course.title}</strong>
                          <p>{course._count?.enrollments ?? 0} Enrollments</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </aside>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
