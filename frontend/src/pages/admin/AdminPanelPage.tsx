import { useEffect, useState } from 'react';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardTitle, CardMeta, CardEyebrow } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { getAnalyticsOverview, type AnalyticsOverview } from '../../services/analytics.service';
import { getCourses, type BackendCourse } from '../../services/courses.service';

type UserSummary = { id: string; name: string; email: string; role: string; createdAt: string };

export default function AdminPanelPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'courses'>('users');

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      api.get('/users').catch(() => ({ data: { data: [] } })),
      getCourses().catch(() => []),
      getAnalyticsOverview().catch(() => null),
    ])
      .then(([userResponse, coursesResponse, analyticsResponse]) => {
        if (!active) return;
        const fetchedUsers = userResponse.data?.data ?? userResponse.data ?? [];
        setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
        setCourses(coursesResponse ?? []);
        setOverview(analyticsResponse);
      })
      .catch(() => {
        if (active) {
          setUsers([]);
          setCourses([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <SiteLayout>
      <section className="studio-dashboard">
        <header className="studio-hero">
          <div className="studio-hero__intro">
            <p className="eyebrow">Admin mode</p>
            <h1 className="display-large">Platform command center</h1>
            <p className="lead">Manage users, moderate courses, and view live system analytics across the platform.</p>
            <div className="studio-action-row mt-md">
              <Button to="/admin/export" variant="primary" className="button--pill">Export Data</Button>
              <Button to="/admin/moderation" variant="secondary">Moderation Queue</Button>
            </div>
          </div>
          <Card className="studio-hero__spotlight">
            <CardEyebrow>Live analytics</CardEyebrow>
            <div className="studio-stat-grid mt-md">
              <div><span>Total Users</span><strong>{loading ? '...' : overview?.totalUsers ?? users.length}</strong></div>
              <div><span>Active Jobs</span><strong>{loading ? '...' : overview?.activeJobs ?? '—'}</strong></div>
              <div><span>Platform Courses</span><strong>{loading ? '...' : courses.length}</strong></div>
              <div><span>Completion Rate</span><strong>{loading ? '...' : overview?.completionRate ?? '0%'}</strong></div>
            </div>
          </Card>
        </header>

        <section className="dashboard-layout dashboard-layout--two-col-right mt-lg">
          <main className="dashboard-main-column">
            <div className="studio-catalog__toolbar">
              <div className="studio-toggle-group" role="tablist">
                <button
                  type="button"
                  className={`studio-toggle ${activeTab === 'users' ? 'is-active' : ''}`.trim()}
                  onClick={() => setActiveTab('users')}
                >
                  Manage Users
                </button>
                <button
                  type="button"
                  className={`studio-toggle ${activeTab === 'courses' ? 'is-active' : ''}`.trim()}
                  onClick={() => setActiveTab('courses')}
                >
                  Manage Courses
                </button>
              </div>
            </div>

            {loading ? (
              <Card className="studio-block"><CardMeta>Loading platform data...</CardMeta></Card>
            ) : activeTab === 'users' ? (
              <div className="studio-stack mt-md">
                {users.length === 0 ? (
                  <Card className="studio-block"><CardMeta>No users available. Ensure the admin endpoint is configured.</CardMeta></Card>
                ) : (
                  users.map((u) => (
                    <Card key={u.id} className="studio-job-card">
                      <div className="studio-job-card__head">
                        <div>
                          <CardEyebrow>{u.role || 'LEARNER'}</CardEyebrow>
                          <CardTitle>{u.name}</CardTitle>
                          <CardMeta>{u.email}</CardMeta>
                        </div>
                        <span className="muted">Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recently'}</span>
                      </div>
                      <div className="studio-action-row mt-md">
                        <Button to={`/admin/users/${u.id}`} variant="primary">Manage user</Button>
                        <Button to={`mailto:${u.email}`} variant="secondary">Email</Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <div className="studio-stack mt-md">
                {courses.length === 0 ? (
                  <Card className="studio-block"><CardMeta>No courses available on the platform.</CardMeta></Card>
                ) : (
                  courses.map((course) => (
                    <Card key={course.id} className="studio-job-card">
                      <div className="studio-job-card__head">
                        <div>
                          <CardEyebrow>{course.institution?.name ?? 'Hanga Works'}</CardEyebrow>
                          <CardTitle>{course.title}</CardTitle>
                          <CardMeta>{course.published ? 'Published' : 'Draft'}</CardMeta>
                        </div>
                        <span className="muted">{course._count?.enrollments ?? 0} Enrollments</span>
                      </div>
                      <CardMeta>{course.description}</CardMeta>
                      <div className="studio-action-row mt-md">
                        <Button to={`/courses/${course.id}`} variant="primary">View Course</Button>
                        <Button to={`/admin/moderation`} variant="secondary">Moderate</Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </main>

          <aside className="dashboard-rail dashboard-rail--right">
            <Card className="studio-block">
              <CardEyebrow>System Health</CardEyebrow>
              <CardTitle>API Status</CardTitle>
              <div className="studio-stack mt-md">
                <div className="studio-inline-item"><div><strong>User Service</strong><p>Operational</p></div><span style={{ color: 'green' }}>●</span></div>
                <div className="studio-inline-item"><div><strong>Course Engine</strong><p>Operational</p></div><span style={{ color: 'green' }}>●</span></div>
                <div className="studio-inline-item"><div><strong>Exports</strong><p>CSV, PDF, Excel Ready</p></div><span style={{ color: 'green' }}>●</span></div>
              </div>
            </Card>
          </aside>
        </section>
      </section>
    </SiteLayout>
  );
}
