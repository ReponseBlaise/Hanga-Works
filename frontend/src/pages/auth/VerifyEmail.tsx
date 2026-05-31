import { Link } from 'react-router-dom';

export default function VerifyEmail() {
  return (
    <div style={{
      width: '100%',
      maxWidth: '420px',
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--border)',
      padding: '48px 40px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: 'var(--radius-lg)',
        background: 'var(--accent-soft)',
        display: 'grid', placeItems: 'center',
        margin: '0 auto 24px',
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
          stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="3" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>

      <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)' }}>
        Check your inbox
      </p>
      <h1 style={{ margin: '0 0 12px', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>
        Verify your email
      </h1>
      <p style={{ margin: '0 0 28px', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-soft)' }}>
        We've sent a verification link to your email address. Click the link to activate your account.
      </p>

      <div style={{
        background: 'var(--accent-soft)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '16px 20px', textAlign: 'left', marginBottom: '28px',
      }}>
        <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>
          Didn't receive the email?
        </p>
        <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-soft)', fontSize: '0.85rem', lineHeight: 1.8 }}>
          <li>Check your spam or junk folder</li>
          <li>Make sure you entered the correct email</li>
        </ul>
      </div>

      <button style={{
        width: '100%', padding: '13px', borderRadius: 'var(--radius-md)', border: 'none',
        background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
        color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
        boxShadow: '0 12px 28px rgba(63,102,244,0.28)', marginBottom: '20px',
      }}>
        Resend verification email
      </button>

      <Link to="/login" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-soft)' }}>
        ← Back to Sign In
      </Link>
    </div>
  );
}
