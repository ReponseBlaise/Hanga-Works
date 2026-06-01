import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/auth.service';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    authService.login({ email: form.email, password: form.password })
      .then((data) => {
        if (data?.user) {
          signIn(data.user);
          const role = (data.user.role ?? '').toLowerCase();
          if (role === 'employer') {
            navigate('/employer');
            return;
          }
          if (role === 'admin') {
            navigate('/admin');
            return;
          }
          navigate('/dashboard');
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err?.response?.data?.message || err.message || 'Login failed');
      })
      .finally(() => setLoading(false));
  };

  const focus = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = 'var(--accent)');
  const blur = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = 'var(--border)');

  return (
    <div style={{
      width: '100%',
      maxWidth: '460px',
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--border)',
      padding: '40px',
    }}>
      <p style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)' }}>
        Welcome Back
      </p>
      <h1 style={{ margin: '0 0 4px', fontSize: '1.7rem', fontWeight: 800, color: 'var(--text)' }}>
        Sign In
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: 'var(--text-soft)' }}>
        Access your Hanga Works workspace.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Field label="Email">
          <input
            type="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle} onFocus={focus} onBlur={blur}
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={inputStyle} onFocus={focus} onBlur={blur}
          />
        </Field>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', margin: '4px 0' }}>
          <Link to="/forgot-password" style={{ color: 'var(--text-soft)', textDecoration: 'underline' }}>Forgot password?</Link>
        </div>

        <button type="submit" style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        {error ? <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p> : null}
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-soft)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ fontWeight: 700, color: 'var(--accent)' }}>Sign up</Link>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 16px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
  transition: 'border-color 180ms', boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  width: '100%', padding: '13px', borderRadius: 'var(--radius-md)', border: 'none',
  background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
  color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
  boxShadow: '0 12px 28px rgba(63,102,244,0.28)', marginTop: '4px',
};
