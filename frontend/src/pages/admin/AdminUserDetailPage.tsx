import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardTitle, CardMeta, CardEyebrow } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getAdminUserDetail, updateAdminUserStatus } from '../../services/admin.service';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    getAdminUserDetail(id)
      .then(data => {
        if (active) setUser(data);
      })
      .catch(err => {
        if (active) setError(err?.response?.data?.message || 'Failed to load user details.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
    if (!id) return;
    setProcessing(true);
    try {
      await updateAdminUserStatus(id, status);
      setUser({ ...user, status });
      if (status === 'ACTIVE') {
        alert('Account approved successfully!');
        navigate('/admin/moderation');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="page-shell">
          <Card><CardMeta>Loading user details...</CardMeta></Card>
        </div>
      </SiteLayout>
    );
  }

  if (error || !user) {
    return (
      <SiteLayout>
        <div className="page-shell">
          <Card>
            <CardTitle>Error</CardTitle>
            <CardMeta>{error || 'User not found'}</CardMeta>
            <div className="mt-md">
              <Button to="/admin/moderation" variant="secondary">Back to Queue</Button>
            </div>
          </Card>
        </div>
      </SiteLayout>
    );
  }

  const org = user.organization;

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <aside className="app-shell-sidebar">
          <div className="app-shell-brand">
            <strong>Hanga Works</strong>
            <span>Admin Control</span>
          </div>
          <nav className="app-shell-nav">
            <Link to="/admin" className="app-shell-nav__item">Platform Overview</Link>
            <Link to="/admin/export" className="app-shell-nav__item">Data Exports</Link>
            <Link to="/admin/moderation" className="app-shell-nav__item is-active">Moderation Queue</Link>
            <Link to="/profile" className="app-shell-nav__item">Admin Profile</Link>
          </nav>
        </aside>

        <div className="studio-dashboard dashboard-redesign">
          <header className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Moderation Queue</p>
              <h1 className="display">Review Account</h1>
              <p className="lead">Verify the details of this {user.role.toLowerCase()} before granting platform access.</p>
            </div>
            <div className="studio-action-row">
              <Button to="/admin/moderation" variant="secondary">Back to Queue</Button>
            </div>
          </header>

          <section className="dashboard-redesign__layout mt-lg">
            <main className="dashboard-main-column">
              <Card className="studio-block mb-md">
                <CardEyebrow>Account Owner</CardEyebrow>
                <CardTitle>{user.name}</CardTitle>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong>Email:</strong> {user.email}</div>
                  {user.phone && <div><strong>Phone:</strong> {user.phone}</div>}
                  <div><strong>Role:</strong> {user.role}</div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <span style={{ color: user.status === 'ACTIVE' ? 'green' : user.status === 'PENDING' ? 'orange' : 'red', fontWeight: 'bold' }}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </Card>

              {org && (
                <Card className="studio-block mb-md">
                  <CardEyebrow>Organization Details</CardEyebrow>
                  <CardTitle>{org.name}</CardTitle>
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div><strong>Type:</strong> {org.type}</div>
                    {org.website && (
                      <div>
                        <strong>Website:</strong> <a href={org.website} target="_blank" rel="noopener noreferrer">{org.website}</a>
                      </div>
                    )}
                    {org.companyCertificate && (
                      <div style={{ marginTop: '12px' }}>
                        <strong>Company Certificate:</strong><br />
                        <a href={org.companyCertificate} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                          View Document / Image
                        </a>
                      </div>
                    )}
                    {org.trainingCertificate && (
                      <div style={{ marginTop: '12px' }}>
                        <strong>Training Certificate:</strong><br />
                        <a href={org.trainingCertificate} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                          View Document / Image
                        </a>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {user.status === 'PENDING' && (
                <Card className="studio-block" style={{ border: '2px solid var(--primary)' }}>
                  <CardTitle>Moderation Decision</CardTitle>
                  <CardMeta>Approving this account will grant them full access to post {user.role === 'EMPLOYER' ? 'jobs' : 'courses'} on Hanga Works.</CardMeta>
                  <div className="studio-action-row mt-md" style={{ gap: '16px' }}>
                    <Button variant="primary" onClick={() => handleUpdateStatus('ACTIVE')} disabled={processing}>
                      {processing ? 'Processing...' : 'Approve Account'}
                    </Button>
                    <Button variant="secondary" onClick={() => handleUpdateStatus('REJECTED')} disabled={processing} style={{ color: 'red', borderColor: 'red' }}>
                      Reject Account
                    </Button>
                  </div>
                </Card>
              )}
            </main>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
