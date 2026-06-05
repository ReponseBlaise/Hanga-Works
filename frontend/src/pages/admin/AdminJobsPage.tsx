import { useState, useEffect } from 'react';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Button } from '../../components/ui/Button';
import { getAdminJobs, updateAdminJobStatus } from '../../services/admin.service';
import { exportCsv } from '../../utils/exportCsv';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAdminJobs()
      .then(data => { if (active) setJobs(data ?? []); })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await updateAdminJobStatus(id, !isActive);
      setJobs(prev => prev.map(j => j.id === id ? { ...j, isActive: !isActive } : j));
    } catch (err) { console.error(err); }
  };

  const handleExport = () => exportCsv(
    jobs.map(j => ({ id: j.id, title: j.title, employer: j.employer?.name ?? '', status: j.isActive ? 'Active' : 'Deactivated', location: j.location ?? '', salary: j.salary ?? '' })),
    `hanga-jobs-${new Date().toISOString().slice(0, 10)}.csv`
  );

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <AdminSidebar />

        <div className="studio-dashboard dashboard-redesign">
          <header className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Manage</p>
              <h1 className="display">Jobs</h1>
              <p className="lead">View and moderate all job listings posted on the platform.</p>
            </div>
          </header>

          <section aria-label="Jobs table" style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }} aria-live="polite">
                {loading ? 'Loading…' : `${jobs.length} jobs`}
              </p>
              <Button variant="primary" onClick={handleExport} disabled={loading || jobs.length === 0} aria-label="Export jobs as CSV">
                Export CSV
              </Button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: '#fff' }}>
              {loading ? (
                <p role="status" style={{ padding: '24px', color: 'var(--text-soft)' }}>Loading jobs…</p>
              ) : jobs.length === 0 ? (
                <p role="status" style={{ padding: '24px', color: 'var(--text-soft)' }}>No jobs found.</p>
              ) : (
                <table className="admin-table" aria-label="Platform jobs">
                  <thead>
                    <tr>
                      <th scope="col">Title</th>
                      <th scope="col">Employer</th>
                      <th scope="col">Location</th>
                      <th scope="col">Status</th>
                      <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.id}>
                        <td><strong>{j.title}</strong></td>
                        <td style={{ color: 'var(--text-soft)' }}>{j.employer?.name ?? '—'}</td>
                        <td style={{ color: 'var(--text-soft)' }}>{j.location ?? '—'}</td>
                        <td>
                          <span
                            className={`admin-table__status ${j.isActive ? 'admin-table__status--active' : 'admin-table__status--deactivated'}`}
                            aria-label={`Status: ${j.isActive ? 'Active' : 'Deactivated'}`}
                          >
                            {j.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-table__actions">
                            <Button
                              variant={j.isActive ? 'secondary' : 'primary'}
                              onClick={() => handleToggle(j.id, j.isActive)}
                              style={{ fontSize: '0.82rem', minHeight: '34px', padding: '0 12px' }}
                              aria-label={j.isActive ? `Deactivate ${j.title}` : `Reactivate ${j.title}`}
                            >
                              {j.isActive ? 'Deactivate' : 'Reactivate'}
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
