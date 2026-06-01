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

  return (
    <div className="auth-studio-card auth-studio-card--minimal">
      <h1 className="auth-card__title">Login</h1>

      <form onSubmit={handleSubmit} className="auth-form auth-form--studio">
        <Field label="Email">
          <input
            type="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="auth-input"
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="auth-input"
          />
        </Field>

        <div className="auth-page__meta">
          <Link to="/forgot-password" className="auth-support__link">Forgot password?</Link>
          <Link to="/register" className="auth-support__link">Register</Link>
        </div>

        <button type="submit" className="button button-primary button--lg button--pill auth-submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        {error ? <p className="text-danger">{error}</p> : null}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      {children}
    </div>
  );
}
