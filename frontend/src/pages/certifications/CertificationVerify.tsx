import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyCertificate, LearnerCertificate } from '../../services/certificates.service';
import { API_BASE_URL } from '../../services/api';
import { Button } from '../../components/ui/Button';

export default function CertificationVerify() {
  const { token } = useParams();
  const [cert, setCert] = useState<LearnerCertificate | null>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(token ? null : 'No verification token provided.');

  useEffect(() => {
    if (!token) return;

    let active = true;
    verifyCertificate(token)
      .then((data) => {
        if (!active) return;
        setCert(data ?? null);
      })
      .catch((err) => {
        console.error('Verification failed', err);
        if (active) setError('Certificate could not be verified.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="page-shell">
      <header className="page-head">
        <h1>Verify Certificate</h1>
      </header>

      {loading ? (
        <p>Verifying…</p>
      ) : error ? (
        <div className="error">{error}</div>
      ) : cert ? (
        <div className="card card--info">
          <h2>{cert.courseTitle}</h2>
          <p>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
          <p>
            <Button href={`${API_BASE_URL}/certificates/${cert.code}/download`} variant="ghost" target="_blank" rel="noreferrer">Download PDF</Button>
          </p>
          <p>Certificate ID: {cert.id}</p>
          <p>
            <Link to="/">Return home</Link>
          </p>
        </div>
      ) : (
        <div className="empty-state">
          <p>No certificate found for this token.</p>
          <p>
            <Link to="/">Return home</Link>
          </p>
        </div>
      )}
    </div>
  );
}
