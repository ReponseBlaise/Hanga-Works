import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardTitle, CardMeta, CardEyebrow } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getManageableCertificates } from '../../services/certificates.service';

export default function InstitutionCertifications() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getManageableCertificates()
      .then((data) => {
        if (active) setCertificates(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <aside className="app-shell-sidebar">
          <div className="app-shell-brand">
            <strong>Hanga Works</strong>
            <span>Institution Menu</span>
          </div>
          <nav className="app-shell-nav">
            <Link to="/institution/dashboard" className="app-shell-nav__item">Dashboard</Link>
            <Link to="/courses/new" className="app-shell-nav__item">Create Course</Link>
            <Link to="/institution/mentors" className="app-shell-nav__item">Mentors</Link>
            <Link to="/institution/certifications" className="app-shell-nav__item is-active">Certifications</Link>
            <Link to="/profile" className="app-shell-nav__item">Institution Profile</Link>
          </nav>
        </aside>

        <div className="studio-dashboard dashboard-redesign">
          <header className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Certification Center</p>
              <h1 className="display">Issued Credentials</h1>
              <p className="lead">Manage and verify certificates awarded to learners who completed your courses.</p>
            </div>
            <div className="dashboard-redesign__headline-stats">
              <div>
                <span>Total Issued</span>
                <strong>{loading ? '...' : certificates.length}</strong>
              </div>
            </div>
          </header>

          <section className="dashboard-redesign__layout mt-lg">
            <main className="dashboard-main-column">
              <Card className="studio-block">
                <div className="studio-section__head">
                  <div>
                    <p className="eyebrow">Credential registry</p>
                    <h2>Certificate Database</h2>
                  </div>
                </div>

                <div className="studio-stack mt-md">
                  {loading ? (
                    <CardMeta>Loading certificates...</CardMeta>
                  ) : certificates.length === 0 ? (
                    <div className="studio-inline-item">
                      <div>
                        <strong>No certificates issued yet</strong>
                        <p>Certificates are automatically generated when learners complete your courses.</p>
                      </div>
                    </div>
                  ) : (
                    certificates.map((cert) => (
                      <Card key={cert.id} className="studio-job-card">
                        <div className="studio-job-card__head">
                          <div>
                            <CardEyebrow>{cert.course?.title}</CardEyebrow>
                            <CardTitle>{cert.user?.name}</CardTitle>
                            <CardMeta>{cert.user?.email}</CardMeta>
                          </div>
                          <span className="dashboard-chip">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="studio-action-row mt-md">
                          <Button href={`/api/certificates/${cert.code}/download`} variant="primary" target="_blank" rel="noopener noreferrer">Download PDF</Button>
                          <Button to={`/certifications/verify/${cert.code}`} variant="secondary">Public Link</Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Card>
            </main>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
