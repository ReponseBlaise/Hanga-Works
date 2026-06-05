import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Button } from '../../components/ui/Button';
import { getAdminUsers, updateAdminUserStatus } from '../../services/admin.service';
import { exportCsv } from '../../utils/exportCsv';

function statusClass(status: string) {
  if (status === 'ACTIVE') return 'admin-table__status admin-table__status--active';
  if (status === 'PENDING') return 'admin-table__status admin-table__status--pending';
  return 'admin-table__status admin-table__status--suspended';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAdminUsers()
      .then(data => { if (active) setUsers(data ?? []); })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleToggle = async (id: string, status: string) => {
    const next = status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateAdminUserStatus(id, next);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: next } : u));
    } catch (err) { console.error(err); }
  };

  const handleExport = () => exportCsv(
    users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status, joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '' })),
    `hanga-users-${new Date().toISOString().slice(0, 10)}.csv`
  );

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <AdminSidebar />

        <div className="studio-dashboard dashboard-redesign">
          <header className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Manage</p>
              <h1 className="display">Users</h1>
              <p className="lead">View, moderate, and manage all registered platform users.</p>
            </div>
          </header>

          <section aria-label="Users table" style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }} aria-live="polite">
                {loading ? 'Loading…' : `${users.length} users`}
              </p>
              <Button variant="primary" onClick={handleExport} disabled={loading || users.length === 0} aria-label="Export users as CSV">
                Export CSV
              </Button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: '#fff' }}>
              {loading ? (
                <p role="status" style={{ padding: '24px', color: 'var(--text-soft)' }}>Loading users…</p>
              ) : users.length === 0 ? (
                <p role="status" style={{ padding: '24px', color: 'var(--text-soft)' }}>No users found.</p>
              ) : (
                <table className="admin-table" aria-label="Platform users">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Role</th>
                      <th scope="col">Status</th>
                      <th scope="col">Joined</th>
                      <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong></td>
                        <td style={{ color: 'var(--text-soft)' }}>{u.email}</td>
                        <td>{u.role}</td>
                        <td>
                          <span className={statusClass(u.status)} aria-label={`Status: ${u.status}`}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-soft)' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <div className="admin-table__actions">
                            {u.status === 'PENDING' && (
                              <Link
                                to={`/admin/users/${u.id}`}
                                className="button button-secondary"
                                style={{ fontSize: '0.82rem', minHeight: '34px', padding: '0 12px' }}
                                aria-label={`Review ${u.name}`}
                              >
                                Review
                              </Link>
                            )}
                            <Button
                              variant={u.status === 'ACTIVE' ? 'secondary' : 'primary'}
                              onClick={() => handleToggle(u.id, u.status)}
                              style={{ fontSize: '0.82rem', minHeight: '34px', padding: '0 12px' }}
                              aria-label={u.status === 'ACTIVE' ? `Suspend ${u.name}` : `Reactivate ${u.name}`}
                            >
                              {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
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
