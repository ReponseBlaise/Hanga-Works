import { useEffect, useState } from 'react';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardTitle, CardMeta } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { getAnalyticsOverview, type AnalyticsOverview } from '../../services/analytics.service';

type UserSummary = { id: string; name: string; email: string; role: string };

export default function AdminPanelPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      api.get('/admin/users'),
      getAnalyticsOverview().catch(() => null),
    ])
      .then(([userResponse, analyticsResponse]) => {
        if (!active) return;
        setUsers(userResponse.data ?? []);
        setOverview(analyticsResponse);
      })
      .catch(() => {
        if (active) setUsers([]);
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
      <section>
        <header className="page-header">
          <h2>Admin Panel</h2>
          <div>
            <Button to="/admin/export" variant="ghost">Export CSV</Button>
            <Button to="/admin/moderation">Moderation Queue</Button>
          </div>
        </header>

        <div className="grid-columns">
          <Card>
            <CardTitle>Users</CardTitle>
            <CardMeta>{users.length} users</CardMeta>
          </Card>
          <Card>
            <CardTitle>Active Jobs</CardTitle>
            <CardMeta>{overview?.activeJobs ?? '—'}</CardMeta>
          </Card>
          <Card>
            <CardTitle>Open Reports</CardTitle>
            <CardMeta>{overview ? `${overview.totalApplications} applications` : '—'}</CardMeta>
          </Card>
        </div>

        <section style={{ marginTop: 24 }}>
          <h3>Recent users</h3>
          {loading ? (
            <p>Loading…</p>
          ) : users.length === 0 ? (
            <p>No users available (or admin endpoint not configured).</p>
          ) : (
            <div className="list-stack">
              {users.slice(0, 10).map((u) => (
                <div key={u.id} className="list-item">
                  <div>
                    <strong>{u.name}</strong>
                    <div className="muted">{u.email}</div>
                  </div>
                  <div>
                    <Button to={`mailto:${u.email}`} variant="ghost">Email</Button>
                    <Button to={`/admin/users/${u.id}`} variant="secondary">View</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </SiteLayout>
  );
}
