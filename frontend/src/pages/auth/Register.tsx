import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/auth.service';
import { REGISTER_ROLES, type PublicRegisterRole } from '../../constants/roles';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '' as '' | PublicRegisterRole,
    certificate: null as File | null,
  });
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--accent)';
  };
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--border)';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    authService
      .register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role || undefined,
        certificate: form.certificate || undefined,
      })
      .then((user) => {
        if (user) {
          signIn('user' in user ? user.user : user);
          const userRole = ('user' in user ? user.user : user)?.role?.toUpperCase?.() ?? '';
          if (userRole === 'MENTOR') {
            navigate('/mentors/dashboard');
            return;
          }
          if (userRole === 'INSTITUTION') {
            navigate('/institution/dashboard');
            return;
          }
          if (userRole === 'EMPLOYER') {
            navigate('/employer');
            return;
          }
          navigate('/dashboard');
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err?.response?.data?.message || err.message || 'Registration failed. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div
      className="auth-card auth-card--centered"
      style={{
        width: '100%',
        maxWidth: '460px',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border)',
        padding: '40px',
      }}
    >
      <p style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)' }}>
        Register
      </p>
      <h1 style={{ margin: '0 0 4px', fontSize: '1.7rem', fontWeight: 700, color: 'var(--text)' }}>
        Create your account
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: 'var(--text-soft)' }}>
        Choose the account type that matches how you will use Hanga Works.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Field label="Full name *">
          <input
            type="text"
            placeholder="Your full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
            onFocus={focus}
            onBlur={blur}
          />
        </Field>

        <Field label="Email *">
          <input
            type="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
            onFocus={focus}
            onBlur={blur}
          />
        </Field>

        <Field label="Phone">
          <input
            type="tel"
            placeholder="+250..."
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={inputStyle}
            onFocus={focus}
            onBlur={blur}
          />
        </Field>

        <Field label="I am joining as *">
          <select
            required
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as PublicRegisterRole })}
            style={inputStyle}
            onFocus={focus}
            onBlur={blur}
          >
            <option value="">Select account type</option>
            {REGISTER_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {form.role ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: '4px' }}>
              {REGISTER_ROLES.find((r) => r.value === form.role)?.description}
            </span>
          ) : null}
        </Field>

        {(form.role === 'EMPLOYER' || form.role === 'INSTITUTION') && (
          <Field label="Upload Company/Institution Certificate *">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              required
              onChange={(e) => setForm({ ...form, certificate: e.target.files?.[0] || null })}
              style={inputStyle}
              onFocus={focus}
              onBlur={blur}
            />
          </Field>
        )}

        <Field label="Password *">
          <input
            type="password"
            placeholder="At least 6 characters"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={inputStyle}
            onFocus={focus}
            onBlur={blur}
          />
        </Field>

        <button type="submit" className="button button-primary auth-register-submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
        {error ? <p style={{ color: '#dc2626', fontSize: '0.9rem', margin: 0 }}>{error}</p> : null}
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-soft)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ fontWeight: 600, color: 'var(--accent)' }}>Sign in</Link>
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
  width: '100%',
  padding: '11px 16px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 180ms',
  boxSizing: 'border-box',
};
