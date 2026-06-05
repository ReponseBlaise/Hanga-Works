import { useEffect, useState } from 'react';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { getAnalyticsOverview, type AnalyticsOverview } from '../../services/analytics.service';
import { getCourses } from '../../services/courses.service';

export default function AdminPanelPage() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/users').catch(() => ({ data: { data: [] } })),
      getCourses().catch(() => []),
      getAnalyticsOverview().catch(() => null),
    ]).then(([userRes, coursesRes, analyticsRes]) => {
      if (!active) return;
      const users = userRes.data?.data ?? userRes.data ?? [];
      setUserCount(Array.isArray(users) ? users.length : 0);
      setCourseCount((coursesRes ?? []).length);
      setOverview(analyticsRes);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const stat = (val: unknown) => loading ? '…' : String(val ?? '—');

  const quickLinks = [
    { label: 'Manage Users', to: '/admin/manage/users', desc: 'View, suspend and review user accounts.' },
    { label: 'Manage Jobs', to: '/admin/manage/jobs', desc: 'Activate or deactivate job listings.' },
    { label: 'Manage Courses', to: '/admin/manage/courses', desc: 'Publish or unpublish platform courses.' },
    { label: 'Moderation Queue', to: '/admin/moderation', desc: 'Review pending accounts and content.' },
    { label: 'Data Exports', to: '/admin/export', desc: 'Download platform data as CSV, Excel or PDF.' },
  ];

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <AdminSidebar />

        <div className="studio-dashboard dashboard-redesign">
          <section className="dashboard-redesign__hero" aria-label="Platform overview">
            <div>
              <p className="eyebrow">Admin mode</p>
              <h1 className="display">Platform command center</h1>
              <p className="lead">Monitor platform health and navigate to any management area.</p>
              <div className="studio-action-row" style={{ marginTop: '12px' }}>
                <Button to="/admin/export" variant="primary" className="button--pill">Export Data</Button>
                <Button to="/admin/moderation" variant="secondary">Moderation Queue</Button>
              </div>
            </div>
            <div className="dashboard-redesign__headline-stats" aria-label="Platform statistics">
              <div><span>Total Users</span><strong>{stat(overview?.totalUsers ?? userCount)}</strong></div>
              <div><span>Active Jobs</span><strong>{stat(overview?.activeJobs)}</strong></div>
              <div><span>Courses</span><strong>{stat(courseCount)}</strong></div>
              <div><span>Completion %</span><strong>{stat(overview?.completionRate ?? '0%')}</strong></div>
            </div>
          </section>

          <nav aria-label="Admin quick links" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {quickLinks.map(({ label, to, desc }) => (
              <a
                key={to}
                href={to}
                onClick={e => { e.preventDefault(); window.location.href = to; }}
                style={{
                  display: 'grid', gap: '8px', padding: '20px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  background: '#fff', boxShadow: 'var(--shadow)',
                  textDecoration: 'none', color: 'inherit',
                  transition: 'box-shadow 180ms ease, border-color 180ms ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,99,235,0.3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
              >
                <strong style={{ fontSize: '0.95rem' }}>{label}</strong>
                <span style={{ color: 'var(--text-soft)', fontSize: '0.86rem', lineHeight: 1.5 }}>{desc}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </SiteLayout>
  );
}
