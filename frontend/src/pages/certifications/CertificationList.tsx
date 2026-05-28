import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { getMyCertificates, LearnerCertificate } from '../../services/certificates.service';
import { useAuth } from '../../context/AuthContext';
import { Card, CardEyebrow, CardTitle, CardMeta } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function CertificationList() {
  const { isAuthenticated } = useAuth();
  const [certs, setCerts] = useState<LearnerCertificate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) return;

    getMyCertificates()
      .then((data) => {
        if (!active) return;
        setCerts(data ?? []);
      })
      .catch((err) => {
        console.error('Failed to load certificates', err);
        if (active) setError('Could not load certificates.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <SiteLayout>
      <div className="page-shell">
        <header className="page-head">
          <h1>Certificates</h1>
          <p className="muted">Verified credentials issued to your account.</p>
        </header>

        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : certs && certs.length > 0 ? (
          <div className="card-stack">
            {certs.map((c) => (
              <Card key={c.id} className="cert-card">
                <div className="cert-card__top">
                  <div>
                    <CardEyebrow>Certificate</CardEyebrow>
                    <CardTitle>{c.courseTitle}</CardTitle>
                  </div>
                  <div>
                    <small>Issued {new Date(c.issuedAt).toLocaleDateString()}</small>
                  </div>
                </div>
                <CardMeta>
                  <div className="cert-actions">
                    {c.pdfUrl ? (
                      <Button href={c.pdfUrl} variant="ghost" target="_blank" rel="noreferrer">
                        Download PDF
                      </Button>
                    ) : null}
                    <Link to={`/certifications/verify/${c.verifyToken}`} className="link">Verify</Link>
                  </div>
                </CardMeta>
              </Card>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No certificates found.</p>
            <Button to="/courses" variant="primary">Browse courses</Button>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
