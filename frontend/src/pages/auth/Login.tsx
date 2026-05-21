import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });

  return (
    <div style={{
      width: '100%',
      maxWidth: '420px',
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--border)',
      padding: '40px',
    }}>
      <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>Welcome back</h1>
      <p style={{ margin: '0 0 28px', fontSize: '0.9rem', color: 'var(--text-soft)' }}>
        Sign in to your account to continue
      </p>

      <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Field label="Email *">
          <input
            type="email" placeholder="you@example.com" required
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </Field>

        <Field label="Password *">
          <input
            type="password" placeholder="••••••••" required
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </Field>

        <div style={{ textAlign: 'right' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent)' }}>
            Forgot password?
          </Link>
        </div>

        <button type="submit" style={btnStyle}>Sign In</button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-soft)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ fontWeight: 700, color: 'var(--accent)' }}>Register</Link>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 16px', borderRadius: '14px',
  border: '1px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
  transition: 'border-color 180ms', boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  width: '100%', padding: '13px', borderRadius: '14px', border: 'none',
  background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
  color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
  boxShadow: '0 12px 28px rgba(63,102,244,0.28)',
};
