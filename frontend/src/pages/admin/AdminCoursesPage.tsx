import { useState, useEffect } from 'react';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Button } from '../../components/ui/Button';
import { getAdminCourses, updateAdminCourseStatus } from '../../services/admin.service';
import { exportCsv } from '../../utils/exportCsv';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAdminCourses()
      .then(data => { if (active) setCourses(data ?? []); })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleToggle = async (id: string, published: boolean) => {
    try {
      await updateAdminCourseStatus(id, !published);
      setCourses(prev => prev.map(c => c.id === id ? { ...c, published: !published } : c));
    } catch (err) { console.error(err); }
  };

  const handleExport = () => exportCsv(
    courses.map(c => ({ id: c.id, title: c.title, institution: c.institution?.name ?? 'Hanga Works', status: c.published ? 'Published' : 'Draft', enrollments: c._count?.enrollments ?? 0 })),
    `hanga-courses-${new Date().toISOString().slice(0, 10)}.csv`
  );

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <AdminSidebar />

        <div className="studio-dashboard dashboard-redesign">
          <header className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Manage</p>
              <h1 className="display">Courses</h1>
              <p className="lead">View and moderate all courses published on the platform.</p>
            </div>
          </header>

          <section aria-label="Courses table" style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }} aria-live="polite">
                {loading ? 'Loading…' : `${courses.length} courses`}
              </p>
              <Button variant="primary" onClick={handleExport} disabled={loading || courses.length === 0} aria-label="Export courses as CSV">
                Export CSV
              </Button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: '#fff' }}>
              {loading ? (
                <p role="status" style={{ padding: '24px', color: 'var(--text-soft)' }}>Loading courses…</p>
              ) : courses.length === 0 ? (
                <p role="status" style={{ padding: '24px', color: 'var(--text-soft)' }}>No courses found.</p>
              ) : (
                <table className="admin-table" aria-label="Platform courses">
                  <thead>
                    <tr>
                      <th scope="col">Title</th>
                      <th scope="col">Institution</th>
                      <th scope="col">Enrollments</th>
                      <th scope="col">Status</th>
                      <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.title}</strong></td>
                        <td style={{ color: 'var(--text-soft)' }}>{c.institution?.name ?? 'Hanga Works'}</td>
                        <td style={{ color: 'var(--text-soft)' }}>{c._count?.enrollments ?? 0}</td>
                        <td>
                          <span
                            className={`admin-table__status ${c.published ? 'admin-table__status--active' : 'admin-table__status--suspended'}`}
                            aria-label={`Status: ${c.published ? 'Published' : 'Draft'}`}
                          >
                            {c.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-table__actions">
                            <Button
                              to={`/courses/${c.id}`}
                              variant="secondary"
                              style={{ fontSize: '0.82rem', minHeight: '34px', padding: '0 12px' }}
                              aria-label={`View course: ${c.title}`}
                            >
                              View
                            </Button>
                            <Button
                              variant={c.published ? 'secondary' : 'primary'}
                              onClick={() => handleToggle(c.id, c.published)}
                              style={{ fontSize: '0.82rem', minHeight: '34px', padding: '0 12px' }}
                              aria-label={c.published ? `Unpublish ${c.title}` : `Publish ${c.title}`}
                            >
                              {c.published ? 'Unpublish' : 'Publish'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
