import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  const focus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--accent)';
  };
  const blur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--border)';
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '920px',
      minHeight: '520px',
      padding: '48px 24px 56px',
      background: '#ffffff',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--border)',
    }}>
      <Decorations />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto',
      }}>
        <p style={{
          margin: '0 0 12px',
          textAlign: 'center',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--accent)',
        }}>
          Forgot Password
        </p>

        <h1 style={{
          margin: '0 0 16px',
          textAlign: 'center',
          fontSize: 'clamp(2rem, 4vw, 2.75rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          lineHeight: 1.15,
        }}>
          Reset Your Password
        </h1>

        <p style={{
          margin: '0 0 36px',
          textAlign: 'center',
          fontSize: '0.95rem',
          lineHeight: 1.65,
          color: 'var(--text-soft)',
          maxWidth: '380px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Enter email address associated with your account and we&apos;ll send you a link to reset your password
        </p>

        <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
              Email address *
            </label>
            <input
              type="email"
              placeholder="stevenjob@gmail.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={focus}
              onBlur={blur}
            />
          </div>

          <button type="submit" style={btnStyle}>
            Continue
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '28px',
          fontSize: '0.92rem',
          color: 'var(--text-soft)',
        }}>
          Don&apos;t have an Account?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--text)' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function Decorations() {
  return (
    <>
      {/* Bottom-left arc */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '-80px',
          bottom: '-100px',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          border: '1px solid rgba(219, 228, 243, 0.9)',
          pointerEvents: 'none',
        }}
      />

      {/* Right-side illustration */}
      <svg
        aria-hidden
        viewBox="0 0 280 320"
        style={{
          position: 'absolute',
          right: '-20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 'min(280px, 35vw)',
          height: 'auto',
          pointerEvents: 'none',
        }}
      >
        <ellipse cx="200" cy="160" rx="110" ry="100" fill="rgba(183, 198, 245, 0.45)" />
        <rect x="118" y="72" width="118" height="78" rx="18" fill="#fff" stroke="#c5d0e4" strokeWidth="1.5" />
        <rect x="138" y="108" width="118" height="78" rx="18" fill="#fff" stroke="#c5d0e4" strokeWidth="1.5" />
        <rect x="158" y="144" width="118" height="78" rx="18" fill="#fff" stroke="#c5d0e4" strokeWidth="1.5" />
        <line x1="200" y1="48" x2="260" y2="48" stroke="#c5d0e4" strokeWidth="2" strokeLinecap="round" />
        <line x1="200" y1="62" x2="240" y2="62" stroke="#c5d0e4" strokeWidth="2" strokeLinecap="round" />
        <line x1="200" y1="76" x2="220" y2="76" stroke="#c5d0e4" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  background: '#ffffff',
  color: 'var(--text)',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 180ms',
  boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  borderRadius: '10px',
  border: 'none',
  background: 'var(--text)',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'opacity 180ms',
};
