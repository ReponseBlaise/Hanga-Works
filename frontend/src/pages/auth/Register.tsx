import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/auth.service';

const ROLES = [
  { value: 'LEARNER', label: 'Job Seeker' },
  { value: 'EMPLOYER', label: 'Employer' },
  { value: 'INSTITUTION', label: 'Institution' },
  { value: 'MENTOR', label: 'Mentor' },

];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: '' as '' | 'LEARNER' | 'EMPLOYER' | 'INSTITUTION' | 'MENTOR',
  });
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = 'var(--accent)');
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = 'var(--border)');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    authService.register({ name: form.name, email: form.email, password: form.password, role: form.role || undefined })
        .then((user) => {
          if (user) {
            signIn('user' in user ? user.user : user);
            navigate('/');
          }
      })
      .catch((err) => {
        console.error(err);
        setError(err?.response?.data?.message || err.message || 'Registration failed');
      })
      .finally(() => setLoading(false));
  };

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
        Register
      </p>
      <h1 style={{ margin: '0 0 4px', fontSize: '1.7rem', fontWeight: 800, color: 'var(--text)' }}>
        Start for free Today
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: 'var(--text-soft)' }}>
        Create your account with the same fields used by the backend: name, email, password, and role.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Field label="Full Name *">
          <input type="text" placeholder="Enter full name" required
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            style={inputStyle} onFocus={focus} onBlur={blur} />
        </Field>

        <Field label="Email *">
          <input type="email" placeholder="example@gmail.com" required
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            style={inputStyle} onFocus={focus} onBlur={blur} />
        </Field>

        <Field label="Role">
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as any })}
            style={inputStyle}
            onFocus={focus}
            onBlur={blur}
          >
            <option value="">Select role</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Password *">
          <input type="password" placeholder="••••••••" required
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            style={inputStyle} onFocus={focus} onBlur={blur} />
        </Field>

        <button type="submit" style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }} disabled={loading}>{loading ? 'Creating…' : 'Submit & Register'}</button>
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p>}
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-soft)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ fontWeight: 700, color: 'var(--accent)' }}>Sign in</Link>
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
  width: '100%', padding: '11px 16px', borderRadius: '10px',
  border: '1px solid var(--border)', background: 'var(--bg)',
  color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
  transition: 'border-color 180ms', boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
  background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
  color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
  boxShadow: '0 12px 28px rgba(63,102,244,0.28)', marginTop: '4px',
};
