import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { getMyCertificates, LearnerCertificate } from '../../services/certificates.service';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/api';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function CertificationList() {
  const { isAuthenticated } = useAuth();
  const [certs, setCerts] = useState<LearnerCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) return;
    getMyCertificates()
      .then((data) => { if (active) setCerts(data ?? []); })
      .catch((err) => { console.error(err); if (active) setError('Could not load certificates.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <SiteLayout>
      <section className="studio-catalog">
        <section className="studio-catalog__hero" style={{
          backgroundImage: "linear-gradient(to right, rgba(0,10,40,0.85) 0%, rgba(0,10,40,0.45) 100%), url('https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
        }}>
          <div className="studio-catalog__headline">
            <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.8)' }}>My credentials</p>
            <h1 className="display" style={{ color: 'white' }}>Verified certificates</h1>
            <p className="lead" style={{ color: 'rgba(255,255,255,0.9)' }}>Download, share, and verify your digital certificates. Each credential is linked to a course you completed on Hanga Works.</p>
            <div className="studio-action-row">
              <Button to="/courses" variant="secondary">Browse courses</Button>
              <Button to="/certifications/verify" variant="primary">Verify a certificate</Button>
            </div>
          </div>
          <div className="studio-catalog__stats">
            <div><span>Certificates earned</span><strong style={{ color: 'white' }}>{loading ? '...' : certs.length}</strong></div>
            <div><span>Available to download</span><strong style={{ color: 'white' }}>{loading ? '...' : certs.filter((c) => c.pdfUrl).length}</strong></div>
          </div>
        </section>

        <main className="studio-catalog__results" style={{ padding: '0' }}>
          <div className="studio-catalog__toolbar">
            <div>
              <p className="eyebrow">Your credentials</p>
              <h2>{loading ? '…' : `${certs.length} certificate${certs.length !== 1 ? 's' : ''} issued`}</h2>
            </div>
          </div>

          {loading ? (
            <Card className="studio-block"><CardMeta>Loading certificates…</CardMeta></Card>
          ) : error ? (
            <Card className="studio-block"><CardTitle>Could not load certificates</CardTitle><CardMeta>{error}</CardMeta></Card>
          ) : certs.length === 0 ? (
            <Card className="studio-block">
              <CardTitle>No certificates yet</CardTitle>
              <CardMeta>Complete a course to earn your first credential.</CardMeta>
              <div className="studio-action-row">
                <Button to="/courses" variant="primary" className="button--pill">Browse courses</Button>
              </div>
            </Card>
          ) : (
            <div className="studio-catalog-grid">
              {certs.map((c) => (
                <Card key={c.id} className="studio-catalog-card">
                  <div className="studio-catalog-card__head">
                    <div>
                      <CardEyebrow>Certificate</CardEyebrow>
                      <CardTitle>{c.courseTitle}</CardTitle>
                    </div>
                    <span className="dashboard-chip">Verified</span>
                  </div>
                  <CardMeta>Issued {new Date(c.issuedAt).toLocaleDateString()}</CardMeta>
                  <CardMeta>Code: <code style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{c.code}</code></CardMeta>
                  <div className="studio-action-row">
                    <Link to={`/certifications/verify/${c.code}`} className="button button-secondary">Verify</Link>
                    <Button href={`${API_BASE_URL}/certificates/${c.code}/download`} variant="primary" className="button--pill" target="_blank" rel="noreferrer">
                      Download PDF
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </section>
    </SiteLayout>
  );
}
